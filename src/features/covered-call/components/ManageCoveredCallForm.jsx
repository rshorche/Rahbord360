import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { manageCoveredCallSchema } from "../utils/schemas";
import DateInput from "../../../shared/components/ui/forms/DateInput";
import TextInput from "../../../shared/components/ui/forms/TextInput";
import Button from "../../../shared/components/ui/Button";

// 1. تعریف گزینه‌های وضعیت به صورت یک آرایه
const STATUS_OPTIONS = [
  { value: "CLOSED", label: "بستن دستی (Offset)" },
  { value: "EXPIRED", label: "منقضی شدن" },
  { value: "ASSIGNED", label: "اعمال شدن" },
];

/**
 * فرم مدیریت وضعیت نهایی یک پوزیشن کاورد کال
 * @param {object} props
 * @param {object} props.position - داده‌های پوزیشن انتخاب شده
 * @param {function(object): Promise<void>} props.onSubmit - تابعی که هنگام ارسال فرم فراخوانی می‌شود
 * @param {boolean} props.isLoading - وضعیت لودینگ برای دکمه ارسال
 */
export default function ManageCoveredCallForm({ position, onSubmit, isLoading }) {
  // 2. وابستگی به useCoveredCallStore حذف شد

  const methods = useForm({
    resolver: yupResolver(manageCoveredCallSchema),
    defaultValues: {
      status: "CLOSED",
      closing_date: new Date(position.expiration_date),
      contracts_count: position.contracts_count,
      closing_price_per_share: "",
      closing_commission: 0,
    },
  });

  const {
    handleSubmit,
    watch,
    setValue,
    register,
    formState: { isSubmitting },
  } = methods;

  const selectedStatus = watch("status");

  // اگر وضعیت روی "منقضی" یا "اعمال" تنظیم شود، تاریخ به صورت خودکار برابر با تاریخ سررسید می‌شود
  useEffect(() => {
    if (selectedStatus === "EXPIRED" || selectedStatus === "ASSIGNED") {
      setValue("closing_date", new Date(position.expiration_date));
    }
  }, [selectedStatus, setValue, position.expiration_date]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <p className="mb-2 text-sm text-content-600">
            وضعیت نهایی پوزیشن را برای{" "}
            <strong>{position.option_symbol}</strong> مشخص کنید.
          </p>
          {/* 3. رندر کردن گزینه‌ها با استفاده از map */}
          <div className="flex flex-col sm:flex-row sm:gap-x-4 gap-y-2">
            {STATUS_OPTIONS.map(option => (
              <label key={option.value} className="flex items-center gap-x-2 cursor-pointer">
                <input type="radio" value={option.value} {...register("status")} />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DateInput name="closing_date" label="تاریخ بستن / سررسید" />
          <TextInput
            name="contracts_count"
            label="تعداد قرارداد برای بستن"
            type="number"
          />
        </div>

        {/* این بخش فقط زمانی نمایش داده می‌شود که پوزیشن به صورت دستی بسته شود */}
        {selectedStatus === "CLOSED" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <TextInput
              name="closing_price_per_share"
              label="قیمت بستن (هر سهم)"
              type="number"
            />
            <TextInput name="closing_commission" label="کارمزد بستن" type="number" />
          </div>
        )}

        <div className="flex justify-end pt-3">
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting
              ? "در حال پردازش..."
              : "ثبت وضعیت نهایی"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}