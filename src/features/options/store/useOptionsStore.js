import { create } from "zustand";
import { supabase } from "../../../shared/services/supabase";
import { showSuccessToast, showErrorAlert } from "../../../shared/utils/notifications";
import { DateObject } from "react-multi-date-picker";

const useOptionsStore = create((set, get) => ({
  positions: [],
  isLoading: false,
  error: null,

  fetchPositions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("options_trades")
        .select("*")
        .order("trade_date", { ascending: false });

      if (error) throw error;
      set({ positions: data || [], isLoading: false });
    } catch (error) {
      showErrorAlert("خطا در دریافت اطلاعات معاملات آپشن.");
      set({ error: error.message, isLoading: false });
    }
  },

  addPosition: async (formData) => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("کاربر شناسایی نشد.");

      const payload = {
        user_id: user.id,
        underlying_symbol: formData.underlying_symbol,
        option_symbol: formData.option_symbol,
        option_type: formData.option_type,
        trade_type: formData.trade_type,
        trade_date: new DateObject(formData.trade_date).format("YYYY-MM-DD"),
        expiration_date: new DateObject(formData.expiration_date).format("YYYY-MM-DD"),
        strike_price: Number(formData.strike_price),
        contracts_count: Number(formData.contracts_count),
        premium: Number(formData.premium),
        commission: Number(formData.commission) || 0,
        notes: formData.notes,
      };
      
      const { error } = await supabase.from("options_trades").insert(payload);
      if (error) throw error;

      await get().fetchPositions();
      showSuccessToast("معامله آپشن با موفقیت ثبت شد.");
      return true;
    } catch (error) {
      showErrorAlert("خطا در ثبت معامله آپشن.", error.message);
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

  updatePosition: async (id, formData) => {
    set({ isLoading: true });
    try {
      const payload = {
        underlying_symbol: formData.underlying_symbol,
        option_symbol: formData.option_symbol,
        option_type: formData.option_type,
        trade_type: formData.trade_type,
        trade_date: new DateObject(formData.trade_date).format("YYYY-MM-DD"),
        expiration_date: new DateObject(formData.expiration_date).format("YYYY-MM-DD"),
        strike_price: Number(formData.strike_price),
        contracts_count: Number(formData.contracts_count),
        premium: Number(formData.premium),
        commission: Number(formData.commission) || 0,
        notes: formData.notes,
      };
      const { error } = await supabase.from("options_trades").update(payload).eq("id", id);
      if (error) throw error;

      await get().fetchPositions();
      showSuccessToast("معامله با موفقیت ویرایش شد.");
      return true;
    } catch (error) {
      showErrorAlert("خطا در ویرایش معامله آپشن.", error.message);
      set({ isLoading: false, error: error.message });
      return false;
    }
  },
  
  resolvePosition: async (id, resolveData) => {
    set({ isLoading: true });
    try {
        const { error } = await supabase.from("options_trades").update(resolveData).eq("id", id);
        if (error) throw error;
        await get().fetchPositions();
        return true;
    } catch (error) {
        showErrorAlert("خطا در به‌روزرسانی وضعیت پوزیشن.", error.message);
        set({ isLoading: false });
        return false;
    }
  },

  reopenPosition: async (positionId) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.from("options_trades").update({ status: 'OPEN', closing_date: null }).eq("id", positionId);
      if (error) throw error;
      
      await get().fetchPositions();
      showSuccessToast("پوزیشن با موفقیت بازگشایی شد.");
      return true;
    } catch (error) {
      showErrorAlert("خطا در بازگشایی پوزیشن.", error.message);
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
      showErrorAlert("خطا در حذف معامله آپشن.", error.message);
      set({ isLoading: false, error: error.message });
      return false;
    }
  },
}));

export default useOptionsStore;