import { useFormContext, Controller } from "react-hook-form";
import DatePicker from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "react-multi-date-picker/styles/layouts/mobile.css";
import FormFieldWrapper from "./FormFieldWrapper";
import { cn } from "../../../utils/cn";
import { CalendarDays } from "lucide-react";

const DateInput = ({
  label,
  name,
  className,
  ...props
}) => {
  const {
    control,
    formState: { errors },
  } = useFormContext();
  const error = errors[name]?.message;

  return (
    <FormFieldWrapper
      label={label}
      name={name}
      error={error}
      className={className}
      containerClassName="flex-row-reverse items-center pr-3"
    >
      <span className="pl-2 text-content-500">
        <CalendarDays size={20} />
      </span>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => {
          return (
            <DatePicker
              id={name}
              value={value}
              onBlur={onBlur}
              onChange={(dateObject) => {
                onChange(dateObject ? dateObject.toDate() : null);
              }}
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              inputClass={cn(
                "w-full h-12 bg-transparent text-sm text-content-800 outline-none"
              )}
              containerClassName="w-full h-full"
              arrow={false}
              portal 
              {...props}
            />
          );
        }}
      />
    </FormFieldWrapper>
  );
};

export default DateInput;