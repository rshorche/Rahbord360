import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { revaluationSchema } from "../../utils/schemas";
import useStockTradesStore from "../../store/useStockTradesStore";
import DateInput from "../../../../shared/components/ui/forms/DateInput";
import TextInput from "../../../../shared/components/ui/forms/TextInput";
import Button from "../../../../shared/components/ui/Button";
import SelectInput from "../../../../shared/components/ui/forms/SelectInput";
import TextareaInput from "../../../../shared/components/ui/forms/TextareaInput";

const getInitialValues = (initialData) => ({
  date: initialData ? new Date(initialData.date) : new Date(),
  symbol: initialData ? initialData.symbol : "",
  revaluation_percentage: initialData ? initialData.revaluation_percentage : "",
  type: "revaluation",
  notes: initialData ? initialData.notes || "" : "", // Ensure notes is always a string
});

export default function AddRevaluationForm({
  onSubmitSuccess,
  portfolioSymbols = [],
  initialData,
  isEditMode = false,
}) {
  const { addAction, updateAction } = useStockTradesStore();

  const methods = useForm({
    resolver: yupResolver(revaluationSchema),
    defaultValues: getInitialValues(initialData),
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    reset(getInitialValues(initialData));
  }, [initialData, reset]);

  const handleFormSubmit = async (formData) => {
    const success = isEditMode
      ? await updateAction(initialData.id, formData)
      : await addAction(formData);

    if (success && onSubmitSuccess) {
      onSubmitSuccess();
    }
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
            disabled={isEditMode}
          />
        </div>
        <TextInput
          name="revaluation_percentage"
          label="درصد افزایش سرمایه (٪)"
          type="number"
          inputMode="decimal"
          placeholder="مثلاً: 500 برای 500٪"
        />
        <TextareaInput name="notes" label="یادداشت (اختیاری)" />
        <div className="flex justify-end pt-3">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "در حال پردازش..." : (isEditMode ? "ذخیره تغییرات" : "ثبت تجدید ارزیابی")}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}