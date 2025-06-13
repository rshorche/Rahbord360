// src/shared/components/ui/forms/SelectInput.jsx
import { useState } from "react";
import { useFormContext } from "react-hook-form"; // این هوک همیشه فراخوانی می‌شود
import { ChevronDown } from "lucide-react";
import FormFieldWrapper from "./FormFieldWrapper";
import { cn } from "../../../../shared/utils/cn";

const SelectInput = ({
  label,
  name, // این prop نشان دهنده استفاده از react-hook-form است
  className,
  options = [],
  placeholder,
  // این پراپرتی‌ها برای زمانی هستند که از react-hook-form استفاده نمی‌شود
  value: controlledValue,
  onChange: controlledOnChange,
  ...props
}) => {
  // useFormContext را همیشه فراخوانی می‌کنیم، اما ممکن است null برگرداند اگر در FormProvider نباشیم
  const methods = useFormContext();

  // اگر name داریم، یعنی انتظار داریم در FormProvider باشیم. در غیر این صورت، از register استفاده نمی‌کنیم.
  const isControlledByForm = !!name && !!methods;

  // اگر isControlledByForm فعال است، register و errors را از methods می‌گیریم
  const { register, formState: { errors } = {} } = isControlledByForm
    ? methods
    : {};

  // خطایابی واضح‌تر اگر name داریم ولی context نیست
  if (name && !methods) {
    console.error(`SelectInput: "name" prop provided for "${name}", but no FormProvider context found. 
                    Ensure SelectInput is wrapped in FormProvider or remove "name" prop to use as a controlled component.`);
  }

  const error = isControlledByForm && errors && errors[name]?.message;
  const [isOpen, setIsOpen] = useState(false);

  // منطق برای onBlur و onChange بسته به اینکه توسط فرم کنترل می‌شود یا به صورت دستی
  const formRegisterProps = isControlledByForm ? register(name) : {};
  const handleOnBlur = (e) => {
    setIsOpen(false);
    if (isControlledByForm && formRegisterProps.onBlur)
      formRegisterProps.onBlur(e);
    else if (controlledOnChange) controlledOnChange(e);
  };

  const handleOnChange = (e) => {
    setIsOpen(false);
    if (isControlledByForm && formRegisterProps.onChange)
      formRegisterProps.onChange(e);
    if (controlledOnChange) controlledOnChange(e);
    e.target.blur();
  };

  const displayValue = isControlledByForm
    ? methods.watch(name)
    : controlledValue;

  return (
    <FormFieldWrapper
      label={label}
      name={name} // name همچنان برای htmlFor و ارورها استفاده می‌شود
      error={error}
      className={className}>
      <div className="relative w-full h-12">
        <select
          id={name}
          {...(isControlledByForm ? formRegisterProps : {})} // اعمال پراپ‌های register فقط اگر با فرم کنترل می‌شود
          onFocus={() => setIsOpen(true)}
          onBlur={handleOnBlur}
          onChange={handleOnChange}
          value={displayValue || ""}
          className={cn(
            "w-full h-full bg-transparent px-3 text-sm text-content-800 outline-none appearance-none cursor-pointer",
            { "text-content-400": !displayValue && placeholder }
          )}
          {...props}>
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map(({ label, value }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-content-500">
          <ChevronDown
            size={20}
            className={cn("transition-transform duration-200", {
              "rotate-180": isOpen,
            })}
          />
        </div>
      </div>
    </FormFieldWrapper>
  );
};

export default SelectInput;
