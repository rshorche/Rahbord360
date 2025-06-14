import { create } from "zustand";
import { supabase } from "../services/supabase";

const usePriceHistoryStore = create((set) => ({
  priceHistory: new Map(),
  isLoading: false,
  error: null,
  lastFetchTimestamp: null,

  fetchAllSymbolsFromDB: async () => {
    set({ isLoading: true, error: null });
    try {
      const STOCK_DATA_RECORD_ID = "all";

      const { data: stockDataRecord, error } = await supabase
        .from("stock_data")
        .select("data, fetched_at")
        .eq("id", STOCK_DATA_RECORD_ID)
        .single(); 

      if (error) {
        console.error(
          "خطا در واکشی آخرین داده سهام از دیتابیس:",
          error.message
        );
        throw error;
      }

      if (stockDataRecord && Array.isArray(stockDataRecord.data)) {
        const allSymbolsFromDB = stockDataRecord.data;

        const latestPricesMap = new Map();
        allSymbolsFromDB.forEach((s) => {
          if (s.l18 && s.pl !== undefined && s.pl !== null) {
            latestPricesMap.set(s.l18, {
              price: s.pl,
              timestamp: stockDataRecord.fetched_at,
            });
          }
        });
        set({
          priceHistory: latestPricesMap,
          isLoading: false,
          lastFetchTimestamp: stockDataRecord.fetched_at,
        });
      } else {
        console.warn(
          "داده معتبری در جدول stock_data برای ID:",
          STOCK_DATA_RECORD_ID,
          "یافت نشد. یا داده آرایه نیست."
        );
        set({
          priceHistory: new Map(),
          isLoading: false,
          lastFetchTimestamp: null,
        });
      }
    } catch (error) {
      console.error("خطا در واکشی آخرین قیمت‌ها از دیتابیس:", error.message);
      set({ error: error.message, isLoading: false, lastFetchTimestamp: null });
    }
  },
}));

export default usePriceHistoryStore;
