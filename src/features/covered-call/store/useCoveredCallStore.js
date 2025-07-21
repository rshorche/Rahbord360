import { create } from "zustand";
import { supabase } from "../../../shared/services/supabase";
import { showSuccessToast, showErrorAlert } from "../../../shared/utils/notifications";
import { DateObject } from "react-multi-date-picker";
import useStockTradesStore from "../../portfolio/store/useStockTradesStore";

const useCoveredCallStore = create((set, get) => ({
  positions: [],
  isLoading: false,
  error: null,

  fetchPositions: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("covered_calls")
        .select("*")
        .order("trade_date", { ascending: false });

      if (error) throw error;
      const positionsData = data || [];
      set({ positions: positionsData, isLoading: false });
      return positionsData;
    } catch (error) {
      showErrorAlert("خطا در دریافت اطلاعات کاورد کال.");
      set({ error: error.message, isLoading: false });
      return [];
    }
  },

  addPosition: async (formData) => {
    set({ isLoading: true });
    try {
      const payload = {
        underlying_symbol: formData.underlying_symbol,
        option_symbol: formData.option_symbol,
        trade_date: new DateObject(formData.trade_date).format("YYYY-MM-DD"),
        expiration_date: new DateObject(formData.expiration_date).format("YYYY-MM-DD"),
        strike_price: Number(formData.strike_price),
        contracts_count: Number(formData.contracts_count),
        shares_per_contract: Number(formData.shares_per_contract),
        premium_per_share: Number(formData.premium_per_share),
        commission: Number(formData.commission) || 0,
        underlying_cost_basis: Number(formData.underlying_cost_basis),
        notes: formData.notes,
      };
      const { error } = await supabase.from("covered_calls").insert(payload);
      if (error) throw error;

      await get().fetchPositions();
      showSuccessToast("پوزیشن کاورد کال با موفقیت ثبت شد.");
      return true;
    } catch (error) {
      showErrorAlert("خطا در ثبت پوزیشن کاورد کال.", error.message);
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
        trade_date: new DateObject(formData.trade_date).format("YYYY-MM-DD"),
        expiration_date: new DateObject(formData.expiration_date).format("YYYY-MM-DD"),
        strike_price: Number(formData.strike_price),
        contracts_count: Number(formData.contracts_count),
        shares_per_contract: Number(formData.shares_per_contract),
        premium_per_share: Number(formData.premium_per_share),
        commission: Number(formData.commission) || 0,
        underlying_cost_basis: Number(formData.underlying_cost_basis),
        notes: formData.notes,
      };
      const { error } = await supabase.from("covered_calls").update(payload).eq("id", id);
      if (error) throw error;

      await get().fetchPositions();
      showSuccessToast("معامله با موفقیت ویرایش شد.");
      return true;
    } catch(error) {
        showErrorAlert("خطا در ویرایش پوزیشن کاورد کال.", error.message);
        set({ isLoading: false, error: error.message });
        return false;
    }
  },
  
  resolvePosition: async (id, resolveData) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.rpc('resolve_covered_call', {
        p_id: id,
        p_status: resolveData.status,
        p_contracts_to_resolve: resolveData.contracts_count,
        p_closing_date: new DateObject(resolveData.closing_date).format("YYYY-MM-DD"),
        p_closing_price_per_share: resolveData.closing_price_per_share,
        p_closing_commission: resolveData.closing_commission
      });

      if (error) throw error;

      await get().fetchPositions();
      if (resolveData.status === 'ASSIGNED') {
        await useStockTradesStore.getState().fetchActions();
      }
      
      showSuccessToast("وضعیت پوزیشن با موفقیت ثبت شد.");
      return true;
    } catch (error) {
      showErrorAlert("خطا در ثبت وضعیت نهایی.", error.message);
      set({ isLoading: false, error: error.message });
      return false;
    }
  },
  
  reopenPosition: async (positionToReopen) => {
    set({ isLoading: true });
    try {
      const { underlying_symbol: underlyingSymbol } = positionToReopen;
      const allCoveredCallPositions = get().positions;

      const sharesToCoverReopen = positionToReopen.contracts_count * positionToReopen.shares_per_contract;
      const otherOpenPositions = allCoveredCallPositions.filter(p => p.status === 'OPEN' && p.id !== positionToReopen.id && p.underlying_symbol === underlyingSymbol);
      const requiredSharesForOthers = otherOpenPositions.reduce((sum, p) => sum + (p.contracts_count * p.shares_per_contract), 0);
      
      const currentHoldings = useStockTradesStore.getState().calculateCurrentHolding(underlyingSymbol);
      const freeShares = currentHoldings - requiredSharesForOthers;

      if (sharesToCoverReopen > freeShares) {
        showErrorAlert("بازگشایی امکان‌پذیر نیست", `برای بازگشایی این پوزیشن به ${sharesToCoverReopen.toLocaleString()} سهم آزاد نیاز دارید، اما تنها ${Math.floor(freeShares).toLocaleString()} سهم آزاد موجود است.`);
        set({ isLoading: false });
        return false;
      }

      if (positionToReopen.status === 'ASSIGNED') {
        const stockActions = useStockTradesStore.getState().actions;
        const readableNotePattern = `اعمال ${positionToReopen.contracts_count.toLocaleString('fa-IR')} عدد اختیار ${positionToReopen.option_symbol}`;
        const linkedSaleAction = stockActions.find(a => a.notes && a.notes.startsWith(readableNotePattern));
        
        if (linkedSaleAction) {
          const deleteSuccess = await useStockTradesStore.getState().deleteAction(linkedSaleAction.id, true);
          if (!deleteSuccess) throw new Error("حذف رویداد فروش مرتبط با این معامله با مشکل مواجه شد.");
        }
      }

      const matchingOpenPosition = allCoveredCallPositions.find(p => p.status === 'OPEN' && p.option_symbol === positionToReopen.option_symbol && p.id !== positionToReopen.id);

      if (matchingOpenPosition) {
        const newContractsCount = matchingOpenPosition.contracts_count + positionToReopen.contracts_count;
        const { error: updateError } = await supabase.from("covered_calls").update({ contracts_count: newContractsCount }).eq("id", matchingOpenPosition.id);
        if (updateError) throw updateError;

        const { error: deleteError } = await supabase.from("covered_calls").delete().eq("id", positionToReopen.id);
        if (deleteError) throw deleteError;
      } else {
        const updatePayload = { status: 'OPEN', closing_date: null, closing_price_per_share: null, closing_commission: null };
        const { error: reopenError } = await supabase.from("covered_calls").update(updatePayload).eq("id", positionToReopen.id);
        if (reopenError) throw reopenError;
      }

      await get().fetchPositions();
      await useStockTradesStore.getState().fetchActions();
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
      const { error } = await supabase.from("covered_calls").delete().eq("id", id);
      if(error) throw error;
      await get().fetchPositions();
      showSuccessToast("پوزیشن با موفقیت حذف شد.");
      return true;
    } catch (error) {
      showErrorAlert("خطا در حذف پوزیشن.", error.message);
      set({ isLoading: false, error: error.message });
      return false;
    }
  },
}));

export default useCoveredCallStore;