import { useState, useMemo, useEffect, useCallback } from "react";
import useCoveredCallStore from "../store/useCoveredCallStore";
import usePriceHistoryStore from "../../../shared/store/usePriceHistoryStore";
import { showConfirmAlert } from "../../../shared/utils/notifications"; 
import { calculatePositionMetrics } from "../utils/coveredCallCalculations";
import useStockTradesStore from "../../portfolio/store/useStockTradesStore";
import { processPortfolio } from "../../portfolio/utils/portfolioCalculator";

export const useCoveredCallLogic = () => {
  const {
    positions,
    isLoading,
    fetchPositions,
    addPosition,
    updatePosition,
    resolvePosition,
    deletePosition,
    reopenPosition,
  } = useCoveredCallStore();
  const { priceHistory } = usePriceHistoryStore();
  const { actions: portfolioActions } = useStockTradesStore();

  const [activeTab, setActiveTab] = useState("open");
  const [modal, setModal] = useState({ type: null, data: null });
  
  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const { openPositions, historyPositions } = useMemo(() => {
    const calculatedData = positions.map(p => {
      const currentStockPrice = priceHistory.get(p.underlying_symbol)?.price / 10 || 0;
      return calculatePositionMetrics(p, currentStockPrice);
    });
    return {
      openPositions: calculatedData.filter(p => p.status === 'OPEN'),
      historyPositions: calculatedData.filter(p => p.status !== 'OPEN'),
    };
  }, [positions, priceHistory]);

  const portfolioOpenPositions = useMemo(() => {
    if (!portfolioActions || portfolioActions.length === 0) return [];
    const pricesForCalc = Array.from(priceHistory.values());
    return processPortfolio(portfolioActions, pricesForCalc).openPositions;
  }, [portfolioActions, priceHistory]);

  const summaryMetrics = useMemo(() => {
    const totalPremiumOpen = openPositions.reduce((sum, p) => sum + p.net_premium, 0);
    const totalCapitalInvolved = openPositions.reduce((sum, p) => sum + p.capital_involved, 0);
    const totalRealizedPL = historyPositions.reduce((sum, p) => sum + p.realized_pl, 0);
    return { totalPremiumOpen, totalCapitalInvolved, totalRealizedPL };
  }, [openPositions, historyPositions]);

  const openModal = useCallback((type, data = null) => setModal({ type, data }), []);
  const closeModal = useCallback(() => setModal({ type: null, data: null }), []);

  const handleAddSubmit = useCallback(async (formData) => {
    const success = await addPosition(formData, portfolioOpenPositions);
    if (success) closeModal();
  }, [addPosition, closeModal, portfolioOpenPositions]);

  const handleEditSubmit = useCallback(async (formData) => {
    if (!modal.data) return;
    const success = await updatePosition(modal.data.id, formData, portfolioOpenPositions);
    if (success) closeModal();
  }, [updatePosition, closeModal, modal.data, portfolioOpenPositions]);

  const handleManageSubmit = useCallback(async (formData) => {
      if (!modal.data) return;
      const success = await resolvePosition(modal.data.id, formData);
      if (success) closeModal();
    }, [resolvePosition, closeModal, modal.data]);

  const handleReopenPosition = useCallback(async (position) => {
    const confirmed = await showConfirmAlert("بازگشایی پوزیشن", "آیا مطمئن هستید؟ با این کار، رویدادهای مالی مرتبط (مانند فروش سهام) حذف شده و پوزیشن به حالت باز برمی‌گردد.");
    if (confirmed) {
      const success = await reopenPosition(position);
      if (success) closeModal();
    }
  }, [reopenPosition, closeModal]);

  const handleDeletePosition = useCallback(async (position) => {
      const confirmed = await showConfirmAlert("حذف معامله", "آیا از حذف این معامله کاورد کال مطمئن هستید؟");
      if (confirmed) {
        const success = await deletePosition(position.id);
        if (success) closeModal();
      }
    }, [deletePosition, closeModal]);

  return {
    isLoading,
    activeTab,
    setActiveTab,
    openPositions,
    historyPositions,
    portfolioOpenPositions,
    summaryMetrics,
    modal,
    openModal,
    closeModal,
    handleAddSubmit,
    handleEditSubmit,
    handleManageSubmit,
    handleDeletePosition,
    handleReopenPosition,
  };
};