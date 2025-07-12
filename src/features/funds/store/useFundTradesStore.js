import { create } from "zustand";
import { supabase } from "../../../shared/services/supabase";
import { showSuccessToast, showErrorAlert } from "../../../shared/utils/notifications";
import { DateObject } from "react-multi-date-picker";

const useFundTradesStore = create((set, get) => ({
  trades: [],
  isLoading: true,
  error: null,

  fetchTrades: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("fund_trades")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      set({ trades: data || [], isLoading: false });
    } catch (error) {
      showErrorAlert("خطا در دریافت اطلاعات صندوق‌ها.");
      set({ error: error.message, isLoading: false });
    }
  },

  addTrade: async (formData) => {
    set({ isLoading: true });
    try {
      const payload = { ...formData, date: new DateObject(formData.date).format("YYYY-MM-DD") };
      const { error } = await supabase.from("fund_trades").insert(payload);
      if (error) throw error;
      await get().fetchTrades();
      showSuccessToast("معامله صندوق با موفقیت ثبت شد.");
      return true;
    } catch (error) {
      showErrorAlert("خطا در ثبت معامله.", error.message);
      set({ isLoading: false });
      return false;
    }
  },

  updateTrade: async (id, formData) => {
    set({ isLoading: true });
    try {
      const payload = { ...formData, date: new DateObject(formData.date).format("YYYY-MM-DD") };
      const { error } = await supabase.from("fund_trades").update(payload).eq("id", id);
      if (error) throw error;
      await get().fetchTrades();
      showSuccessToast("معامله با موفقیت ویرایش شد.");
      return true;
    } catch (error) {
      showErrorAlert("خطا در ویرایش معامله.", error.message);
      set({ isLoading: false });
      return false;
    }
  },

  deleteTrade: async (id) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.from("fund_trades").delete().eq("id", id);
      if (error) throw error;
      await get().fetchTrades();
      showSuccessToast("معامله با موفقیت حذف شد.");
      return true;
    } catch (error) {
      showErrorAlert("خطا در حذف معامله.", error.message);
      set({ isLoading: false });
      return false;
    }
  },
}));

export default useFundTradesStore;