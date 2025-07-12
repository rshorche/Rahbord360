import { useState, useMemo, useEffect, useCallback } from "react";
import useTransactionStore from "../store/useTransactionStore";
import { showConfirmAlert } from "../../../shared/utils/notifications";

export const useTransactionsLogic = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const {
    transactions,
    isLoading,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useTransactionStore();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const { totalDeposit, totalWithdraw, netValue } = useMemo(() => {
    return transactions.reduce((acc, t) => {
      const amount = Number(t.amount) || 0;
      if (t.type === "deposit") {
        acc.totalDeposit += amount;
      } else {
        acc.totalWithdraw += amount;
      }
      acc.netValue = acc.totalDeposit - acc.totalWithdraw;
      return acc;
    }, { totalDeposit: 0, totalWithdraw: 0, netValue: 0 });
  }, [transactions]);

  const handleOpenModal = useCallback((transaction = null) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  }, []);

  const handleDelete = useCallback(async (id) => {
    const confirmed = await showConfirmAlert(
      "آیا از حذف تراکنش مطمئن هستید؟",
      "این عملیات غیرقابل بازگشت است."
    );
    if (confirmed) {
      await deleteTransaction(id);
    }
  }, [deleteTransaction]);

  const handleSubmitForm = useCallback(async (formData) => {
    const isEdit = !!editingTransaction;
    const action = isEdit ? updateTransaction : addTransaction;
    const payload = isEdit ? [editingTransaction.id, formData] : [formData];
    
    const success = await action(...payload);
    
    if (success) {
      handleCloseModal();
    }
  }, [editingTransaction, addTransaction, updateTransaction, handleCloseModal]);

  return {
    transactions,
    isLoading,
    totalDeposit,
    totalWithdraw,
    netValue,
    isModalOpen,
    editingTransaction,
    handleOpenModal,
    handleCloseModal,
    handleDelete,
    handleSubmitForm,
  };
};