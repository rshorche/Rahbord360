import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { rightsIssueSchema } from "../../utils/schemas";
import useStockTradesStore from "../../store/useStockTradesStore";
import DateInput from "../../../../shared/components/ui/forms/DateInput";
import TextInput from "../../../../shared/components/ui/forms/TextInput";
import Button from "../../../../shared/components/ui/Button";
import SelectInput from "../../../../shared/components/ui/forms/SelectInput";
import { cn } from "../../../../shared/utils/cn";

export default function AddRightsForm({
  onSubmitSuccess,
  portfolioSymbols = [],
  initialData,
  isEditMode = false,
}) {
  const { addAction, updateAction, isLoading } = useStockTradesStore();

  const methods = useForm({
    resolver: yupResolver(rightsIssueSchema),
    defaultValues: initialData
      ? { ...initialData, date: new Date(initialData.date), outcome: initialData.type === 'rights_sell' ? 'sell' : 'exercise' }
      : {
          date: new Date(),
          symbol: "",
          outcome: "exercise",
          quantity: "",
          price: "100",
          commission: "0",
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
      const outcome = initialData.type === 'rights_sell' ? 'sell' : 'exercise';
      reset({ ...initialData, date: new Date(initialData.date), outcome });
    }
  }, [initialData, isEditMode, reset]);


  const handleFormSubmit = async (formData) => {
    const finalData = {
      ...formData,
      type: formData.outcome === 'exercise' ? 'rights_exercise' : 'rights_sell',
    };

    const success = isEditMode
      ? await updateAction(initialData.id, finalData)
      : await addAction(finalData);

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
          نتیجه حق تقدم‌های تعلق گرفته به یک نماد را ثبت کنید.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DateInput name="date" label="تاریخ رویداد" />
          <SelectInput name="symbol" label="انتخاب نماد اصلی" options={symbolOptions} placeholder="نماد را انتخاب کنید" />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-content-700 mb-2">نتیجه حق تقدم</label>
          <div className="flex gap-x-6">
            <label className="flex items-center gap-x-2 cursor-pointer">
              <input type="radio" value="exercise" {...methods.register("outcome")} className={cn("h-4 w-4 text-primary-600 focus:ring-primary-500")} />
              <span>استفاده از حق (تبدیل به سهم)</span>
            </label>
            <label className="flex items-center gap-x-2 cursor-pointer">
              <input type="radio" value="sell" {...methods.register("outcome")} className={cn("h-4 w-4 text-primary-600 focus:ring-primary-500")} />
              <span>فروش حق تقدم</span>
            </label>
          </div>
        </div>

        {selectedOutcome === "exercise" && (
          <div className="p-4 border border-content-200 rounded-lg bg-content-50 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <TextInput name="quantity" label="تعداد حق استفاده شده" type="number" />
            <TextInput name="price" label="قیمت اسمی (تومان)" type="number" />
            <TextInput name="commission" label="کارمزد" type="number" />
          </div>
        )}

        {selectedOutcome === "sell" && (
          <div className="p-4 border border-content-200 rounded-lg bg-content-50">
            <TextInput name="amount" label="مبلغ کل فروش حق (تومان)" type="number" />
          </div>
        )}

        <div className="flex justify-end pt-3">
          <Button type="submit" variant="primary" disabled={isLoading || isSubmitting}>
            {isSubmitting || isLoading ? "در حال پردازش..." : (isEditMode ? "ذخیره تغییرات" : "ثبت رویداد")}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}