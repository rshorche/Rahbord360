import { create } from "zustand";
import { supabase } from "../../../shared/services/supabase";
import { showSuccessToast, showErrorAlert } from "../../../shared/utils/notifications";

const useAuthStore = create((set) => ({
  session: null,
  isLoading: false,
  error: null,

  setSession: (session) => set({ session }),

  signUp: async ({ email, password }) => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        showErrorAlert("این کاربر قبلاً ثبت نام کرده است. لطفاً وارد شوید.");
      } else {
        showSuccessToast("ایمیل تایید برای شما ارسال شد. لطفاً صندوق ورودی خود را چک کنید.");
      }
      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error("Error signing up:", error.message);
      showErrorAlert("خطا در ثبت نام", error.message);
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

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
      console.error("Error logging in:", error.message);
      showErrorAlert("خطا در ورود", "ایمیل یا رمز عبور اشتباه است.");
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

  sendPasswordResetEmail: async (email) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      if (error) throw error;
      showSuccessToast("ایمیل بازیابی رمز عبور برای شما ارسال شد.");
      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error("Error sending password reset email:", error.message);
      showErrorAlert("خطا در ارسال ایمیل", error.message);
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

  updatePassword: async (newPassword) => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error("Error updating password:", error.message);
      showErrorAlert("خطا در به‌روزرسانی رمز عبور", "لینک بازیابی شما نامعتبر یا منقضی شده است. لطفاً دوباره تلاش کنید.");
      set({ isLoading: false, error: error.message });
      return false;
    }
  },

  logOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error logging out:", error.message);
      showErrorAlert("خطا در خروج از حساب کاربری", error.message);
    }
  },
}));

export default useAuthStore;