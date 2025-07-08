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
  } = useCoveredCallStore();
  const { priceHistory, fetchAllSymbolsFromDB } = usePriceHistoryStore();
  const { actions: portfolioActions, fetchActions: fetchPortfolioActions } = useStockTradesStore();

  const [activeTab, setActiveTab] = useState("open");
  const [modal, setModal] = useState({ type: null, data: null });

  useEffect(() => {
    fetchPositions();
    fetchAllSymbolsFromDB();
    fetchPortfolioActions();
  }, [fetchPositions, fetchAllSymbolsFromDB, fetchPortfolioActions]);

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


  const openModal = useCallback((type, data = null) => {
    setModal({ type, data });
  }, []);

  const closeModal = useCallback(() => {
    setModal({ type: null, data: null });
  }, []);

  const handleAddSubmit = useCallback(async (formData) => {
      const currentPosition = portfolioOpenPositions.find(p => p.symbol === formData.underlying_symbol);
      const availableShares = currentPosition ? currentPosition.remainingQty : 0;
      const dataToSend = { ...formData, availableShares };

      const success = await addPosition(dataToSend);
      if (success) closeModal();
    }, [addPosition, closeModal, portfolioOpenPositions]);

  const handleEditSubmit = useCallback(async (formData) => {
      if (!modal.data) return;
      const currentPosition = portfolioOpenPositions.find(p => p.symbol === formData.underlying_symbol);
      const availableShares = currentPosition ? currentPosition.remainingQty : 0;
      const dataToSend = { ...formData, availableShares };

      const success = await updatePosition(modal.data.id, dataToSend);
      if (success) closeModal();
    }, [updatePosition, closeModal, modal.data, portfolioOpenPositions]);

  const handleManageSubmit = useCallback(async (formData) => {
      if (!modal.data) return;
      const success = await resolvePosition(modal.data.id, formData);
      if (success) closeModal();
    }, [resolvePosition, closeModal, modal.data]);

  const handleDeletePosition = useCallback(async (position) => {
      const confirmed = await showConfirmAlert("حذف معامله", "آیا از حذف این معامله کاورد کال مطمئن هستید؟");
      if (confirmed) {
        await deletePosition(position.id);
        closeModal();
      }
    }, [deletePosition, closeModal]);

  return {
    isLoading,
    activeTab,
    setActiveTab,
    openPositions,
    historyPositions,
    portfolioOpenPositions,
    modal,
    openModal,
    closeModal,
    handleAddSubmit,
    handleEditSubmit,
    handleManageSubmit,
    handleDeletePosition,
  };
};