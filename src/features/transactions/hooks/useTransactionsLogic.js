import { useState, useMemo, useCallback } from "react";
import useTransactionStore from "../store/useTransactionStore"; 
import {
  showSuccessToast,
  showErrorAlert,
  showConfirmAlert,
} from "../../../shared/utils/notifications"; 

export const useTransactionsLogic = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    fetchTransactions,
  } = useTransactionStore();

  const { totalDeposit, totalWithdraw, netValue } = useMemo(() => {
    let deposit = 0;
    let withdraw = 0;
    transactions.forEach((t) => {
      if (t.type === "deposit") {
        deposit += t.amount;
      } else {
        withdraw += t.amount;
      }
    });
    return {
      totalDeposit: deposit,
      totalWithdraw: withdraw,
      netValue: deposit - withdraw,
    };
  }, [transactions]);

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
        "آیا مطمئن هستید؟",
        "این تراکنش برای همیشه حذف خواهد شد!"
      );
      if (confirmed) {
        deleteTransaction(id);
        showSuccessToast("تراکنش با موفقیت حذف شد.");
      }
    },
    [deleteTransaction]
  );

  const handleSaveTransaction = useCallback(
    async (formData, isEdit) => {
      try {
        if (isEdit) {
          updateTransaction(formData.id, formData);
          showSuccessToast("تراکنش با موفقیت ویرایش شد.");
        } else {
          addTransaction(formData);
          showSuccessToast("تراکنش جدید ثبت شد.");
        }
        return true;
      } catch (error) {
        console.error("Error saving transaction:", error.message);
        showErrorAlert();
        return false;
      }
    },
    [addTransaction, updateTransaction]
  );

  return {
    transactions,
    totalDeposit,
    totalWithdraw,
    netValue,
    isModalOpen,
    editingTransaction,
    handleOpenModal,
    handleCloseModal,
    handleDelete,
    handleSaveTransaction,
    fetchTransactions, 
  };
};
