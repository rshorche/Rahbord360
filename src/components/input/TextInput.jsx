import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import FormFieldWrapper from "./FormFieldWrapper";
import Button from "../common/Button";
import { cn } from "../../utils/cn";

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
  const currentInputType = isPassword && showPassword ? "text" : type;

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
          type={currentInputType}
          className={cn(
            "w-full h-12 bg-transparent px-3 text-sm text-content-800 placeholder:text-content-400 outline-none",
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
