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
    if (get().positions.length > 0) return get().positions;
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("covered_calls")
        .select("*")
        .order("trade_date", { ascending: false });

      if (error) throw error;
      set({ positions: data || [], isLoading: false });
      return data || [];
    } catch (error) {
      console.error("Error fetching covered call positions:", error.message);
      showErrorAlert("خطا در دریافت اطلاعات کاورد کال.");
      set({ error: error.message, isLoading: false });
      return [];
    }
  },

  addPosition: async (newPositionData) => {
    // منطق اعتبارسنجی ...
    const requiredShares = (Number(newPositionData.contracts_count) || 0) * (Number(newPositionData.shares_per_contract) || 1000);
    const sharesAlreadyCovering = get().positions
      .filter(p => p.underlying_symbol === newPositionData.underlying_symbol && p.status === 'OPEN')
      .reduce((sum, p) => sum + (p.contracts_count * p.shares_per_contract), 0);
    const trulyAvailableShares = newPositionData.availableShares - sharesAlreadyCovering;

    if (requiredShares > trulyAvailableShares) {
        showErrorAlert("خطا: سهام آزاد کافی نیست", `شما برای پوشش این معامله به ${requiredShares.toLocaleString()} سهم نیاز دارید، اما فقط ${Math.floor(trulyAvailableShares).toLocaleString()} سهم آزاد در پورتفولیوی خود دارید.`);
        return false;
    }

    set({ isLoading: true });
    try {
      const payload = {
        underlying_symbol: newPositionData.underlying_symbol,
        option_symbol: newPositionData.option_symbol,
        trade_date: new DateObject(newPositionData.trade_date).format("YYYY-MM-DD"),
        expiration_date: new DateObject(newPositionData.expiration_date).format("YYYY-MM-DD"),
        strike_price: Number(newPositionData.strike_price),
        contracts_count: Number(newPositionData.contracts_count),
        shares_per_contract: Number(newPositionData.shares_per_contract),
        premium_per_share: Number(newPositionData.premium_per_share),
        commission: Number(newPositionData.commission),
        underlying_cost_basis: Number(newPositionData.underlying_cost_basis),
        notes: newPositionData.notes,
      };

      const { data, error } = await supabase.from("covered_calls").insert(payload).select().single();
      if (error) throw error;

      set((state) => ({
        positions: [data, ...state.positions].sort((a, b) => new Date(b.trade_date) - new Date(a.date)),
        isLoading: false,
      }));
      showSuccessToast("پوزیشن کاورد کال با موفقیت ثبت شد.");
      return true;
    } catch (error) {
      console.error("Error adding covered call position:", error.message);
      showErrorAlert("خطا در ثبت پوزیشن کاورد کال.");
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

  updatePosition: async (id, updatedData) => {
    // منطق اعتبارسنجی ...
    const { contracts_count, shares_per_contract, underlying_symbol, availableShares } = updatedData;
    const requiredShares = (Number(contracts_count) || 0) * (Number(shares_per_contract) || 1000);
    
    const sharesCoveringOtherPositions = get().positions
      .filter(p => p.underlying_symbol === underlying_symbol && p.status === 'OPEN' && p.id !== id)
      .reduce((sum, p) => sum + (p.contracts_count * p.shares_per_contract), 0);
      
    const trulyAvailableShares = availableShares - sharesCoveringOtherPositions;

    if (requiredShares > trulyAvailableShares) {
      showErrorAlert("خطا: سهام آزاد کافی نیست", `شما برای پوشش این تعداد قرارداد به ${requiredShares.toLocaleString()} سهم نیاز دارید، اما با احتساب دیگر معاملات باز، فقط ${Math.floor(trulyAvailableShares).toLocaleString()} سهم آزاد در پورتفولیوی خود دارید.`);
      return false;
    }

    set({ isLoading: true });
    try {
      // --- بخش کلیدی اصلاح شده ---
      // تبدیل تمام مقادیر رشته‌ای به نوع داده صحیح قبل از ارسال به دیتابیس
      const payload = {
        underlying_symbol: updatedData.underlying_symbol,
        option_symbol: updatedData.option_symbol,
        trade_date: new DateObject(updatedData.trade_date).format("YYYY-MM-DD"),
        expiration_date: new DateObject(updatedData.expiration_date).format("YYYY-MM-DD"),
        strike_price: Number(updatedData.strike_price),
        contracts_count: Number(updatedData.contracts_count),
        shares_per_contract: Number(updatedData.shares_per_contract),
        premium_per_share: Number(updatedData.premium_per_share),
        commission: Number(updatedData.commission),
        underlying_cost_basis: Number(updatedData.underlying_cost_basis),
        notes: updatedData.notes,
      };
      
      const { data, error } = await supabase.from("covered_calls").update(payload).eq("id", id).select().single();
      if (error) throw error;
      
      set(state => ({
          positions: state.positions.map(p => (p.id === id ? data : p)),
          isLoading: false
      }));
      showSuccessToast("معامله با موفقیت ویرایش شد.");
      return true;

    } catch(error) {
        console.error("Error updating covered call position:", error.message);
        showErrorAlert("خطا در ویرایش پوزیشن کاورد کال.", "مشکلی در ذخیره‌سازی اطلاعات رخ داد.");
        set({ isLoading: false, error: error.message });
        return false;
    }
  },
  
  resolvePosition: async (id, resolveData) => {
    set({ isLoading: true });
    try {
        const payload = {
            p_id: id,
            p_status: resolveData.status,
            p_contracts_to_resolve: Number(resolveData.contracts_count),
            p_closing_date: new DateObject(resolveData.closing_date).format("YYYY-MM-DD"),
            p_closing_price_per_share: resolveData.closing_price_per_share ? Number(resolveData.closing_price_per_share) : null,
            p_closing_commission: resolveData.closing_commission ? Number(resolveData.closing_commission) : null,
        };
        const { error } = await supabase.rpc('resolve_covered_call', payload);
        if (error) throw error;
        
        set({ positions: [] }); 
        await get().fetchPositions();
        if (resolveData.status === 'ASSIGNED') {
          await useStockTradesStore.getState().fetchActions();
        }
        showSuccessToast("وضعیت پوزیشن با موفقیت ثبت شد.");
        set({ isLoading: false });
        return true;
    } catch (error) {
        console.error("Error resolving position:", error.message);
        showErrorAlert("خطا در ثبت وضعیت نهایی.", error.message);
        set({ isLoading: false, error: error.message });
        return false;
    }
  },
  
  deletePosition: async (id) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.from("covered_calls").delete().eq("id", id);
      if (error) throw error;
      set((state) => ({
        positions: state.positions.filter((p) => p.id !== id),
        isLoading: false,
      }));
      showSuccessToast("پوزیشن با موفقیت حذف شد.");
      return true;
    } catch (error) {
      console.error("Error deleting covered call position:", error.message);
      showErrorAlert("خطا در حذف پوزیشن.");
      set({ isLoading: false, error: error.message });
      return false;
    }
  },
}));

export default useCoveredCallStore;