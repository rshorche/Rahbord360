import { create } from "zustand";
import { supabase } from "../services/supabase";

const useAllSymbolsStore = create((set) => ({
  symbols: [],
  isLoading: false,
  error: null,

  fetchAllSymbolsForSearch: async () => {
    set({ isLoading: true, error: null });
    try {
      const STOCK_DATA_RECORD_ID = "all";

      const { data: stockDataRecord, error } = await supabase
        .from("stock_data")
        .select("data")
        .eq("id", STOCK_DATA_RECORD_ID)
        .maybeSingle();

      if (error) {
        console.error(
          "خطا در واکشی همه نمادها از دیتابیس برای جستجو:",
          error.message
        );
        throw error;
      }

      if (stockDataRecord && Array.isArray(stockDataRecord.data)) {
        set({ symbols: stockDataRecord.data, isLoading: false });
      } else {
        console.warn(
          "داده معتبری برای نمادها در جدول stock_data برای ID:",
          STOCK_DATA_RECORD_ID,
          "یافت نشد. یا داده آرایه نیست."
        );
        set({ symbols: [], isLoading: false });
      }
    } catch (error) {
      console.error("خطا در واکشی نمادها برای جستجو:", error.message);
      set({ error: error.message, isLoading: false });
    }
  },
}));

export default useAllSymbolsStore;
