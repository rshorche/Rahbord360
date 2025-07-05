import { create } from "zustand";
import { supabase } from "../services/supabase";

const usePriceHistoryStore = create((set) => ({
  priceHistory: new Map(),
  isLoading: false,
  error: null,
  lastFetchTimestamp: null,

  fetchAllSymbolsFromDB: async () => {
    if (set.getState && set.getState().lastFetchTimestamp) {
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const STOCK_DATA_RECORD_ID = "all";

      const { data: stockDataRecord, error } = await supabase
        .from("stock_data")
        .select("data, fetched_at")
        .eq("id", STOCK_DATA_RECORD_ID)
        .single();

      if (error) throw error;

      if (stockDataRecord && Array.isArray(stockDataRecord.data)) {
        const latestPricesMap = new Map();
        stockDataRecord.data.forEach((s) => {
          if (s.l18 && s.pl != null) {
            latestPricesMap.set(s.l18, {
              symbol: s.l18, 
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
        set({ priceHistory: new Map(), isLoading: false });
      }
    } catch (error) {
      console.error("Error fetching price history:", error.message);
      set({ error: error.message, isLoading: false });
    }
  },
}));

export default usePriceHistoryStore;