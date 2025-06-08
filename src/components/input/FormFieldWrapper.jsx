import { cn } from "../../utils/cn";

const FormFieldWrapper = ({
  label,
  name,
  error,
  children,
  className,
  containerClassName,
}) => {
  const showErrorStyle = !!error;

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-content-700 mb-1.5 px-1">
          {label}
        </label>
      )}
      <div
        className={cn(
          "relative flex items-center rounded-lg border transition-all duration-200",
          showErrorStyle
            ? "border-danger-500 bg-danger-50 focus-within:ring-2 focus-within:ring-danger-500/50"
            : "border-content-300 bg-white focus-within:ring-2 focus-within:ring-primary-500/50",
          containerClassName
        )}>
        {children}
      </div>
      {showErrorStyle && (
        <p className="text-xs text-danger-700 mt-1.5 px-1">{error}</p>
      )}
    </div>
  );
};

export default FormFieldWrapper;
