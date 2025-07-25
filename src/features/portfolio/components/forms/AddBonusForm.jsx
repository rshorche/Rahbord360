import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { bonusSchema } from "../../utils/schemas";
import useStockTradesStore from "../../store/useStockTradesStore";
import DateInput from "../../../../shared/components/ui/forms/DateInput";
import TextInput from "../../../../shared/components/ui/forms/TextInput";
import Button from "../../../../shared/components/ui/Button";
import SelectInput from "../../../../shared/components/ui/forms/SelectInput";
import TextareaInput from "../../../../shared/components/ui/forms/TextareaInput";

const getInitialValues = (initialData) => ({
  date: initialData ? new Date(initialData.date) : new Date(),
  symbol: initialData ? initialData.symbol : "",
  quantity: initialData ? initialData.quantity : "",
  type: "bonus",
  notes: initialData ? initialData.notes || "" : "", // Ensure notes is always a string
});

export default function AddBonusForm({
  onSubmitSuccess,
  portfolioSymbols = [],
  initialData,
  isEditMode = false,
}) {
  const { addAction, updateAction } = useStockTradesStore();

  const methods = useForm({
    resolver: yupResolver(bonusSchema),
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
          تعداد سهام جایزه اضافه شده به یک نماد را ثبت کنید.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DateInput name="date" label="تاریخ تعلق گرفتن" />
          <SelectInput
            name="symbol"
            label="انتخاب نماد"
            options={symbolOptions}
            placeholder="یک نماد انتخاب کنید"
            disabled={isEditMode}
          />
        </div>
        <TextInput
          name="quantity"
          label="تعداد سهام جایزه"
          type="number"
          inputMode="numeric"
        />
        <TextareaInput name="notes" label="یادداشت (اختیاری)" />
        <div className="flex justify-end pt-3">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "در حال پردازش..." : (isEditMode ? "ذخیره تغییرات" : "ثبت سهام جایزه")}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}