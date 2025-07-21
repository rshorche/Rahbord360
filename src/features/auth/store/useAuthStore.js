import { create } from "zustand";
import { supabase } from "../../../shared/services/supabase";
import { showErrorAlert, showInfoAlert } from "../../../shared/utils/notifications"; // showSuccessToast was removed

const useAuthStore = create((set) => ({
  session: null,
  isLoading: false,
  sessionLoading: true,
  isPasswordRecovery: false,

  setSession: (session) => set({ session }),
  setSessionLoading: (isLoading) => set({ sessionLoading: isLoading }),
  setAuthEvent: (event) => {
    if (event === 'PASSWORD_RECOVERY') {
      set({ isPasswordRecovery: true });
    } else {
      set({ isPasswordRecovery: false });
    }
  },

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
      // Use a different name for the error variable to avoid conflict
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      if (signUpError) throw signUpError;
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
      set({ isLoading: false, isPasswordRecovery: false });
      return true;
    } catch (error) {
      showErrorAlert("خطا در به‌روزرسانی رمز عبور", "لینک بازیابی شما ممکن است منقضی شده باشد. لطفاً دوباره تلاش کنید.");
      set({ isLoading: false });
      return false;
    }
  },

  logOut: async () => {
    set({ isLoading: true });
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      showErrorAlert("خطا در خروج از حساب کاربری", signOutError.message);
    }
    set({ session: null, isLoading: false });
  },
}));

export default useAuthStore;