import { create } from "zustand";
import { supabase } from "../../../shared/services/supabase";
import { showSuccessToast, showErrorAlert } from "../../../shared/utils/notifications";
import useCoveredCallStore from "../../covered-call/store/useCoveredCallStore";
import { calculateSymbolHolding } from "../utils/portfolioCalculator";

const useStockTradesStore = create((set, get) => ({
  actions: [],
  isLoading: false,
  error: null,

  calculateCurrentHolding: (symbol) => {
    return calculateSymbolHolding(get().actions, symbol);
  },

  fetchActions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.from("stock_trades").select("*").order("date", { ascending: false });
      if (error) throw error;
      set({ actions: data || [], isLoading: false });
    } catch (error) {
      showErrorAlert("خطا در دریافت رویدادهای پورتفولیو.");
      set({ error: error.message, isLoading: false });
    }
  },

  addAction: async (newAction, isInternalCall = false) => {
    if (newAction.type === 'sell' && !isInternalCall) {
      const { symbol, quantity: quantityToSell } = newAction;
      const currentHoldings = get().calculateCurrentHolding(symbol);
      
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
      const { error } = await supabase.from("stock_trades").insert(newAction);
      if (error) throw error;

      await get().fetchActions();
      showSuccessToast("رویداد جدید با موفقیت ثبت شد.");
      return true;
    } catch (error) {
      showErrorAlert("خطا در ثبت رویداد جدید پورتفولیو.", error.message);
      set({ isLoading: false, error: error.message });
      return false;
    }
  },
  
  updateAction: async (id, updatedData) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.from("stock_trades").update(updatedData).eq("id", id);
      if (error) throw error;
      
      await get().fetchActions();
      showSuccessToast("رویداد با موفقیت ویرایش شد.");
      return true;
    } catch (error) {
      showErrorAlert("خطا در ویرایش رویداد پورتفولیو.");
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

  deleteAction: async (id, isInternalCall = false) => {
    const actionToDelete = get().actions.find(a => a.id === id);
    if (!actionToDelete) return false;

    if (!isInternalCall) {
        const { symbol } = actionToDelete;
        
        const actionsAfterDelete = get().actions.filter(a => a.id !== id);
        const holdingsAfterDelete = calculateSymbolHolding(actionsAfterDelete, symbol);

        const openCoveredCallPositions = await useCoveredCallStore.getState().fetchPositions();
        const requiredSharesToCover = openCoveredCallPositions
            .filter(p => p.underlying_symbol === symbol && p.status === 'OPEN')
            .reduce((sum, p) => sum + (p.contracts_count * p.shares_per_contract), 0);

        if (holdingsAfterDelete < requiredSharesToCover) {
        showErrorAlert(
            "حذف امکان‌پذیر نیست",
            `<div style="text-align: right; direction: rtl;">شما نمی‌توانید این رویداد را حذف کنید زیرا به سهام آن برای <b>پوشش دادن تعهد کاورد کال</b> خود نیاز دارید.<br/><br/>• تعداد سهام مورد نیاز برای پوشش: <b>${requiredSharesToCover.toLocaleString()}</b> سهم<br/>• تعداد سهام شما پس از حذف این رویداد: <b>${Math.floor(holdingsAfterDelete).toLocaleString()}</b> سهم<br/><br/><b>راه حل:</b> برای حذف این رویداد، ابتدا باید پوزیشن کاورد کال مربوطه را ببندید.</div>`
        );
        return false;
        }
    }
    
    set({ isLoading: true });
    try {
      const { error } = await supabase.from("stock_trades").delete().eq("id", id);
      if (error) throw error;
      await get().fetchActions();
      showSuccessToast("رویداد با موفقیت حذف شد.");
      return true;
    } catch (error) {
      showErrorAlert("مشکلی در حذف رویداد پورتفولیو رخ داد.");
      set({ isLoading: false, error: error.message });
      return false;
    }
  },
}));

export default useStockTradesStore;