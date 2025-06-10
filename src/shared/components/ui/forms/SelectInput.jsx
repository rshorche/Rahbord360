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
  ...props
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message;

  const [isOpen, setIsOpen] = useState(false);
  const { onBlur, onChange, ...rest } = register(name);

  const handleFocus = () => setIsOpen(true);
  const handleBlur = (e) => {
    setIsOpen(false);
    onBlur(e);
  };
  const handleChange = (e) => {
    setIsOpen(false);
    onChange(e);
    e.target.blur();
  };

  return (
    <FormFieldWrapper
      label={label}
      name={name}
      error={error}
      className={className}>
      <div className="relative w-full h-12">
        <select
          id={name}
          {...rest}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          className={cn(
            "w-full h-full bg-transparent px-3 text-sm text-content-800 outline-none appearance-none cursor-pointer"
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
