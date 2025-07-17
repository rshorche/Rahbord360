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

  const { addAction, deleteAction, actions: portfolioActions } = useStockTradesStore();
  const { priceHistory } = usePriceHistoryStore();
  const [activeTab, setActiveTab] = useState("open");
  const [modal, setModal] = useState({ type: null, data: null });

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

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
    const success = await updatePosition(tradeToEdit.id, formData);
    if (success) closeModal();
  }, [updatePosition, closeModal, modal.data]);

  const handleManageSubmit = useCallback(async (formData) => {
    const { status, closing_date, contracts_count } = formData;
    const position = modal.data;
    if (!position) return;

    const contractsToClose = Number(contracts_count);
    const remainingContracts = Math.abs(position.contracts_count) - contractsToClose;

    if (contractsToClose <= 0 || contractsToClose > Math.abs(position.contracts_count)) {
      showErrorAlert("خطا", `تعداد قرارداد باید بین 1 و ${Math.abs(position.contracts_count)} باشد.`);
      return;
    }

    const openingTrade = position.history.find(t => t.trade_type.includes('open'));
    if (!openingTrade) {
      showErrorAlert("خطا", "معامله اولیه برای بستن پوزیشن پیدا نشد.");
      return;
    }
    
    if (status === 'EXERCISED') {
      if (position.position_type !== 'Long') {
        showErrorAlert("خطا", "فقط پوزیشن‌های خرید (Long) قابل اعمال هستند.");
        return;
      }
      const isCall = position.option_type === 'call';
      const totalShares = contractsToClose * 1000;
      const stockAction = { type: isCall ? 'buy' : 'sell', symbol: position.underlying_symbol, date: new DateObject(closing_date).format("YYYY-MM-DD"), quantity: totalShares, price: position.strike_price, commission: 0, notes: `اعمال ${contractsToClose} عدد اختیار ${position.option_symbol} [ref_opt:${openingTrade.id}]` };
      await addAction(stockAction, true);
    }
    
    const newClosedTrade = { ...openingTrade, contracts_count: contractsToClose, status: status, closing_date: new DateObject(closing_date).format("YYYY-MM-DD"), notes: `بسته شدن ${contractsToClose} قرارداد به دلیل ${status}` };
    delete newClosedTrade.id;
    await addPosition(newClosedTrade);

    if (remainingContracts > 0.001) {
        await updatePosition(openingTrade.id, { ...openingTrade, contracts_count: remainingContracts });
    } else {
        await deletePosition(openingTrade.id);
    }
    
    showSuccessToast("عملیات با موفقیت انجام شد.");
    closeModal();
  }, [modal.data, addAction, addPosition, updatePosition, deletePosition, closeModal]);
  
  const handleReopenPosition = useCallback(async (trade) => {
    const confirmed = await showConfirmAlert("بازنشانی معامله", "آیا از بازگرداندن این معامله به حالت باز مطمئن هستید؟");
    if(confirmed){
        if (trade.status === 'EXERCISED') {
            const openingTradeIdMatch = trade.notes.match(/\[ref_opt:([a-f0-9-]+)\]/);
            if (openingTradeIdMatch && openingTradeIdMatch[1]) {
                const noteToFind = `[ref_opt:${openingTradeIdMatch[1]}]`;
                const linkedAction = portfolioActions.find(a => a.notes && a.notes.includes(noteToFind));
                if (linkedAction) {
                  await deleteAction(linkedAction.id);
                }
            }
        }
        await deletePosition(trade.id);

        const openingTrade = allTrades.find(t => t.id === trade.id && t.trade_type.includes('open'));
        if(openingTrade){
            await updatePosition(openingTrade.id, {...openingTrade, contracts_count: openingTrade.contracts_count + trade.contracts_count });
        }
        closeModal();
    }
  }, [allTrades, portfolioActions, updatePosition, deletePosition, deleteAction, closeModal]);

  const handleDeleteSingleTrade = useCallback(async (tradeId) => {
    const confirmed = await showConfirmAlert("حذف معامله", "آیا از حذف این معامله مطمئن هستید؟");
    if(confirmed) {
        await deletePosition(tradeId);
    }
  }, [deletePosition]);

  const handleDeleteAllForSymbol = useCallback(async (optionSymbol) => {
      const confirmed = await showConfirmAlert("حذف کلی پوزیشن", `آیا تمام معاملات مربوط به ${optionSymbol} حذف شوند؟`);
      if(confirmed) {
          const tradesToDelete = allTrades.filter(t => t.option_symbol === optionSymbol);
          for (const trade of tradesToDelete) {
              await deletePosition(trade.id);
          }
          closeModal();
      }
  }, [allTrades, deletePosition, closeModal]);

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