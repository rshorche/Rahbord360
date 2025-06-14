import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { revaluationSchema } from "../../utils/schemas";
import useStockTradesStore from "../../store/useStockTradesStore";
import DateInput from "../../../../shared/components/ui/forms/DateInput";
import TextInput from "../../../../shared/components/ui/forms/TextInput";
import Button from "../../../../shared/components/ui/Button";
import SelectInput from "../../../../shared/components/ui/forms/SelectInput";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default function AddRevaluationForm({
  onSubmitSuccess,
  portfolioSymbols = [],
  initialData,
  isEditMode = false,
}) {
  const { addAction, updateAction } = useStockTradesStore();
  const methods = useForm({
    resolver: yupResolver(revaluationSchema),
    defaultValues: initialData || {
      date: new DateObject({ calendar: persian, locale: persian_fa }),
      symbol: "",
      revaluation_percentage: "",
      type: "revaluation",
    },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

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
      reset(dataWithDateObject);
    } else if (!isEditMode) {
      reset({
        date: new DateObject({ calendar: persian, locale: persian_fa }),
        symbol: "",
        revaluation_percentage: "",
        type: "revaluation",
      });
    }
  }, [initialData, isEditMode, reset]);

  const handleFormSubmit = async (formData) => {
    const revaluationAction = {
      ...formData,
      revaluation_percentage: parseFloat(formData.revaluation_percentage),
      date:
        formData.date instanceof DateObject
          ? formData.date.format("YYYY/MM/DD")
          : formData.date,
      price: 0,
      quantity: 0,
      commission: 0,
      amount: 0,
      notes: "افزایش سرمایه از محل تجدید ارزیابی",
    };
    let success = false;
    if (isEditMode) {
      success = await updateAction(initialData.id, revaluationAction);
    } else {
      success = await addAction(revaluationAction);
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
          افزایش سرمایه از محل تجدید ارزیابی دارایی‌ها را ثبت کنید.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DateInput name="date" label="تاریخ رویداد" />
          <SelectInput
            name="symbol"
            label="انتخاب نماد"
            options={symbolOptions}
            placeholder="یک نماد انتخاب کنید"
          />
        </div>
        <TextInput
          name="revaluation_percentage"
          label="درصد افزایش سرمایه"
          type="number"
          inputMode="decimal"
        />
        <div className="flex justify-end pt-3">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isEditMode ? "ذخیره تغییرات" : "ثبت تجدید ارزیابی"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
