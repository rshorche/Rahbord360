import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../utils/authValidation";
import TextInput from "../../../shared/components/ui/forms/TextInput";
import Button from "../../../shared/components/ui/Button";

export default function AuthForm({
  onSubmit,
  isLoading = false,
}) {
  const methods = useForm({
    resolver: yupResolver(loginSchema),
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)} className="space-y-6">
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
        <Button
          type="submit"
          variant="primary"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? "در حال پردازش..." : "ورود"}
        </Button>
      </form>
    </FormProvider>
  );
}