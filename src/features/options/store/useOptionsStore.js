import { create } from "zustand";
import { supabase } from "../../../shared/services/supabase";
import { showSuccessToast, showErrorAlert } from "../../../shared/utils/notifications";
import { DateObject } from "react-multi-date-picker";

const sanitizePayload = (formData) => {
    const validKeys = [
        'user_id', 'underlying_symbol', 'option_symbol', 'option_type',
        'trade_type', 'trade_date', 'expiration_date', 'strike_price',
        'contracts_count', 'premium', 'commission', 'notes', 'status', 'closing_date'
    ];
    const payload = {};
    for (const key of validKeys) {
        if (formData[key] !== undefined && formData[key] !== null) {
            payload[key] = formData[key];
        }
    }
    if (payload.trade_date) payload.trade_date = new DateObject(payload.trade_date).format("YYYY-MM-DD");
    if (payload.expiration_date) payload.expiration_date = new DateObject(payload.expiration_date).format("YYYY-MM-DD");
    if (payload.closing_date) payload.closing_date = new DateObject(payload.closing_date).format("YYYY-MM-DD");
    return payload;
};

const useOptionsStore = create((set, get) => ({
  positions: [],
  isLoading: false,
  error: null,

  fetchPositions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.from("options_trades").select("*").order("trade_date", { ascending: false });
      if (error) throw error;
      set({ positions: data || [], isLoading: false });
    } catch (error) {
      showErrorAlert("خطا در دریافت اطلاعات معاملات آپشن.", error.message);
      set({ error: error.message, isLoading: false });
    }
  },

  addPosition: async (formData) => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("کاربر شناسایی نشد.");
      const payload = sanitizePayload({ ...formData, user_id: user.id });
      const { error } = await supabase.from("options_trades").insert(payload);
      if (error) throw error;
      await get().fetchPositions();
      showSuccessToast("معامله با موفقیت ثبت شد.");
      return true;
    } catch (error) {
      showErrorAlert("خطا در ثبت معامله.", error.message);
      set({ isLoading: false });
      return false;
    }
  },

  updatePosition: async (id, formData) => {
    set({ isLoading: true });
    try {
      const payload = sanitizePayload(formData);
      const { error } = await supabase.from("options_trades").update(payload).eq("id", id);
      if (error) throw error;
      await get().fetchPositions();
      showSuccessToast("معامله با موفقیت ویرایش شد.");
      return true;
    } catch (error) {
      showErrorAlert("خطا در ویرایش معامله.", error.message);
      set({ isLoading: false });
      return false;
    }
  },
  
  deletePosition: async (id) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.from("options_trades").delete().eq("id", id);
      if (error) throw error;
      await get().fetchPositions();
      showSuccessToast("معامله با موفقیت حذف شد.");
      return true;
    } catch (error) {
      showErrorAlert("خطا در حذف معامله.", error.message);
      set({ isLoading: false });
      return false;
    }
  },
}));

export default useOptionsStore;