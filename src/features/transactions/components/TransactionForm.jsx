import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { transactionSchema } from "../utils/transactionSchemas";

import DateInput from "../../../shared/components/ui/forms/DateInput";
import TextInput from "../../../shared/components/ui/forms/TextInput";
import TextareaInput from "../../../shared/components/ui/forms/TextareaInput";
import SelectInput from "../../../shared/components/ui/forms/SelectInput";
import Button from "../../../shared/components/ui/Button";

import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export default function TransactionForm({
  onSubmitSuccess,
  initialData,
  isEditMode = false,
}) {
  const methods = useForm({
    resolver: yupResolver(transactionSchema),
    defaultValues: initialData || {
      date: new DateObject({ calendar: persian, locale: persian_fa }),
      broker: "",
      amount: "",
      type: "deposit",
      description: "",
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
        broker: "",
        amount: "",
        type: "deposit",
        description: "",
      });
    }
  }, [initialData, isEditMode, reset]);

  const handleFormSubmit = async (formData) => {
    const processedData = {
      ...formData,
      amount: parseFloat(formData.amount),
      date:
        formData.date instanceof DateObject
          ? formData.date.format("YYYY/MM/DD")
          : formData.date,
    };

    if (onSubmitSuccess) {
      onSubmitSuccess(processedData, isEditMode);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
          <DateInput name="date" label="تاریخ تراکنش" />
          <SelectInput
            name="type"
            label="نوع تراکنش"
            options={[
              { value: "deposit", label: "واریز" },
              { value: "withdraw", label: "برداشت" },
            ]}
          />
          <TextInput
            name="broker"
            label="نام کارگزاری"
            placeholder="مثلاً مفید"
          />
          <TextInput
            name="amount"
            label="مبلغ (تومان)"
            type="number"
            inputMode="decimal"
          />
        </div>
        <div className="sm:col-span-2">
          <TextareaInput
            name="description"
            label="توضیحات (اختیاری)"
            rows={3}
            placeholder="شرح تراکنش..."
          />
        </div>
        <div className="flex justify-end pt-3">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isEditMode ? "ذخیره تغییرات" : "ثبت تراکنش"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
