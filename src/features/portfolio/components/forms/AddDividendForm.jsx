import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { dividendSchema } from "../../utils/schemas";
import useStockTradesStore from "../../store/useStockTradesStore";
import DateInput from "../../../../shared/components/ui/forms/DateInput";
import TextInput from "../../../../shared/components/ui/forms/TextInput";
import Button from "../../../../shared/components/ui/Button";
import SelectInput from "../../../../shared/components/ui/forms/SelectInput";
import TextareaInput from "../../../../shared/components/ui/forms/TextareaInput"; // <-- Import added

export default function AddDividendForm({
  onSubmitSuccess,
  portfolioSymbols = [],
  initialData,
  isEditMode = false,
}) {
  const { addAction, updateAction } = useStockTradesStore();

  const methods = useForm({
    resolver: yupResolver(dividendSchema),
    defaultValues: initialData
      ? { ...initialData, date: new Date(initialData.date), notes: initialData.notes || "" }
      : {
          date: new Date(),
          symbol: "",
          amount: "",
          type: "dividend",
          notes: "",
        },
  });

  const {
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (isEditMode && initialData) {
      reset({ ...initialData, date: new Date(initialData.date), notes: initialData.notes || "" });
    } else if (!isEditMode) {
      reset({ date: new Date(), symbol: "", amount: "", type: "dividend", notes: "" });
    }
  }, [initialData, isEditMode, reset]);

  const handleFormSubmit = async (formData) => {
    const actionToSubmit = isEditMode
      ? { ...initialData, ...formData }
      : formData;

    const success = isEditMode
      ? await updateAction(initialData.id, actionToSubmit)
      : await addAction(actionToSubmit);

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
          سود نقدی دریافت شده برای یک نماد را ثبت کنید.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DateInput name="date" label="تاریخ دریافت سود" />
          <SelectInput
            name="symbol"
            label="انتخاب نماد"
            options={symbolOptions}
            placeholder="یک نماد انتخاب کنید"
            disabled={isEditMode}
          />
        </div>
        <TextInput
          name="amount"
          label="مبلغ کل سود نقدی (تومان)"
          type="number"
          inputMode="decimal"
        />
        <TextareaInput name="notes" label="یادداشت (اختیاری)" />
        <div className="flex justify-end pt-3">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "در حال پردازش..." : (isEditMode ? "ذخیره تغییرات" : "ثبت سود نقدی")}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}