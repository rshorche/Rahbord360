import { useFormContext } from "react-hook-form";
import FormFieldWrapper from "./FormFieldWrapper";
import { cn } from "../../../utils/cn";

const TextareaInput = ({
  label,
  name,
  className,
  rows = 3,
  ...props
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name]?.message;

  return (
    <FormFieldWrapper
      label={label}
      name={name}
      error={error}
      className={className}
      containerClassName="h-auto items-start py-2">
      <textarea
        {...register(name)}
        id={name}
        rows={rows}
        className={cn(
          "w-full bg-transparent py-1 px-3 text-sm text-content-800 placeholder:text-content-400 outline-none resize-none"
        )}
        {...props}
      />
    </FormFieldWrapper>
  );
};

export default TextareaInput;