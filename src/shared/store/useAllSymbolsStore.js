import { create } from "zustand";
import { supabase } from "../services/supabase";

const useAllSymbolsStore = create((set) => ({
  symbols: [],
  isLoading: false,
  error: null,

  fetchAllSymbolsForSearch: async () => {
    if (set.getState && set.getState().symbols.length > 0) {
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const STOCK_DATA_RECORD_ID = "all";

      const { data: stockDataRecord, error } = await supabase
        .from("stock_data")
        .select("data")
        .eq("id", STOCK_DATA_RECORD_ID)
        .single();

      if (error) throw error;
      
      if (stockDataRecord && Array.isArray(stockDataRecord.data)) {
        set({ symbols: stockDataRecord.data, isLoading: false });
      } else {
        console.warn("No valid symbol data found in 'stock_data' table.");
        set({ symbols: [], isLoading: false });
      }
    } catch (error) {
      console.error("Error fetching all symbols for search:", error.message);
      set({ error: error.message, isLoading: false });
    }
  },
}));

export default useAllSymbolsStore;