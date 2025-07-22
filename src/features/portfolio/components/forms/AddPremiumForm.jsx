import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { premiumSchema } from "../../utils/schemas";
import useStockTradesStore from "../../store/useStockTradesStore";
import DateInput from "../../../../shared/components/ui/forms/DateInput";
import TextInput from "../../../../shared/components/ui/forms/TextInput";
import Button from "../../../../shared/components/ui/Button";
import SelectInput from "../../../../shared/components/ui/forms/SelectInput";
import TextareaInput from "../../../../shared/components/ui/forms/TextareaInput"; // <-- Import added

export default function AddPremiumForm({
  onSubmitSuccess,
  portfolioSymbols = [],
  initialData,
  isEditMode = false,
}) {
  const { addAction, updateAction } = useStockTradesStore();

  const methods = useForm({
    resolver: yupResolver(premiumSchema),
    defaultValues: initialData
      ? { ...initialData, date: new Date(initialData.date), notes: initialData.notes || "" }
      : {
          date: new Date(),
          symbol: "",
          premium_type: "bonus_shares",
          quantity: "",
          amount: "",
          type: "premium",
          notes: "",
        },
  });

  const {
    handleSubmit,
    watch,
    reset,
    formState: { isSubmitting },
  } = methods;

  const selectedPremiumType = watch("premium_type");

  useEffect(() => {
    if (isEditMode && initialData) {
      reset({ ...initialData, date: new Date(initialData.date), notes: initialData.notes || "" });
    }
  }, [initialData, isEditMode, reset]);

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
        <p className="text-sm text-content-600">افزایش سرمایه از محل صرف سهام را ثبت کنید.</p>
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
        
        <div>
          <label className="block text-sm font-medium text-content-700 mb-2">نوع صرف سهام</label>
          <div className="flex gap-x-6">
            <label className="flex items-center gap-x-2 cursor-pointer">
              <input type="radio" value="bonus_shares" {...methods.register("premium_type")} className="h-4 w-4 text-primary-600 focus:ring-primary-500" />
              <span>دریافت سهام جایزه</span>
            </label>
            <label className="flex items-center gap-x-2 cursor-pointer">
              <input type="radio" value="cash_payment" {...methods.register("premium_type")} className="h-4 w-4 text-primary-600 focus:ring-primary-500" />
              <span>دریافت وجه نقد</span>
            </label>
          </div>
        </div>

        {selectedPremiumType === "bonus_shares" && (
          <div className="p-4 border border-content-200 rounded-lg bg-content-50">
            <TextInput name="quantity" label="تعداد سهام جایزه دریافتی" type="number" />
          </div>
        )}

        {selectedPremiumType === "cash_payment" && (
          <div className="p-4 border border-content-200 rounded-lg bg-content-50">
            <TextInput name="amount" label="مبلغ کل دریافتی (تومان)" type="number" />
          </div>
        )}

        <TextareaInput name="notes" label="یادداشت (اختیاری)" />
        <div className="flex justify-end pt-3">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? "در حال پردازش..." : (isEditMode ? "ذخیره تغییرات" : "ثبت رویداد")}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}