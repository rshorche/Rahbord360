import { useFormContext } from "react-hook-form";
import FormFieldWrapper from "./FormFieldWrapper";
import { cn } from "../../../../shared/utils/cn";
import { ChevronDown } from "lucide-react";

const SelectInput = ({
  label,
  name,
  className,
  options = [],
  placeholder,
  value,
  onChange,
  ...props
}) => {
  const formContext = useFormContext();
  const isFormControlled = !!(formContext && name);

  const error = isFormControlled ? formContext.formState.errors[name]?.message : null;

  const registerProps = isFormControlled ? formContext.register(name) : {};

  return (
    <FormFieldWrapper
      label={label}
      name={name}
      error={error}
      className={className}
    >
      <div className="relative w-full h-12">
        <select
          id={name || undefined}
          {...registerProps}
          value={isFormControlled ? undefined : value}
          onChange={isFormControlled ? registerProps.onChange : onChange}
          className={cn(
            "w-full h-full bg-transparent px-3 text-sm text-content-800 outline-none appearance-none cursor-pointer"
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center px-2 text-content-500">
          <ChevronDown size={20} />
        </div>
      </div>
    </FormFieldWrapper>
  );
};

export default SelectInput;