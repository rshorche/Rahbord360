import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { forgotPasswordSchema } from "../utils/authValidation";
import TextInput from "../../../shared/components/ui/forms/TextInput";
import Button from "../../../shared/components/ui/Button";
import { Link } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

export default function ForgotPasswordPage() {
  const { sendPasswordResetEmail, isLoading } = useAuthStore();
  const methods = useForm({
    resolver: yupResolver(forgotPasswordSchema),
  });

  const handlePasswordReset = async (data) => {
    await sendPasswordResetEmail(data.email);
    methods.reset();
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-xl w-full">
      <h2 className="text-2xl font-bold text-center text-content-800 mb-2">
        بازیابی رمز عبور
      </h2>
      <p className="text-center text-sm text-content-600 mb-6">
        ایمیل خود را وارد کنید تا لینک بازیابی برایتان ارسال شود.
      </p>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(handlePasswordReset)} className="space-y-6">
          <TextInput
            name="email"
            label="ایمیل"
            type="email"
            placeholder="email@example.com"
          />
          <Button type="submit" variant="primary" className="w-full" disabled={isLoading}>
            {isLoading ? "در حال ارسال..." : "ارسال لینک بازیابی"}
          </Button>
        </form>
      </FormProvider>
      <p className="text-center text-sm text-content-600 mt-6">
        <Link to="/auth/login" className="font-medium text-primary-600 hover:underline">
          بازگشت به صفحه ورود
        </Link>
      </p>
    </div>
  );
}