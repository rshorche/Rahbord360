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

  const { addAction, deleteAction, actions: portfolioActions, fetchActions: fetchStockActions } = useStockTradesStore();
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

  const manageLinkedStockTrade = useCallback(async (optionTrade, actionType = 'sync') => {
    const { id, status, option_type, underlying_symbol, trade_date, contracts_count, strike_price, option_symbol } = optionTrade;
    const noteToFind = `[ref_opt:${id}]`;
    const linkedAction = portfolioActions.find(a => a.notes && a.notes.includes(noteToFind));

    if (linkedAction) {
      const deleteSuccess = await deleteAction(linkedAction.id, true);
      if (!deleteSuccess) {
        showErrorAlert("خطا در حذف معامله سهام مرتبط قدیمی");
        return false;
      }
    }

    if (actionType === 'delete') {
      return true;
    }

    if (status === 'EXERCISED') {
      const isCall = option_type === 'call';
      const stockAction = {
        type: isCall ? 'buy' : 'sell',
        symbol: underlying_symbol,
        date: new DateObject(trade_date).format("YYYY-MM-DD"),
        quantity: Number(contracts_count) * 1000,
        price: Number(strike_price),
        commission: 0,
        notes: `اعمال ${contracts_count} عدد اختیار ${option_symbol} ${noteToFind}`
      };
      const addSuccess = await addAction(stockAction, true);
      if (!addSuccess) {
        showErrorAlert("خطا در ایجاد معامله سهام جدید");
        return false;
      }
    }
    return true;
  }, [portfolioActions, addAction, deleteAction]);

  const handleAddSubmit = useCallback(async (formData) => {
    const newTrade = await addPosition(formData);
    if (newTrade) {
      if (newTrade.status === 'EXERCISED') {
        await manageLinkedStockTrade(newTrade);
      }
      closeModal();
    }
  }, [addPosition, closeModal, manageLinkedStockTrade]);

  const handleEditSubmit = useCallback(async (formData) => {
    const tradeToEdit = modal.data;
    if (!tradeToEdit) return;
  
    const updatedTrade = await updatePosition(tradeToEdit.id, formData);
    if (updatedTrade) {
      await manageLinkedStockTrade(updatedTrade);
      closeModal();
    }
  }, [modal.data, updatePosition, closeModal, manageLinkedStockTrade]);

  const handleManageSubmit = useCallback(async (formData) => {
    if (!modal.data) return;
    const position = modal.data;
    const openingTrade = position.history.find(t => t.trade_type.includes('open'));
    if (!openingTrade) {
      showErrorAlert("خطا", "معامله اولیه برای بستن پوزیشن پیدا نشد.");
      return;
    }
    const closingDate = new DateObject(formData.closing_date).format("YYYY-MM-DD");
    const closingTradePayload = {
        ...openingTrade,
        id: undefined, 
        trade_type: position.position_type === 'Long' ? 'sell_to_close' : 'buy_to_close',
        contracts_count: formData.contracts_count,
        status: formData.status,
        closing_date: closingDate,
        trade_date: closingDate,
        notes: `بسته شدن ${formData.contracts_count} قرارداد به دلیل ${formData.status === 'EXPIRED' ? 'انقضا' : 'اعمال'}`,
        premium: 0, 
    };
    
    const newTrade = await addPosition(closingTradePayload);

    if (newTrade && newTrade.status === 'EXERCISED') {
        await manageLinkedStockTrade(newTrade);
    }

    if (newTrade) closeModal();
  }, [modal.data, addPosition, closeModal, manageLinkedStockTrade]);
  
  const handleDeleteSingleTrade = useCallback(async (tradeId, confirm = true) => {
    const confirmed = confirm ? await showConfirmAlert("حذف معامله", "آیا از حذف این معامله مطمئن هستید؟") : true;
    if(!confirmed) return false;

    const tradeToDelete = allTrades.find(t => t.id === tradeId);
    if (!tradeToDelete) return false;
    
    if(tradeToDelete.status === 'EXERCISED'){
        const cleanupSuccess = await manageLinkedStockTrade(tradeToDelete, 'delete');
        if (!cleanupSuccess) return false;
    }
        
    const deleteSuccess = await deletePosition(tradeId);
    if (deleteSuccess && confirm) {
        showSuccessToast("معامله با موفقیت حذف شد.");
    }
    return deleteSuccess;
  }, [allTrades, deletePosition, manageLinkedStockTrade]);

  const handleReopenPosition = useCallback(async (closingTrade) => {
    const success = await handleDeleteSingleTrade(closingTrade.id, true);
    if (success) closeModal();
  }, [handleDeleteSingleTrade, closeModal]);

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
    allTrades,
    priceHistory,
    modal,
    openModal,
    closeModal,
    activeTab,
    setActiveTab,
    openPositions,
    historyPositions,
    summaryMetrics,
    handleAddSubmit,
    handleEditSubmit,
    handleManageSubmit,
    handleDeleteAllForSymbol,
    handleReopenPosition,
    handleDeleteSingleTrade,
  };
};