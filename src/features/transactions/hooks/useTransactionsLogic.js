import { useState, useMemo, useEffect, useCallback } from "react";
import useTransactionStore from "../store/useTransactionStore";
import { showConfirmAlert } from "../../../shared/utils/notifications";

export const useTransactionsLogic = () => {
  // --- State Management ---
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

  // --- Data Fetching ---
  useEffect(() => {
    if (transactions.length === 0) {
      fetchTransactions();
    }
  }, [fetchTransactions, transactions.length]);

  // --- Memoized Calculations ---
  const { totalDeposit, totalWithdraw, netValue } = useMemo(() => {
    let deposit = 0;
    let withdraw = 0;
    transactions.forEach((t) => {
      if (t.type === "deposit") {
        deposit += Number(t.amount);
      } else {
        withdraw += Number(t.amount);
      }
    });
    return {
      totalDeposit: deposit,
      totalWithdraw: withdraw,
      netValue: deposit - withdraw,
    };
  }, [transactions]);

  // --- Event Handlers ---
  const handleOpenModal = useCallback((transaction = null) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      const confirmed = await showConfirmAlert(
        "آیا از حذف تراکنش مطمئن هستید؟",
        "این عملیات غیرقابل بازگشت است."
      );
      if (confirmed) {
        await deleteTransaction(id);
      }
    },
    [deleteTransaction]
  );

  const handleSubmitForm = useCallback(
    async (formData) => {
      const isEdit = !!editingTransaction;
      let success = false;
      if (isEdit) {
        success = await updateTransaction(editingTransaction.id, formData);
      } else {
        success = await addTransaction(formData);
      }
      if (success) {
        handleCloseModal();
      }
    },
    [editingTransaction, addTransaction, updateTransaction, handleCloseModal]
  );

  // مقادیری که کامپوننت UI به آنها نیاز دارد را برمی‌گردانیم
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