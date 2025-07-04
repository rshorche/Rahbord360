import { useEffect, useState } from "react";
import { supabase } from "../../../shared/services/supabase";
import useAuthStore from "../store/useAuthStore";
// ایمپورت استورهای دیگر
import useStockTradesStore from "../../portfolio/store/useStockTradesStore";
import useTransactionStore from "../../transactions/store/useTransactionStore";

export default function useSession() {
  const [sessionLoading, setSessionLoading] = useState(true);
  const { setSession, session } = useAuthStore();

  useEffect(() => {
    // ... (بخش getInitialSession بدون تغییر باقی می‌ماند)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // اگر کاربر وارد شد، داده‌هایش را واکشی کن
      if (session) {
        // این دو خط باید حتما کامنت باشند تا خطایی رخ ندهد
        // useStockTradesStore.getState().fetchActions();
        // useTransactionStore.getState().fetchTransactions();
      }
      setSessionLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [setSession]);

  return { session, sessionLoading };
}