import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { updatePasswordSchema } from "../utils/authValidation";
import TextInput from "../../../shared/components/ui/forms/TextInput";
import Button from "../../../shared/components/ui/Button";
import { useNavigate } from "react-router-dom";
import { showSuccessToast } from "../../../shared/utils/notifications";
import useAuthStore from "../store/useAuthStore";

export default function UpdatePasswordPage() {
  const navigate = useNavigate();
  const { updatePassword, isLoading } = useAuthStore();
  const methods = useForm({
    resolver: yupResolver(updatePasswordSchema),
  });

  const handleUpdatePassword = async (data) => {
    const success = await updatePassword(data.password);
    if (success) {
      showSuccessToast("رمز عبور شما با موفقیت به‌روزرسانی شد. لطفاً وارد شوید.");
      navigate("/auth/login");
    }
  };

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