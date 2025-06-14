import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { ChevronDown } from "lucide-react";
import FormFieldWrapper from "./FormFieldWrapper";
import { cn } from "../../../../shared/utils/cn";

const SelectInput = ({
  label,
  name, 
  className,
  options = [],
  placeholder,
  value: controlledValue,
  onChange: controlledOnChange,
  ...props
}) => {
  const methods = useFormContext();

  const isControlledByForm = !!name && !!methods;

  const { register, formState: { errors } = {} } = isControlledByForm
    ? methods
    : {};

  if (name && !methods) {
    console.error(`SelectInput: "name" prop provided for "${name}", but no FormProvider context found. 
                    Ensure SelectInput is wrapped in FormProvider or remove "name" prop to use as a controlled component.`);
  }

  const error = isControlledByForm && errors && errors[name]?.message;
  const [isOpen, setIsOpen] = useState(false);

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
      name={name} 
      error={error}
      className={className}>
      <div className="relative w-full h-12">
        <select
          id={name}
          {...(isControlledByForm ? formRegisterProps : {})} 
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
