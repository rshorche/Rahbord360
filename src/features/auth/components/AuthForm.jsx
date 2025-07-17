import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema, signupSchema } from "../utils/authValidation";
import TextInput from "../../../shared/components/ui/forms/TextInput";
import Button from "../../../shared/components/ui/Button";

export default function AuthForm({
  onSubmit,
  isLoading = false,
  isSignup = false,
}) {
  const methods = useForm({
    resolver: yupResolver(isSignup ? signupSchema : loginSchema),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
        <TextInput
          name="email"
          label="ایمیل"
          type="email"
          placeholder="email@example.com"
          autoComplete="email"
        />
        <TextInput
          name="password"
          label="رمز عبور"
          type="password"
          placeholder="••••••••"
          autoComplete={isSignup ? "new-password" : "current-password"}
        />
        {isSignup && (
          <TextInput
            name="confirmPassword"
            label="تکرار رمز عبور"
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
          />
        )}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "در حال پردازش..." : (isSignup ? "ایجاد حساب کاربری" : "ورود")}
        </Button>
      </form>
    </FormProvider>
  );
}