import { create } from "zustand";
import { supabase } from "../../../shared/services/supabase";

const useTransactionStore = create((set) => ({
  transactions: [],
  isLoading: true, // مقدار اولیه برای بارگذاری در اولین ورود به صفحه

  fetchTransactions: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      set({ transactions: data || [] });
    } catch (error) {
      console.error("Error fetching transactions:", error.message);
    } finally {
      set({ isLoading: false });
    }
  },

  addTransaction: async (newTransaction) => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert(newTransaction)
        .select();

      if (error) throw error;
      if (data && data.length > 0) {
        set((state) => ({
          transactions: [data[0], ...state.transactions].sort((a, b) => {
            const dateA = new Date(a.date.replace(/\//g, "-"));
            const dateB = new Date(b.date.replace(/\//g, "-"));
            return dateB.getTime() - dateA.getTime();
          }),
        }));
      }
      return true;
    } catch (error) {
      console.error("Error adding transaction:", error.message);
      return false;
    }
  },

  updateTransaction: async (id, updatedData) => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .update(updatedData)
        .eq("id", id)
        .select();

      if (error) throw error;
      if (data && data.length > 0) {
        set((state) => ({
          transactions: state.transactions
            .map((transaction) =>
              transaction.id === id
                ? data[0]
                : transaction
            )
            .sort((a, b) => {
              const dateA = new Date(a.date.replace(/\//g, "-"));
              const dateB = new Date(b.date.replace(/\//g, "-"));
              return dateB.getTime() - dateA.getTime();
            }),
        }));
      }
      return true;
    } catch (error) {
      console.error("Error updating transaction:", error.message);
      return false;
    }
  },

  deleteTransaction: async (id) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

      if (error) throw error;

      set((state) => ({
        transactions: state.transactions.filter(
          (transaction) => transaction.id !== id
        ),
      }));
      return true;
    } catch (error) {
      console.error("Error deleting transaction:", error.message);
      return false;
    }
  },
}));

export default useTransactionStore;