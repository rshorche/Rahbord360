import { useState, useMemo, useEffect, useCallback } from "react";
import useOptionsStore from "../store/useOptionsStore";
import { showConfirmAlert, showErrorAlert, showSuccessToast } from "../../../shared/utils/notifications";
import { processOptionsPositions } from "../utils/optionsCalculations";
import useStockTradesStore from "../../portfolio/store/useStockTradesStore";
import { DateObject } from "react-multi-date-picker";
import usePriceHistoryStore from "../../../shared/store/usePriceHistoryStore";

export const useOptionsLogic = () => {
  const {
    positions: allTrades,
    isLoading,
    fetchPositions,
    addPosition,
    updatePosition,
    deletePosition,
  } = useOptionsStore();

  const { deleteAction, addAction, actions: portfolioActions, fetchActions: fetchStockActions } = useStockTradesStore();
  const { priceHistory } = usePriceHistoryStore();
  const [activeTab, setActiveTab] = useState("open");
  const [modal, setModal] = useState({ type: null, data: null });

  useEffect(() => {
    fetchPositions();
    fetchStockActions();
  }, [fetchPositions, fetchStockActions]);

  const { openPositions, historyPositions } = useMemo(() => {
    if (!allTrades.length || !priceHistory) {
      return { openPositions: [], historyPositions: [] };
    }
    return processOptionsPositions(allTrades, priceHistory);
  }, [allTrades, priceHistory]);

  const summaryMetrics = useMemo(() => {
    if (!openPositions) return { totalCurrentValue: 0, totalCostBasis: 0, totalUnrealizedPL: 0 };
    return openPositions.reduce((acc, pos) => {
      acc.totalCurrentValue += pos.current_value || 0;
      acc.totalCostBasis += pos.cost_basis || 0;
      acc.totalUnrealizedPL += pos.unrealized_pl || 0;
      return acc;
    }, { totalCurrentValue: 0, totalCostBasis: 0, totalUnrealizedPL: 0 });
  }, [openPositions]);

  const openModal = useCallback((type, data = null) => setModal({ type, data }), []);
  const closeModal = useCallback(() => setModal({ type: null, data: null }), []);

  const handleAddSubmit = useCallback(async (formData) => {
    const success = await addPosition(formData);
    if (success) closeModal();
  }, [addPosition, closeModal]);

  const handleEditSubmit = useCallback(async (formData) => {
    const tradeToEdit = modal.data;
    if (!tradeToEdit) return;

    if (tradeToEdit.status === 'EXERCISED') {
      const openingTradeInHistory = allTrades.find(t => t.option_symbol === tradeToEdit.option_symbol && t.trade_type.includes('open'));
      if (openingTradeInHistory) {
        const noteToFind = `[ref_opt:${openingTradeInHistory.id}]`;
        const linkedAction = portfolioActions.find(a => a.notes && a.notes.includes(noteToFind));
        if (linkedAction) {
          await deleteAction(linkedAction.id, true);
        }
      }
    }
    
    const success = await updatePosition(tradeToEdit.id, formData);
    if (success) {
        if (formData.status === 'EXERCISED') {
            const openingTradeInHistory = allTrades.find(t => t.option_symbol === formData.option_symbol && t.trade_type.includes('open'));
            if(openingTradeInHistory) {
                const isCall = formData.option_type === 'call';
                const stockAction = {
                    type: isCall ? 'buy' : 'sell',
                    symbol: formData.underlying_symbol,
                    date: new DateObject(formData.trade_date).format("YYYY-MM-DD"),
                    quantity: Number(formData.contracts_count) * 1000,
                    price: Number(formData.strike_price),
                    commission: 0,
                    notes: `اعمال ${formData.contracts_count} عدد اختیار ${formData.option_symbol} [ref_opt:${openingTradeInHistory.id}]`
                };
                await addAction(stockAction, true);
            }
        }
        closeModal();
    }
  }, [modal.data, updatePosition, closeModal, portfolioActions, deleteAction, addAction, allTrades]);

  const handleManageSubmit = useCallback(async (formData) => {
    if (!modal.data) return;
    const position = modal.data;
    const openingTrade = position.history.find(t => t.trade_type.includes('open'));
    if (!openingTrade) {
      showErrorAlert("خطا", "معامله اولیه برای بستن پوزیشن پیدا نشد.");
      return;
    }
    const closingTradePayload = {
        ...openingTrade,
        id: undefined, 
        trade_type: position.position_type === 'Long' ? 'sell_to_close' : 'buy_to_close',
        contracts_count: formData.contracts_count,
        status: formData.status,
        closing_date: new DateObject(formData.closing_date).format("YYYY-MM-DD"),
        trade_date: new DateObject(formData.closing_date).format("YYYY-MM-DD"),
        notes: `بسته شدن ${formData.contracts_count} قرارداد به دلیل ${formData.status === 'EXPIRED' ? 'انقضا' : 'اعمال'}`,
        premium: 0, 
    };
    
    const success = await addPosition(closingTradePayload);

    if (success && formData.status === 'EXERCISED') {
        const isCall = openingTrade.option_type === 'call';
        const stockAction = {
            type: isCall ? 'buy' : 'sell',
            symbol: openingTrade.underlying_symbol,
            date: new DateObject(formData.closing_date).format("YYYY-MM-DD"),
            quantity: Number(formData.contracts_count) * 1000,
            price: Number(openingTrade.strike_price),
            commission: 0,
            notes: `اعمال ${formData.contracts_count} عدد اختیار ${openingTrade.option_symbol} [ref_opt:${openingTrade.id}]`
        };
        await addAction(stockAction, true);
    }

    if (success) closeModal();
  }, [modal.data, addPosition, closeModal, addAction]);
  
  const handleDeleteSingleTrade = useCallback(async (tradeId, confirm = true) => {
    const confirmed = confirm ? await showConfirmAlert("حذف معامله", "آیا از حذف این معامله مطمئن هستید؟") : true;
    if(!confirmed) return;

    const tradeToDelete = allTrades.find(t => t.id === tradeId);
    if (!tradeToDelete) return;
    
    try {
        if (tradeToDelete.status === 'EXERCISED') {
            const openingTradeInHistory = allTrades.find(t => t.option_symbol === tradeToDelete.option_symbol && t.trade_type.includes('open'));
            if(openingTradeInHistory) {
                const noteToFind = `[ref_opt:${openingTradeInHistory.id}]`;
                const linkedAction = portfolioActions.find(a => a.notes && a.notes.includes(noteToFind));
                if (linkedAction) {
                    await deleteAction(linkedAction.id, true);
                }
            }
        }
        
        await deletePosition(tradeId);
        if (confirm) {
            showSuccessToast("معامله با موفقیت حذف شد.");
            closeModal();
        }

    } catch (error) {
        showErrorAlert("خطا در حذف معامله.", error.message);
    }
  }, [allTrades, portfolioActions, deletePosition, deleteAction, closeModal]);

  const handleReopenPosition = useCallback(async (closingTrade) => {
    await handleDeleteSingleTrade(closingTrade.id);
  }, [handleDeleteSingleTrade]);

  const handleDeleteAllForSymbol = useCallback(async (optionSymbol) => {
      const confirmed = await showConfirmAlert("حذف کلی پوزیشن", `آیا تمام معاملات مربوط به ${optionSymbol} حذف شوند؟ این عملیات غیرقابل بازگشت است.`);
      if(confirmed) {
          const tradesToDelete = allTrades.filter(t => t.option_symbol === optionSymbol);
          for (const trade of tradesToDelete) {
              await handleDeleteSingleTrade(trade.id, false); 
          }
          showSuccessToast("تمام معاملات پوزیشن با موفقیت حذف شد.");
          closeModal();
      }
  }, [allTrades, handleDeleteSingleTrade, closeModal]);

  return {
    isLoading,
    activeTab,
    setActiveTab,
    openPositions,
    historyPositions,
    summaryMetrics,
    modal,
    openModal,
    closeModal,
    handleAddSubmit,
    handleEditSubmit,
    handleManageSubmit,
    handleDeleteAllForSymbol,
    handleReopenPosition,
    handleDeleteSingleTrade,
  };
};