import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import Button from "../Button";
import FormFieldWrapper from "./FormFieldWrapper";
import { cn } from "../../../utils/cn";

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
          inputMode={isNumberInput ? "decimal" : props.inputMode}
          className={cn(
            "w-full h-12 bg-transparent px-3 text-sm text-content-800 placeholder:text-content-400 outline-none",
            "text-left direction-ltr",
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
            className="absolute left-1 h-8 w-8 text-content-500 hover:bg-transparent shadow-none"
            title={showPassword ? "پنهان کردن رمز" : "نمایش رمز"}>
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </Button>
        )}
      </div>
    </FormFieldWrapper>
  );
};

export default TextInput;