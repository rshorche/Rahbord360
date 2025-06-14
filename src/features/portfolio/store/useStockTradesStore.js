import { create } from "zustand";
import { supabase } from "../../../shared/services/supabase";
import {
  showSuccessToast,
  showErrorAlert,
} from "../../../shared/utils/notifications";

const useStockTradesStore = create((set) => ({
  actions: [], 
  isLoading: false,
  error: null,

  fetchActions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("stock_trades") 
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      set({ actions: data, isLoading: false });
    } catch (error) {
      console.error("Error fetching stock actions:", error.message);
      showErrorAlert("خطا در دریافت رویدادهای پورتفولیو.");
      set({ error: error.message, isLoading: false });
    }
  },

  addAction: async (newAction) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("stock_trades")
        .insert(newAction)
        .select();

      if (error) throw error;
      if (data && data.length > 0) {
        set((state) => ({
          actions: [data[0], ...state.actions].sort((a, b) => {
            const dateA = new Date(a.date.replace(/ \/ /g, "-"));
            const dateB = new Date(b.date.replace(/ \/ /g, "-"));
            return dateB.getTime() - dateA.getTime();
          }),
          isLoading: false,
        }));
        showSuccessToast("رویداد پورتفولیو با موفقیت ثبت شد.");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding stock action:", error.message);
      showErrorAlert("مشکلی در ثبت رویداد پورتفولیو رخ داد.");
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  updateAction: async (id, updatedData) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("stock_trades")
        .update(updatedData)
        .eq("id", id)
        .select();

      if (error) throw error;
      if (data && data.length > 0) {
        set((state) => ({
          actions: state.actions
            .map((action) => (action.id === id ? data[0] : action))
            .sort((a, b) => {
              const dateA = new Date(a.date.replace(/ \/ /g, "-"));
              const dateB = new Date(b.date.replace(/ \/ /g, "-"));
              return dateB.getTime() - dateA.getTime();
            }),
          isLoading: false,
        }));
        showSuccessToast("رویداد پورتفولیو با موفقیت ویرایش شد.");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating stock action:", error.message);
      showErrorAlert("مشکلی در ویرایش رویداد پورتفولیو رخ داد.");
      set({ error: error.message, isLoading: false });
      return false;
    }
  },

  deleteAction: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase
        .from("stock_trades")
        .delete()
        .eq("id", id);

      if (error) throw error;
      set((state) => ({
        actions: state.actions.filter((action) => action.id !== id),
        isLoading: false,
      }));
      showSuccessToast("رویداد پورتفولیو با موفقیت حذف شد.");
      return true;
    } catch (error) {
      console.error("Error deleting stock action:", error.message);
      showErrorAlert("مشکلی در حذف رویداد پورتفولیو رخ داد.");
      set({ error: error.message, isLoading: false });
      return false;
    }
  },
}));

export default useStockTradesStore;
