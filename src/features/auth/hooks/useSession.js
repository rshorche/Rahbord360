import { useEffect } from "react";
import { supabase } from "../../../shared/services/supabase";
import useAuthStore from "../store/useAuthStore";
import useTransactionStore from "../../transactions/store/useTransactionStore";
import useStockTradesStore from "../../portfolio/store/useStockTradesStore";
import useAllSymbolsStore from "../../../shared/store/useAllSymbolsStore";
import usePriceHistoryStore from "../../../shared/store/usePriceHistoryStore";

// This hook no longer returns anything. Its only job is to update the central store.
export default function useSession() {
  const { setSession, setSessionLoading } = useAuthStore();

  useEffect(() => {
    const fetchAllData = () => {
      useTransactionStore.getState().fetchTransactions();
      useStockTradesStore.getState().fetchActions();
      useAllSymbolsStore.getState().fetchAllSymbolsForSearch();
      usePriceHistoryStore.getState().fetchAllSymbolsFromDB();
    };

    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        fetchAllData();
      }
      setSessionLoading(false); // Signal that the initial session check is complete
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // We only want this to run once on app startup
}