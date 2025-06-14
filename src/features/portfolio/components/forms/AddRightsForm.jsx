import { useEffect } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { rightsIssueSchema } from "../../utils/schemas";
import useStockTradesStore from "../../store/useStockTradesStore";
import DateInput from "../../../../shared/components/ui/forms/DateInput";
import TextInput from "../../../../shared/components/ui/forms/TextInput";
import Button from "../../../../shared/components/ui/Button";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import SelectInput from "../../../../shared/components/ui/forms/SelectInput"; 
import { cn } from "../../../../shared/utils/cn";

export default function AddRightsForm({
  onSubmitSuccess,
  portfolioSymbols = [],
  initialData,
  isEditMode = false,
}) {
  const { addAction, updateAction } = useStockTradesStore();
  const methods = useForm({
    resolver: yupResolver(rightsIssueSchema),
    defaultValues: initialData || {
      date: new DateObject({ calendar: persian, locale: persian_fa }),
      symbol: "",
      outcome: "exercise",
      quantity: "",
      price: 1000,
      commission: 0,
      amount: "",
    },
  });

  const {
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting },
  } = methods;

  const selectedOutcome = watch("outcome");

  useEffect(() => {
    if (isEditMode && initialData) {
      const dataWithDateObject = {
        ...initialData,
        date: initialData.date
          ? new DateObject({
              date: initialData.date,
              format: "YYYY/MM/DD",
              calendar: persian,
              locale: persian_fa,
            })
          : new DateObject({ calendar: persian, locale: persian_fa }),
      };
      dataWithDateObject.quantity = initialData.quantity ?? "";
      dataWithDateObject.price = initialData.price ?? "";
      dataWithDateObject.commission = initialData.commission ?? 0;
      dataWithDateObject.amount = initialData.amount ?? "";

      reset(dataWithDateObject);
    } else if (!isEditMode) {
      reset({
        date: new DateObject({ calendar: persian, locale: persian_fa }),
        symbol: "",
        outcome: "exercise",
        quantity: "",
        price: 1000,
        commission: 0,
        amount: "",
      });
    }
  }, [initialData, isEditMode, reset, methods]);

  const handleFormSubmit = async (formData) => {
    let action = {
      ...formData,
      date:
        formData.date instanceof DateObject
          ? formData.date.format("YYYY/MM/DD")
          : formData.date,
      // Ensure numeric fields are parsed correctly, default to 0 if empty
      price: parseFloat(formData.price) || 0,
      quantity: parseFloat(formData.quantity) || 0,
      commission: parseFloat(formData.commission) || 0,
      amount: parseFloat(formData.amount) || 0,
    };

    // Set type and notes based on selected outcome
    if (formData.outcome === "exercise") {
      action.type = "rights_exercise";
      action.notes = "استفاده از حق تقدم";
      // Clear unnecessary fields for this type
      action.amount = 0;
    } else {
      action.type = "rights_sell";
      action.notes = "فروش حق تقدم";
      action.price = 0;
      action.quantity = 0;
      action.commission = 0;
    }

    let success = false;
    if (isEditMode) {
      success = await updateAction(initialData.id, action);
    } else {
      success = await addAction(action);
    }
    if (success && onSubmitSuccess) onSubmitSuccess();
  };

  const symbolOptions = portfolioSymbols.map((symbol) => ({
    value: symbol,
    label: symbol,
  }));

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <p className="text-sm text-content-600">
          نتیجه حق تقدم‌های تعلق گرفته به یک نماد را ثبت کنید.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DateInput name="date" label="تاریخ رویداد" />
          <SelectInput
            name="symbol"
            label="انتخاب نماد اصلی"
            options={symbolOptions}
            placeholder="نماد را انتخاب کنید"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-content-700 mb-2">
            نتیجه حق تقدم
          </label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
              <input
                type="radio"
                value="exercise"
                {...methods.register("outcome")}
                className={cn(
                  "h-4 w-4 text-primary-600 border-content-300 focus:ring-primary-500"
                )}
              />
              <span className="text-sm">استفاده از حق (خرید سهم)</span>
            </label>
            <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
              <input
                type="radio"
                value="sell"
                {...methods.register("outcome")}
                className={cn(
                  "h-4 w-4 text-primary-600 border-content-300 focus:ring-primary-500"
                )}
              />
              <span className="text-sm">فروش حق تقدم</span>
            </label>
          </div>
        </div>
        {selectedOutcome === "exercise" && (
          <div
            className={cn(
              "grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 border border-content-200 rounded-lg bg-content-50"
            )}>
            <TextInput
              name="quantity"
              label="تعداد سهام خریداری شده"
              type="number"
              inputMode="numeric"
            />
            <TextInput
              name="price"
              label="قیمت پذیره‌نویسی (هر سهم)"
              type="number"
              inputMode="decimal"
            />
            <TextInput
              name="commission"
              label="کارمزد"
              type="number"
              inputMode="decimal"
            />
          </div>
        )}
        {selectedOutcome === "sell" && (
          <div
            className={cn(
              "p-4 border border-content-200 rounded-lg bg-content-50"
            )}>
            <TextInput
              name="amount"
              label="مبلغ کل فروش حق تقدم (تومان)"
              type="number"
              inputMode="decimal"
            />
          </div>
        )}
        <div className="flex justify-end pt-3">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isEditMode ? "ذخیره تغییرات" : "ثبت رویداد حق تقدم"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
