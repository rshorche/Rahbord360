import { create } from "zustand";
import { supabase } from "../../../shared/services/supabase";
import { showSuccessToast, showErrorAlert } from "../../../shared/utils/notifications";

const useAuthStore = create((set) => ({
  session: null,
  isLoading: false,
  sessionLoading: true, // <-- وضعیت جدید برای بارگذاری اولیه نشست

  setSession: (session) => set({ session }),
  setSessionLoading: (isLoading) => set({ sessionLoading: isLoading }), // <-- تابع جدید

  logIn: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      set({ session: data.session, isLoading: false });
      return true;
    } catch (error) {
      showErrorAlert("خطا در ورود", "ایمیل یا رمز عبور اشتباه است.");
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

  logOut: async () => {
    set({ isLoading: true });
    const { error } = await supabase.auth.signOut();
    if (error) {
      showErrorAlert("خطا در خروج از حساب کاربری", error.message);
    }
    set({ session: null, isLoading: false });
  },
}));

export default useAuthStore;