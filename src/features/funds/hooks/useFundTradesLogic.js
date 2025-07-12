import { useState, useMemo, useEffect, useCallback } from "react";
import useFundTradesStore from "../store/useFundTradesStore";
import { showConfirmAlert } from "../../../shared/utils/notifications";
import { processFundTrades } from "../utils/fundCalculator";

export const useFundTradesLogic = () => {
  const {
    trades,
    isLoading,
    fetchTrades,
    addTrade,
    updateTrade,
    deleteTrade,
  } = useFundTradesStore();

  const [activeTab, setActiveTab] = useState("open");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [detailData, setDetailData] = useState({ symbol: "", trades: [] });

  useEffect(() => {
    fetchTrades();
  }, [fetchTrades]);
  
  const { openPositions, closedPositions } = useMemo(() => {
    return processFundTrades(trades, new Map());
  }, [trades]);

  const summaryMetrics = useMemo(() => {
    return openPositions.reduce((acc, pos) => {
        acc.totalValue += pos.current_value || 0;
        acc.totalPL += pos.total_pl || 0;
        acc.totalInvestment += pos.total_cost || 0;
        return acc;
    }, { totalValue: 0, totalPL: 0, totalInvestment: 0 });
  }, [openPositions]);

  const openModal = useCallback((trade = null) => {
    setEditingTrade(trade);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTrade(null);
  }, []);
  
  const openDetailModal = useCallback((positionData) => {
    setDetailData({
      symbol: positionData.symbol,
      trades: positionData.detailData,
    });
    setIsDetailModalOpen(true);
  }, []);

  const closeDetailModal = useCallback(() => {
    setIsDetailModalOpen(false);
  }, []);

  const handleEditFromDetail = useCallback((trade) => {
    closeDetailModal();
    setTimeout(() => openModal(trade), 150);
  }, [closeDetailModal, openModal]);

  const handleSubmit = useCallback(async (formData) => {
    const isEdit = !!editingTrade;
    const success = isEdit
      ? await updateTrade(editingTrade.id, formData)
      : await addTrade(formData);
    
    if (success) closeModal();
  }, [editingTrade, addTrade, updateTrade, closeModal]);

  const handleDelete = useCallback(async (id) => {
    const confirmed = await showConfirmAlert("حذف معامله", "آیا از حذف این معامله مطمئن هستید؟");
    if (confirmed) {
      await deleteTrade(id);
      closeDetailModal();
    }
  }, [deleteTrade, closeDetailModal]);

  return {
    isLoading,
    activeTab,
    setActiveTab,
    openPositions,
    closedPositions,
    summaryMetrics,
    isModalOpen,
    editingTrade,
    isDetailModalOpen,
    detailData,
    openModal,
    closeModal,
    openDetailModal,
    closeDetailModal,
    handleSubmit,
    handleDelete,
    handleEditFromDetail,
  };
};