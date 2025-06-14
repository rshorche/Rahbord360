import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { bonusSchema } from "../../utils/schemas";
import useStockTradesStore from "../../store/useStockTradesStore";
import DateInput from "../../../../shared/components/ui/forms/DateInput";
import TextInput from "../../../../shared/components/ui/forms/TextInput";
import Button from "../../../../shared/components/ui/Button";
import SelectInput from "../../../../shared/components/ui/forms/SelectInput";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default function AddBonusForm({
  onSubmitSuccess,
  portfolioSymbols = [],
  initialData,
  isEditMode = false,
}) {
  const { addAction, updateAction } = useStockTradesStore();
  const methods = useForm({
    resolver: yupResolver(bonusSchema),
    defaultValues: initialData || {
      date: new DateObject({ calendar: persian, locale: persian_fa }),
      symbol: "",
      quantity: "",
      type: "bonus",
    },
  });

  const {
    handleSubmit,
    reset, // <-- reset is destructured here
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
        quantity: "",
        type: "bonus",
      });
    }
  }, [initialData, isEditMode, reset]); // 'reset' is already included.

  const handleFormSubmit = async (formData) => {
    const bonusAction = {
      ...formData,
      quantity: parseFloat(formData.quantity),
      date:
        formData.date instanceof DateObject
          ? formData.date.format("YYYY/MM/DD")
          : formData.date,
      price: 0,
      commission: 0,
      amount: 0,
      notes: "سهام جایزه",
    };
    let success = false;
    if (isEditMode) {
      success = await updateAction(initialData.id, bonusAction);
    } else {
      success = await addAction(bonusAction);
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
          تعداد سهام جایزه اضافه شده به یک نماد را ثبت کنید.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DateInput name="date" label="تاریخ تعلق گرفتن" />
          <SelectInput
            name="symbol"
            label="انتخاب نماد"
            options={symbolOptions}
            placeholder="یک نماد انتخاب کنید"
          />
        </div>
        <TextInput
          name="quantity"
          label="تعداد سهام جایزه"
          type="number"
          inputMode="numeric"
        />
        <div className="flex justify-end pt-3">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isEditMode ? "ذخیره تغییرات" : "ثبت سهام جایزه"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
