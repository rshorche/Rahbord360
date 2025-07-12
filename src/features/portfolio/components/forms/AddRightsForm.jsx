import { useEffect } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { rightsIssueSchema } from "../../utils/schemas";
import useStockTradesStore from "../../store/useStockTradesStore";
import DateInput from "../../../../shared/components/ui/forms/DateInput";
import TextInput from "../../../../shared/components/ui/forms/TextInput";
import Button from "../../../../shared/components/ui/Button";
import SelectInput from "../../../../shared/components/ui/forms/SelectInput";
import TextareaInput from "../../../../shared/components/ui/forms/TextareaInput";

const OutcomeWatcher = ({ control }) => {
  const outcome = useWatch({ control, name: "outcome" });

  return (
    <>
      {outcome === "exercise" && (
        <>
          <TextInput name="quantity" label="تعداد حق تقدم استفاده شده" type="number" />
          <TextInput name="price" label="قیمت اسمی هر سهم (تومان)" type="number" />
          <TextInput name="commission" label="کارمزد (اختیاری)" type="number" />
        </>
      )}
      {outcome === "sell" && (
        <TextInput name="amount" label="مبلغ کل فروش حق تقدم (تومان)" type="number" />
      )}
    </>
  );
};

export default function AddRightsForm({
  onSubmitSuccess,
  portfolioSymbols = [],
  initialData,
  isEditMode = false,
}) {
  const { addAction, updateAction } = useStockTradesStore();

  const methods = useForm({
    resolver: yupResolver(rightsIssueSchema),
    defaultValues: {
      date: new Date(),
      symbol: "",
      outcome: "exercise",
      quantity: "",
      price: "",
      commission: 0,
      amount: "",
      notes: "",
    },
  });

  const {
    handleSubmit,
    reset,
    control,
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (isEditMode && initialData) {
      const outcome = initialData.type === "rights_exercise" ? "exercise" : "sell";
      reset({ ...initialData, date: new Date(initialData.date), outcome });
    }
  }, [initialData, isEditMode, reset]);

  const handleFormSubmit = async (formData) => {
    const { outcome, ...rest } = formData;

    const payload = {
      ...rest,
      type: outcome === "exercise" ? "rights_exercise" : "rights_sell",
    };

    if (payload.type === "rights_exercise") {
      delete payload.amount;
    } else {
      delete payload.quantity;
      delete payload.price;
      delete payload.commission;
    }

    const success = isEditMode
      ? await updateAction(initialData.id, payload)
      : await addAction(payload);

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
          نتیجه حق تقدم‌های خود را ثبت کنید.
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
          <div className="sm:col-span-2">
            <SelectInput
              name="outcome"
              label="نتیجه حق تقدم"
              options={[
                { value: "exercise", label: "استفاده از حق تقدم (تبدیل به سهم)" },
                { value: "sell", label: "فروش حق تقدم" },
              ]}
              disabled={isEditMode}
            />
          </div>
          <OutcomeWatcher control={control} />
        </div>
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