import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema, signupSchema } from "../utils/authValidation";
import TextInput from "../../../shared/components/ui/forms/TextInput";
import Button from "../../../shared/components/ui/Button";

export default function AuthForm({
  isSignup = false,
  onSubmit,
  isLoading = false,
}) {
  const methods = useForm({
    resolver: yupResolver(isSignup ? signupSchema : loginSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <TextInput
          name="email"
          label="ایمیل"
          type="email"
          placeholder="email@example.com"
        />
        <TextInput
          name="password"
          label="رمز عبور"
          type="password"
          placeholder="••••••••"
        />
        {isSignup && (
          <TextInput
            name="confirmPassword"
            label="تکرار رمز عبور"
            type="password"
            placeholder="••••••••"
          />
        )}
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading
            ? "در حال پردازش..."
            : isSignup
            ? "ثبت نام"
            : "ورود"}
        </Button>
      </form>
    </FormProvider>
  );
}