import { useFormContext, Controller } from "react-hook-form";
import DatePicker, { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "react-multi-date-picker/styles/layouts/mobile.css";
import FormFieldWrapper from "./FormFieldWrapper";
import { cn } from "../../../../shared/utils/cn";
import { CalendarDays } from "lucide-react";

const DateInput = ({
  label,
  name,
  className,
  inputClassName,
  placeholder,
  rules = {},
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
        rules={rules}
        render={({ field: { onChange, onBlur, value } }) => {
          // تبدیل مقدار به شیء DateObject برای نمایش در تقویم
          const dateValue = value ? new DateObject({ date: value }) : null;

          return (
            <DatePicker
              id={name}
              value={dateValue}
              onBlur={onBlur}
              onClose={() => onBlur()}
              // onChange یک شیء DateObject برمی‌گرداند، ما آن را به Date استاندارد جاوااسکریپت تبدیل می‌کنیم
              onChange={(dateObject) => {
                onChange(dateObject ? dateObject.toDate() : null);
              }}
              calendar={persian}
              locale={persian_fa}
              calendarPosition="bottom-right"
              placeholder={placeholder}
              inputClass={cn(
                "w-full h-12 bg-transparent text-sm text-content-800 placeholder:text-content-400 outline-none ",
                inputClassName
              )}
              containerClassName="w-full h-full"
              arrow={false}
              {...props}
            />
          );
        }}
      />
    </FormFieldWrapper>
  );
};

export default DateInput;