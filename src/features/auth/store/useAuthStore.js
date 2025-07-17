import { create } from "zustand";
import { supabase } from "../../../shared/services/supabase";
import { showErrorAlert, showInfoAlert, showSuccessToast } from "../../../shared/utils/notifications";

const useAuthStore = create((set) => ({
  session: null,
  isLoading: false,
  sessionLoading: true,
  authEvent: null,

  setSession: (session) => set({ session }),
  setSessionLoading: (isLoading) => set({ sessionLoading: isLoading }),
  setAuthEvent: (event) => set({ authEvent: event }),

  logIn: async ({ email, password }) => {
    set({ isLoading: true });
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
      set({ isLoading: false });
      return false;
    }
  },

  signUp: async ({ email, password }) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      showInfoAlert("ثبت نام موفق", "ایمیل تایید برای شما ارسال شد. لطفاً پوشه Spam خود را نیز بررسی کنید.");
      set({ isLoading: false });
      return true;
    } catch (error) {
      showErrorAlert("خطا در ثبت نام", error.message);
      set({ isLoading: false });
      return false;
    }
  },

  sendPasswordResetEmail: async (email) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      showInfoAlert("ایمیل ارسال شد", "لینک بازیابی رمز عبور برای شما ایمیل شد. لطفاً پوشه Spam خود را نیز بررسی کنید.");
      set({ isLoading: false });
      return true;
    } catch (error) {
      showErrorAlert("خطا در ارسال ایمیل", error.message);
      set({ isLoading: false });
      return false;
    }
  },

  updatePassword: async (newPassword) => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      set({ isLoading: false });
      return true;
    } catch (error) {
      showErrorAlert("خطا در به‌روزرسانی رمز عبور", "لینک بازیابی شما ممکن است منقضی شده باشد. لطفاً دوباره تلاش کنید.");
      set({ isLoading: false });
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