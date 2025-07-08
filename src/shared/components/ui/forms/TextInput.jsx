import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import Button from "../Button";
import FormFieldWrapper from "./FormFieldWrapper";
import { cn } from "../../../../shared/utils/cn";

const TextInput = ({
  label,
  name,
  type = "text",
  className,
  inputClassName,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message;

  const isPassword = type === "password";
  // --- 1. بخش کلیدی اصلاح شده ---
  // اگر نوع ورودی "number" بود، ما از نظر فنی از "text" استفاده می‌کنیم تا کنترل را در دست بگیریم،
  // اما با inputMode به کیبوردها می‌گوییم که عددی باشند.
  const isNumberInput = type === "number";
  const finalInputType = isPassword && showPassword ? "text" : isNumberInput ? "text" : type;

  return (
    <FormFieldWrapper
      label={label}
      name={name}
      error={error}
      className={className}>
      <div className="relative w-full flex items-center">
        <input
          {...register(name)}
          id={name}
          type={finalInputType}
          // --- 2. افزودن inputMode برای تجربه کاربری بهتر در موبایل ---
          inputMode={isNumberInput ? "decimal" : props.inputMode}
          className={cn(
            "w-full h-12 bg-transparent px-3 text-sm text-content-800 placeholder:text-content-400 outline-none",
            "text-left direction-ltr", // برای اینکه اعداد و نقطه به درستی نمایش داده شوند
            isPassword && "pl-10",
            inputClassName
          )}
          {...props}
        />
        {isPassword && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute left-1 h-8 w-8 text-content-500 hover:text-content-800 hover:bg-transparent shadow-none hover:shadow-none hover:translate-y-0"
            title={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
        )}
      </div>
    </FormFieldWrapper>
  );
};

export default TextInput;