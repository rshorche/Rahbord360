import { create } from "zustand";
import { supabase } from "../../../shared/services/supabase";
import { showSuccessToast, showErrorAlert } from "../../../shared/utils/notifications";
import { DateObject } from "react-multi-date-picker";

const useTransactionStore = create((set, get) => ({
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
      showErrorAlert("خطا در دریافت اطلاعات تراکنش‌ها رخ داد.");
      set({ error: error.message, isLoading: false });
    }
  },

  addTransaction: async (newTransaction) => {
    set({ isLoading: true });
    try {
      const formattedTransaction = {
        ...newTransaction,
        date: new DateObject(newTransaction.date).format("YYYY-MM-DD"),
      };

      const { error } = await supabase.from("transactions").insert(formattedTransaction);
      if (error) throw error;

      showSuccessToast("تراکنش جدید با موفقیت ثبت شد.");
      await get().fetchTransactions();
      return true;
    } catch (error) {
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
        date: new DateObject(updatedData.date).format("YYYY-MM-DD"),
      };

      const { error } = await supabase.from("transactions").update(formattedTransaction).eq("id", id);
      if (error) throw error;

      showSuccessToast("تراکنش با موفقیت ویرایش شد.");
      await get().fetchTransactions();
      return true;
    } catch (error) {
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
      
      showSuccessToast("تراکنش با موفقیت حذف شد.");
      await get().fetchTransactions();
      return true;
    } catch (error) {
      showErrorAlert("خطا در حذف تراکنش.");
      set({ isLoading: false, error: error.message });
      return false;
    }
  },
}));

export default useTransactionStore;