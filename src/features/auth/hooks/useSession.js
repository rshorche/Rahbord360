import { useEffect } from "react";
import { supabase } from "../../../shared/services/supabase";
import useAuthStore from "../store/useAuthStore";
import useTransactionStore from "../../transactions/store/useTransactionStore";
import useStockTradesStore from "../../portfolio/store/useStockTradesStore";
import useAllSymbolsStore from "../../../shared/store/useAllSymbolsStore";
import usePriceHistoryStore from "../../../shared/store/usePriceHistoryStore";
import useCoveredCallStore from "../../covered-call/store/useCoveredCallStore";
import useOptionsStore from "../../options/store/useOptionsStore";
import useFundTradesStore from "../../funds/store/useFundTradesStore";

export default function useSession() {
  const { setSession, setSessionLoading, setAuthEvent } = useAuthStore();

  useEffect(() => {
    const fetchAllData = () => {
      useTransactionStore.getState().fetchTransactions();
      useStockTradesStore.getState().fetchActions();
      useAllSymbolsStore.getState().fetchAllSymbolsForSearch();
      usePriceHistoryStore.getState().fetchAllSymbolsFromDB();
      useCoveredCallStore.getState().fetchPositions();
      useOptionsStore.getState().fetchPositions();
      useFundTradesStore.getState().fetchTrades();
    };

    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      if (session) {
        fetchAllData();
      }
      setSessionLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setAuthEvent(event);
      if (event === 'SIGNED_IN') {
        fetchAllData();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}