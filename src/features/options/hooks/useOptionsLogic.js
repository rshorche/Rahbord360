import { useState, useMemo, useEffect, useCallback } from "react";
import useOptionsStore from "../store/useOptionsStore";
import { showConfirmAlert, showErrorAlert } from "../../../shared/utils/notifications";
import usePriceHistoryStore from "../../../shared/store/usePriceHistoryStore";
import { calculateOptionMetrics } from "../utils/optionsCalculations";
import useStockTradesStore from "../../portfolio/store/useStockTradesStore";
import { DateObject } from "react-multi-date-picker";

export const useOptionsLogic = () => {
  const {
    positions,
    isLoading,
    fetchPositions,
    addPosition,
    updatePosition,
    resolvePosition,
    deletePosition,
    reopenPosition,
  } = useOptionsStore();

  const { addAction, deleteAction, actions: portfolioActions } = useStockTradesStore();
  const { priceHistory } = usePriceHistoryStore();
  const [activeTab, setActiveTab] = useState("open");
  const [modal, setModal] = useState({ type: null, data: null });

  useEffect(() => {
    fetchPositions();
  }, [fetchPositions]);

  const calculatedPositions = useMemo(() => {
    return positions.map(p => {
      const underlyingPrice = priceHistory.get(p.underlying_symbol)?.price / 10 || 0;
      const optionPrice = p.premium; 
      return calculateOptionMetrics(p, underlyingPrice, optionPrice);
    });
  }, [positions, priceHistory]);

  const openPositions = useMemo(() => calculatedPositions.filter(p => p.status === 'OPEN'), [calculatedPositions]);
  const historyPositions = useMemo(() => calculatedPositions.filter(p => p.status !== 'OPEN'), [calculatedPositions]);

  const openModal = useCallback((type, data = null) => setModal({ type, data }), []);
  const closeModal = useCallback(() => setModal({ type: null, data: null }), []);

  const handleAddSubmit = useCallback(async (formData) => {
    const success = await addPosition(formData);
    if (success) closeModal();
  }, [addPosition, closeModal]);

  const handleEditSubmit = useCallback(async (formData) => {
    if (!modal.data) return;
    const success = await updatePosition(modal.data.id, formData);
    if (success) closeModal();
  }, [updatePosition, closeModal, modal.data]);

  const handleExercisePosition = useCallback(async (position) => {
    const confirmed = await showConfirmAlert("اعمال اختیار معامله", `آیا از اعمال این اختیار (${position.option_symbol}) مطمئن هستید؟`);
    if (confirmed) {
      const isCall = position.option_type === 'call';
      const readableNote = `اعمال اختیار ${position.option_symbol}`;
      const technicalNote = `[ref_opt:${position.id}]`;
      const stockAction = {
        type: isCall ? 'buy' : 'sell',
        symbol: position.underlying_symbol,
        date: new DateObject(new Date()).format("YYYY-MM-DD"),
        quantity: position.contracts_count * 1000,
        price: position.strike_price,
        commission: 0,
        notes: `${readableNote} ||| ${technicalNote}`,
      };

      const stockActionSuccess = await addAction(stockAction, true);
      if (!stockActionSuccess) {
          showErrorAlert("خطا", "ثبت خودکار معامله در پورتفولیو با مشکل مواجه شد.");
          return;
      }
      
      const resolveData = { status: 'EXERCISED', closing_date: new DateObject(new Date()).format("YYYY-MM-DD") };
      const success = await resolvePosition(position.id, resolveData);
      if (success) closeModal();
    }
  }, [resolvePosition, addAction, closeModal]);
  
  const handleExpirePosition = useCallback(async (position) => {
    const confirmed = await showConfirmAlert("منقضی کردن پوزیشن", `آیا از منقضی کردن این پوزیشن (${position.option_symbol}) مطمئن هستید؟`);
    if (confirmed) {
      const resolveData = { status: 'EXPIRED', closing_date: position.expiration_date };
      const success = await resolvePosition(position.id, resolveData);
      if (success) closeModal();
    }
  }, [resolvePosition, closeModal]);

  const handleReopenPosition = useCallback(async (position) => {
    const confirmed = await showConfirmAlert("بازگشایی پوزیشن", "آیا مطمئن هستید؟ با این کار، رویدادهای مالی مرتبط (مانند خرید/فروش سهام) حذف شده و پوزیشن به حالت باز برمی‌گردد.");
    if (confirmed) {
      if (position.status === 'EXERCISED') {
        const noteToFind = `[ref_opt:${position.id}]`;
        const linkedAction = portfolioActions.find(a => a.notes && a.notes.includes(noteToFind));
        if (linkedAction) {
          await deleteAction(linkedAction.id);
        }
      }
      const success = await reopenPosition(position.id);
      if(success) closeModal();
    }
  }, [reopenPosition, closeModal, portfolioActions, deleteAction]);

  const handleDeletePosition = useCallback(async (id) => {
    const confirmed = await showConfirmAlert("حذف معامله", "آیا از حذف این معامله آپشن مطمئن هستید؟");
    if (confirmed) {
      await deletePosition(id);
      closeModal();
    }
  }, [deletePosition, closeModal]);

  return {
    isLoading,
    activeTab,
    setActiveTab,
    openPositions,
    historyPositions,
    modal,
    openModal,
    closeModal,
    handleAddSubmit,
    handleEditSubmit,
    handleExercisePosition,
    handleExpirePosition,
    handleReopenPosition,
    handleDeletePosition,
  };
};