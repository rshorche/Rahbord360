import { create } from "zustand";
import { supabase } from "../../../shared/services/supabase";
import {
  showSuccessToast,
  showErrorAlert,
} from "../../../shared/utils/notifications";
import { DateObject } from "react-multi-date-picker";

const useStockTradesStore = create((set) => ({
  actions: [],
  isLoading: true,
  error: null,

  fetchActions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("stock_trades")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      set({ actions: data || [], isLoading: false });
    } catch (error) {
      console.error("Error fetching stock actions:", error.message);
      showErrorAlert("خطا در دریافت رویدادهای پورتفولیو.");
      set({ error: error.message, isLoading: false });
    }
  },

  addAction: async (newAction) => {
    set({ isLoading: true });
    try {
      const payload = {
        date: new DateObject(newAction.date).format("YYYY-MM-DD"),
        symbol: newAction.symbol,
        type: newAction.type,
        notes: newAction.notes,
      };

      switch (newAction.type) {
        case 'buy':
        case 'sell':
        case 'rights_exercise':
          payload.quantity = Number(newAction.quantity);
          payload.price = Number(newAction.price);
          payload.commission = Number(newAction.commission) || 0;
          break;
        case 'dividend':
        case 'rights_sell':
          payload.amount = Number(newAction.amount);
          break;
        case 'bonus':
          payload.quantity = Number(newAction.quantity);
          break;
        case 'revaluation':
          payload.revaluation_percentage = Number(newAction.revaluation_percentage);
          break;
        case 'premium':
          payload.premium_type = newAction.premium_type;
          payload.amount = newAction.premium_type === 'cash_payment' ? Number(newAction.amount) : null;
          payload.quantity = newAction.premium_type === 'bonus_shares' ? Number(newAction.quantity) : null;
          break;
        default:
          throw new Error(`Unknown action type: ${newAction.type}`);
      }
      
      const { data, error } = await supabase
        .from("stock_trades")
        .insert(payload)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        actions: [data, ...state.actions].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        ),
        isLoading: false,
      }));

      showSuccessToast("رویداد جدید با موفقیت ثبت شد.");
      return true;
    } catch (error) {
      console.error("Error adding stock action:", error.message);
      showErrorAlert("خطا در ثبت رویداد جدید پورتفولیو.");
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

   updateAction: async (id, updatedData) => {
    set({ isLoading: true });
    try {
      const payload = {
        date: new DateObject(updatedData.date).format("YYYY-MM-DD"),
        symbol: updatedData.symbol,
        type: updatedData.type,
        notes: updatedData.notes,
        quantity: null, price: null, commission: null, amount: null, revaluation_percentage: null, premium_type: null
      };

      switch (updatedData.type) {
        case 'buy':
        case 'sell':
        case 'rights_exercise':
          payload.quantity = Number(updatedData.quantity);
          payload.price = Number(updatedData.price);
          payload.commission = Number(updatedData.commission) || 0;
          break;
        case 'dividend':
        case 'rights_sell':
          payload.amount = Number(updatedData.amount);
          break;
        case 'bonus':
          payload.quantity = Number(updatedData.quantity);
          break;
        case 'revaluation':
          payload.revaluation_percentage = Number(updatedData.revaluation_percentage);
          break;
        case 'premium':
          payload.premium_type = updatedData.premium_type;
          payload.amount = updatedData.premium_type === 'cash_payment' ? Number(updatedData.amount) : null;
          payload.quantity = updatedData.premium_type === 'bonus_shares' ? Number(updatedData.quantity) : null;
          break;
        default:
          throw new Error(`Unknown action type: ${updatedData.type}`);
      }

      const { data, error } = await supabase
        .from("stock_trades")
        .update(payload)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;

      set((state) => ({
        actions: state.actions
          .map((action) => (action.id === id ? data : action))
          .sort((a, b) => new Date(b.date) - new Date(a.date)),
        isLoading: false,
      }));

      showSuccessToast("رویداد با موفقیت ویرایش شد.");
      return true;
    } catch (error) {
      console.error("Error updating stock action:", error.message);
      showErrorAlert("خطا در ویرایش رویداد پورتفولیو.");
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

  deleteAction: async (id) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.from("stock_trades").delete().eq("id", id);
      if (error) throw error;

      set((state) => ({
        actions: state.actions.filter((action) => action.id !== id),
        isLoading: false,
      }));

      showSuccessToast("رویداد با موفقیت حذف شد.");
      return true;
    } catch (error) {
      console.error("Error deleting stock action:", error.message);
      showErrorAlert("خطا در حذف رویداد پورتفولیو.");
      set({ isLoading: false, error: error.message });
      return false;
    }
  },
}));

export default useStockTradesStore;