import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { updatePasswordSchema } from "../utils/authValidation";
import TextInput from "../../../shared/components/ui/forms/TextInput";
import Button from "../../../shared/components/ui/Button";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";

export default function UpdatePasswordPage() {
  const navigate = useNavigate();
  const { updatePassword, isLoading, sessionLoading, isPasswordRecovery } = useAuthStore();

  const methods = useForm({
    resolver: yupResolver(updatePasswordSchema),
  });

  const handleUpdatePassword = async (data) => {
    const success = await updatePassword(data.password);
    if (success) {
      navigate("/auth/login", { state: { message: "رمز عبور شما با موفقیت به‌روزرسانی شد. لطفاً وارد شوید." } });
    }
  };

  if (sessionLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoadingSpinner text="در حال بررسی لینک بازیابی..." />
      </div>
    );
  }

  if (!isPasswordRecovery) {
    return (
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full text-center">
        <h2 className="text-xl font-bold text-danger-700 mb-4">لینک نامعتبر یا منقضی شده</h2>
        <p className="text-content-600 mb-6">
          این لینک بازیابی دیگر معتبر نیست. لطفاً دوباره درخواست دهید.
        </p>
        <Link to="/auth/forgot-password">
          <Button variant="primary">بازگشت به صفحه فراموشی رمز</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
      <h2 className="text-2xl font-bold text-center text-content-800 mb-6">
        تنظیم رمز عبور جدید
      </h2>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handleUpdatePassword)} className="space-y-6">
          <TextInput
            name="password"
            label="رمز عبور جدید"
            type="password"
            placeholder="••••••••"
          />
          <TextInput
            name="confirmPassword"
            label="تکرار رمز عبور جدید"
            type="password"
            placeholder="••••••••"
          />
          <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
            {isLoading ? "در حال به‌روزرسانی..." : "ذخیره رمز عبور جدید"}
          </Button>
        </form>
      </FormProvider>
    </div>
  );
}