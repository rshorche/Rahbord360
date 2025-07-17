import { useState, useMemo, useEffect, useCallback } from "react";
import useCoveredCallStore from "../store/useCoveredCallStore";
import usePriceHistoryStore from "../../../shared/store/usePriceHistoryStore";
import { showConfirmAlert, showErrorAlert } from "../../../shared/utils/notifications";
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

  // --- محاسبات جدید برای کارت‌ها ---
  const summaryMetrics = useMemo(() => {
    const totalPremiumOpen = openPositions.reduce((sum, p) => sum + p.net_premium, 0);
    const totalCapitalInvolved = openPositions.reduce((sum, p) => sum + p.capital_involved, 0);
    const totalRealizedPL = historyPositions.reduce((sum, p) => sum + p.realized_pl, 0);
    return { totalPremiumOpen, totalCapitalInvolved, totalRealizedPL };
  }, [openPositions, historyPositions]);
  // ---------------------------------

  const openModal = useCallback((type, data = null) => setModal({ type, data }), []);
  const closeModal = useCallback(() => setModal({ type: null, data: null }), []);

  const handleAddSubmit = useCallback(async (formData) => {
    const { contracts_count, shares_per_contract, underlying_symbol } = formData;
    const requiredShares = (Number(contracts_count) || 0) * (Number(shares_per_contract) || 1000);
    const currentPortfolioPosition = portfolioOpenPositions.find(p => p.symbol === underlying_symbol);
    const availableSharesInPortfolio = currentPortfolioPosition ? currentPortfolioPosition.remainingQty : 0;
    const sharesCoveringOtherPositions = openPositions
      .filter(p => p.underlying_symbol === underlying_symbol)
      .reduce((sum, p) => sum + (p.contracts_count * p.shares_per_contract), 0);
    const trulyAvailableShares = availableSharesInPortfolio - sharesCoveringOtherPositions;

    if (requiredShares > trulyAvailableShares) {
      showErrorAlert("خطا: سهام آزاد کافی نیست", `شما برای پوشش این معامله به ${requiredShares.toLocaleString()} سهم نیاز دارید، اما فقط ${Math.floor(trulyAvailableShares).toLocaleString()} سهم آزاد در پورتفولیوی خود دارید.`);
      return;
    }
    const success = await addPosition(formData);
    if (success) closeModal();
  }, [addPosition, closeModal, portfolioOpenPositions, openPositions]);

  const handleEditSubmit = useCallback(async (formData) => {
    if (!modal.data) return;
    const { contracts_count, shares_per_contract, underlying_symbol } = formData;
    const requiredShares = (Number(contracts_count) || 0) * (Number(shares_per_contract) || 1000);
    const currentPortfolioPosition = portfolioOpenPositions.find(p => p.symbol === underlying_symbol);
    const availableSharesInPortfolio = currentPortfolioPosition ? currentPortfolioPosition.remainingQty : 0;
    const sharesCoveringOtherPositions = openPositions
      .filter(p => p.underlying_symbol === underlying_symbol && p.id !== modal.data.id)
      .reduce((sum, p) => sum + (p.contracts_count * p.shares_per_contract), 0);
    const trulyAvailableShares = availableSharesInPortfolio - sharesCoveringOtherPositions;
  
    if (requiredShares > trulyAvailableShares) {
      showErrorAlert("خطا: سهام آزاد کافی نیست", `شما برای پوشش این تعداد قرارداد به ${requiredShares.toLocaleString()} سهم نیاز دارید، اما با احتساب دیگر معاملات باز، فقط ${Math.floor(trulyAvailableShares).toLocaleString()} سهم آزاد در پورتفولیوی خود دارید.`);
      return;
    }
    const success = await updatePosition(modal.data.id, formData);
    if (success) closeModal();
  }, [updatePosition, closeModal, modal.data, portfolioOpenPositions, openPositions]);

  const handleManageSubmit = useCallback(async (formData) => {
      if (!modal.data) return;
      const success = await resolvePosition(modal.data.id, formData);
      if (success) closeModal();
    }, [resolvePosition, closeModal, modal.data]);

  const handleReopenPosition = useCallback(async (position) => {
    const confirmed = await showConfirmAlert("بازگشایی پوزیشن", "آیا مطمئن هستید؟ با این کار، رویدادهای مالی مرتبط (مانند فروش سهام) حذف شده و پوزیشن به حالت باز برمی‌گردد.");
    if (confirmed) {
      await reopenPosition(position);
      closeModal();
    }
  }, [reopenPosition, closeModal]);

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
    summaryMetrics, // <-- ارسال محاسبات به صفحه
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