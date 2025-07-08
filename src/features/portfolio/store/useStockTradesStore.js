import { create } from "zustand";
import { supabase } from "../../../shared/services/supabase";
import {
  showSuccessToast,
  showErrorAlert,
  showConfirmAlert,
} from "../../../shared/utils/notifications";
import { DateObject } from "react-multi-date-picker";
import useCoveredCallStore from "../../covered-call/store/useCoveredCallStore";

const calculateCurrentHolding = (actions, symbol) => {
  let currentQty = 0;
  const sortedActions = [...actions].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  for (const action of sortedActions) {
    if (action.symbol === symbol) {
      const quantity = Number(action.quantity) || 0;
      switch (action.type) {
        case 'buy':
        case 'rights_exercise':
        case 'bonus':
          currentQty += quantity;
          break;
        case 'premium':
          if (action.premium_type === 'bonus_shares') {
            currentQty += quantity;
          }
          break;
        case 'revaluation':
          const multiplier = 1 + (Number(action.revaluation_percentage) / 100);
          currentQty *= multiplier;
          break;
        case 'sell':
          currentQty -= quantity;
          break;
      }
    }
  }
  return currentQty;
};

const useStockTradesStore = create((set, get) => ({
  actions: [],
  isLoading: false,
  error: null,

  fetchActions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.from("stock_trades").select("*").order("date", { ascending: false });
      if (error) throw error;
      set({ actions: data || [], isLoading: false });
    } catch (error) {
      console.error("Error fetching stock actions:", error.message);
      showErrorAlert("خطا در دریافت رویدادهای پورتفولیو.");
      set({ error: error.message, isLoading: false });
    }
  },

  addAction: async (newAction) => {
    if (newAction.type === 'sell') {
      const { symbol, quantity: quantityToSell } = newAction;
      const currentHoldings = calculateCurrentHolding(get().actions, symbol);
      const openCoveredCallPositions = await useCoveredCallStore.getState().fetchPositions();
      const requiredSharesToCover = openCoveredCallPositions
        .filter(p => p.underlying_symbol === symbol && p.status === 'OPEN')
        .reduce((sum, p) => sum + (p.contracts_count * p.shares_per_contract), 0);
      const freeShares = currentHoldings - requiredSharesToCover;

      if (quantityToSell > freeShares) {
        showErrorAlert(
            "فروش امکان‌پذیر نیست",
            `تعداد سهام درخواستی شما برای فروش (${quantityToSell.toLocaleString()}) بیشتر از تعداد سهام آزاد شما (${Math.floor(freeShares).toLocaleString()}) است. شما ${requiredSharesToCover.toLocaleString()} سهم را برای پوشش کاورد کال‌های باز خود نیاز دارید.`
        );
        return false;
      }
    }

    set({ isLoading: true });
    try {
      const payload = {
        date: new DateObject(newAction.date).format("YYYY-MM-DD"),
        symbol: newAction.symbol, type: newAction.type, notes: newAction.notes,
      };
      switch (newAction.type) {
        case 'buy': case 'sell': case 'rights_exercise':
          payload.quantity = Number(newAction.quantity); payload.price = Number(newAction.price); payload.commission = Number(newAction.commission) || 0; break;
        case 'dividend': case 'rights_sell':
          payload.amount = Number(newAction.amount); break;
        case 'bonus':
          payload.quantity = Number(newAction.quantity); break;
        case 'revaluation':
          payload.revaluation_percentage = Number(newAction.revaluation_percentage); break;
        case 'premium':
          payload.premium_type = newAction.premium_type;
          payload.amount = newAction.premium_type === 'cash_payment' ? Number(newAction.amount) : null;
          payload.quantity = newAction.premium_type === 'bonus_shares' ? Number(newAction.quantity) : null; break;
        default: throw new Error(`Unknown action type: ${newAction.type}`);
      }
      const { data, error } = await supabase.from("stock_trades").insert(payload).select().single();
      if (error) throw error;
      set((state) => ({ actions: [data, ...state.actions].sort((a, b) => new Date(b.date) - new Date(a.date)), isLoading: false }));
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
        symbol: updatedData.symbol, type: updatedData.type, notes: updatedData.notes,
        quantity: null, price: null, commission: null, amount: null, revaluation_percentage: null, premium_type: null
      };
      switch (updatedData.type) {
        case 'buy': case 'sell': case 'rights_exercise':
          payload.quantity = Number(updatedData.quantity); payload.price = Number(updatedData.price); payload.commission = Number(updatedData.commission) || 0; break;
        case 'dividend': case 'rights_sell':
          payload.amount = Number(updatedData.amount); break;
        case 'bonus':
          payload.quantity = Number(updatedData.quantity); break;
        case 'revaluation':
          payload.revaluation_percentage = Number(updatedData.revaluation_percentage); break;
        case 'premium':
          payload.premium_type = updatedData.premium_type;
          payload.amount = updatedData.premium_type === 'cash_payment' ? Number(updatedData.amount) : null;
          payload.quantity = updatedData.premium_type === 'bonus_shares' ? Number(updatedData.quantity) : null; break;
        default: throw new Error(`Unknown action type: ${updatedData.type}`);
      }
      const { data, error } = await supabase.from("stock_trades").update(payload).eq("id", id).select().single();
      if (error) throw error;
      set((state) => ({ actions: state.actions.map((action) => (action.id === id ? data : action)).sort((a, b) => new Date(b.date) - new Date(a.date)), isLoading: false }));
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
    const actionToDelete = get().actions.find(a => a.id === id);

    if (actionToDelete) {
        const { symbol, type, quantity } = actionToDelete;
        const openCoveredCallPositions = await useCoveredCallStore.getState().fetchPositions();
        const requiredSharesToCover = openCoveredCallPositions
            .filter(p => p.underlying_symbol === symbol && p.status === 'OPEN')
            .reduce((sum, p) => sum + (p.contracts_count * p.shares_per_contract), 0);

        if (requiredSharesToCover > 0) {
            const currentHoldings = calculateCurrentHolding(get().actions, symbol);
            let holdingsAfterDelete = currentHoldings;
            const actionType = actionToDelete.type;

            if (actionType === 'buy' || actionType === 'rights_exercise' || actionType === 'bonus' || (actionType === 'premium' && actionToDelete.premium_type === 'bonus_shares')) {
                holdingsAfterDelete -= quantity;
            }
            
            if (holdingsAfterDelete < requiredSharesToCover) {
              showErrorAlert(
                  "حذف امکان‌پذیر نیست",
                  `<div style="text-align: right; direction: rtl;">شما نمی‌توانید این رویداد را حذف کنید زیرا به سهام آن برای <b>پوشش دادن تعهد کاورد کال</b> خود نیاز دارید.<br/><br/>• تعداد سهام مورد نیاز برای پوشش: <b>${requiredSharesToCover.toLocaleString()}</b> سهم<br/>• تعداد سهام شما پس از حذف این رویداد: <b>${Math.floor(holdingsAfterDelete).toLocaleString()}</b> سهم<br/><br/><b>راه حل:</b> برای حذف این رویداد، ابتدا باید پوزیشن کاورد کال مربوطه را ببندید.</div>`
              );
              set({ isLoading: false });
              return false;
            }
        }
    }
    
    try {
      const { error } = await supabase.from("stock_trades").delete().eq("id", id);
      if (error) throw error;
      set((state) => ({ actions: state.actions.filter((action) => action.id !== id), isLoading: false }));
      showSuccessToast("رویداد با موفقیت حذف شد.");
      return true;
    } catch (error) {
      console.error("Error deleting stock action:", error.message);
      showErrorAlert("مشکلی در حذف رویداد پورتفولیو رخ داد.");
      set({ isLoading: false, error: error.message });
      return false;
    }
  },
}));

export default useStockTradesStore;