import { create } from "zustand";
import { supabase } from "../../../shared/services/supabase";
import {
  showSuccessToast,
  showErrorAlert,
} from "../../../shared/utils/notifications";
import { DateObject } from "react-multi-date-picker";

const useTransactionStore = create((set) => ({
  transactions: [],
  isLoading: true,
  error: null,

  fetchTransactions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      set({ transactions: data || [], isLoading: false });
    } catch (error) {
      console.error("Error fetching transactions:", error.message);
      showErrorAlert("خطا در دریافت اطلاعات تراکنش‌ها رخ داد.");
      set({ error: error.message, isLoading: false });
    }
  },

  addTransaction: async (newTransaction) => {
    set({ isLoading: true });
    try {
      const formattedTransaction = {
        ...newTransaction,
        // **تغییر اصلی:** تاریخ را به فرمت رشته‌ای YYYY-MM-DD تبدیل می‌کنیم
        date: new DateObject(newTransaction.date).format("YYYY-MM-DD"),
      };

      const { data, error } = await supabase
        .from("transactions")
        .insert(formattedTransaction)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        transactions: [data, ...state.transactions].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        ),
        isLoading: false,
      }));
      showSuccessToast("تراکنش جدید با موفقیت ثبت شد.");
      return true;
    } catch (error) {
      console.error("Error adding transaction:", error.message);
      showErrorAlert("خطا در ثبت تراکنش جدید.");
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

  updateTransaction: async (id, updatedData) => {
    set({ isLoading: true });
    try {
      const formattedTransaction = {
        ...updatedData,
        // **تغییر اصلی:** تاریخ را به فرمت رشته‌ای YYYY-MM-DD تبدیل می‌کنیم
        date: new DateObject(updatedData.date).format("YYYY-MM-DD"),
      };

      const { data, error } = await supabase
        .from("transactions")
        .update(formattedTransaction)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        transactions: state.transactions
          .map((t) => (t.id === id ? data : t))
          .sort((a, b) => new Date(b.date) - new Date(a.date)),
        isLoading: false,
      }));
      showSuccessToast("تراکنش با موفقیت ویرایش شد.");
      return true;
    } catch (error) {
      console.error("Error updating transaction:", error.message);
      showErrorAlert("خطا در ویرایش تراکنش.");
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.from("transactions").delete().eq("id", id);
      if (error) throw error;
      set((state) => ({
        transactions: state.transactions.filter((t) => t.id !== id),
        isLoading: false,
      }));
      showSuccessToast("تراکنش با موفقیت حذف شد.");
      return true;
    } catch (error) {
      console.error("Error deleting transaction:", error.message);
      showErrorAlert("خطا در حذف تراکنش.");
      set({ isLoading: false, error: error.message });
      return false;
    }
  },
}));

export default useTransactionStore;