import { useState, useMemo, useEffect, useCallback } from "react";
import useFundTradesStore from "../store/useFundTradesStore";
import usePriceHistoryStore from "../../../shared/store/usePriceHistoryStore";
import { processFundPositions } from "../utils/fundCalculator";
import { showConfirmAlert } from "../../../shared/utils/notifications";

export const useFundTradesLogic = () => {
  const {
    trades,
    isLoading,
    fetchTrades,
    addTrade,
    updateTrade,
    deleteTrade,
  } = useFundTradesStore();
  const { priceHistory } = usePriceHistoryStore();

  const [activeTab, setActiveTab] = useState("open");
  const [modal, setModal] = useState({ type: null, data: null });

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);

  const { openPositions, closedPositions, summaryMetrics } = useMemo(() => {
    if (!trades.length || !priceHistory) {
      return { openPositions: [], closedPositions: [], summaryMetrics: {} };
    }
    const pricesForCalc = Array.from(priceHistory.values());
    const processedData = processFundPositions(trades, pricesForCalc);
    
    const metrics = {
        totalValue: processedData.openPositions.reduce((sum, p) => sum + p.currentValue, 0),
        totalCost: processedData.openPositions.reduce((sum, p) => sum + p.totalBuyCost, 0),
    };
    metrics.totalUnrealizedPL = metrics.totalValue - metrics.totalCost;

    return { ...processedData, summaryMetrics: metrics };
  }, [trades, priceHistory]);

  const openModal = useCallback((type, data = null) => setModal({ type, data }), []);
  const closeModal = useCallback(() => setModal({ type: null, data: null }), []);

  const handleAddSubmit = useCallback(async (formData) => {
    const success = await addTrade(formData);
    if (success) closeModal();
  }, [addTrade, closeModal]);

  const handleEditSubmit = useCallback(async (formData) => {
    if (!modal.data) return;
    const success = await updateTrade(modal.data.id, formData);
    if (success) closeModal();
  }, [updateTrade, closeModal, modal.data]);

  const handleDeleteTrade = useCallback(async (id) => {
    const confirmed = await showConfirmAlert("حذف معامله", "آیا از حذف این معامله مطمئن هستید؟");
    if (confirmed) {
      await deleteTrade(id);
    }
  }, [deleteTrade]);

  return {
    isLoading,
    activeTab,
    setActiveTab,
    openPositions,
    closedPositions,
    summaryMetrics,
    modal,
    openModal,
    closeModal,
    handleAddSubmit,
    handleEditSubmit,
    handleDeleteTrade,
  };
};