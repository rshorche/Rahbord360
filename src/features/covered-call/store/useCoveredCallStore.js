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
      set({ positions: data || [], isLoading: false });
    } catch (error) {
      showErrorAlert("خطا در دریافت اطلاعات کاورد کال.");
      set({ error: error.message, isLoading: false });
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
    const originalPosition = get().positions.find(p => p.id === id);
    if (!originalPosition) return false;

    const contractsToClose = Number(resolveData.contracts_count) || 0;
    const isPartialClose = contractsToClose < originalPosition.contracts_count;

    set({ isLoading: true });
    try {
      if (resolveData.status === 'ASSIGNED') {
        const totalShares = contractsToClose * originalPosition.shares_per_contract;
        const strikePrice = Number(originalPosition.strike_price).toLocaleString('fa-IR');
        
        const readableNote = `اعمال اختیار ${originalPosition.option_symbol}: فروش ${totalShares.toLocaleString('fa-IR')} سهم با قیمت ${strikePrice} تومان`;
        const technicalNote = `[ref_cc:${id}]`;

        const saleAction = {
          type: 'sell',
          symbol: originalPosition.underlying_symbol,
          date: new DateObject(resolveData.closing_date).format("YYYY-MM-DD"),
          quantity: totalShares,
          price: originalPosition.strike_price,
          commission: 0,
          notes: `${readableNote} ||| ${technicalNote}`,
        };
        const saleSuccess = await useStockTradesStore.getState().addAction(saleAction, true);
        if (!saleSuccess) throw new Error("فروش خودکار سهام با مشکل مواجه شد.");
      }

      const closingPayload = {
        status: resolveData.status,
        closing_date: new DateObject(resolveData.closing_date).format("YYYY-MM-DD"),
        closing_price_per_share: resolveData.closing_price_per_share ? Number(resolveData.closing_price_per_share) : null,
        closing_commission: resolveData.closing_commission ? Number(resolveData.closing_commission) : null,
      };

      if (isPartialClose) {
        const newClosedPosition = { ...originalPosition, contracts_count: contractsToClose, ...closingPayload };
        delete newClosedPosition.id;
        delete newClosedPosition.created_at;

        const { error: insertError } = await supabase.from('covered_calls').insert(newClosedPosition);
        if (insertError) throw insertError;

        const updatedOriginalPosition = { contracts_count: originalPosition.contracts_count - contractsToClose };
        const { error: updateError } = await supabase.from('covered_calls').update(updatedOriginalPosition).eq('id', id);
        if (updateError) throw updateError;

      } else {
        const { error: fullUpdateError } = await supabase.from('covered_calls').update(closingPayload).eq('id', id);
        if (fullUpdateError) throw fullUpdateError;
      }
      
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
  
  reopenPosition: async (position) => {
    set({ isLoading: true });
    try {
      if (position.status === 'ASSIGNED') {
        const noteToFind = `[ref_cc:${position.id}]`;
        const stockActions = useStockTradesStore.getState().actions;
        const linkedSaleAction = stockActions.find(a => a.notes && a.notes.includes(noteToFind));
        
        if (linkedSaleAction) {
          const deleteSuccess = await useStockTradesStore.getState().deleteAction(linkedSaleAction.id);
          if (!deleteSuccess) throw new Error("حذف رویداد فروش مرتبط با این معامله با مشکل مواجه شد.");
        }
      }

      const updatePayload = {
        status: 'OPEN',
        closing_date: null,
        closing_price_per_share: null,
        closing_commission: null,
      };

      const { error } = await supabase.from("covered_calls").update(updatePayload).eq("id", position.id);
      if(error) throw error;

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