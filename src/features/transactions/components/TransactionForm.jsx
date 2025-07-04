import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { transactionSchema } from "../utils/transactionSchemas";
import DateInput from "../../../shared/components/ui/forms/DateInput";
import TextInput from "../../../shared/components/ui/forms/TextInput";
import TextareaInput from "../../../shared/components/ui/forms/TextareaInput";
import SelectInput from "../../../shared/components/ui/forms/SelectInput";
import Button from "../../../shared/components/ui/Button";

export default function TransactionForm({
  onSubmitSuccess,
  initialData,
  isEditMode = false,
}) {
  const methods = useForm({
    resolver: yupResolver(transactionSchema),
    // **تغییر اصلی اینجاست**
    defaultValues: initialData
      ? { ...initialData } // در حالت ویرایش، داده‌های اولیه خودش تاریخ استاندارد دارد
      : {
          date: new Date(), // در حالت افزودن، از شیء استاندارد Date استفاده می‌کنیم
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
      reset(initialData);
    } else if (!isEditMode) {
      // **و تغییر اصلی اینجاست**
      reset({
        date: new Date(), // ریست کردن فرم هم با شیء استاندارد Date انجام می‌شود
        broker: "",
        amount: "",
        type: "deposit",
        description: "",
      });
    }
  }, [initialData, isEditMode, reset]);

  const handleFormSubmit = (formData) => {
    if (onSubmitSuccess) {
      const dataToSend = isEditMode
        ? { ...formData, id: initialData.id }
        : formData;
      onSubmitSuccess(dataToSend);
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
            {isSubmitting
              ? "در حال پردازش..."
              : isEditMode
              ? "ذخیره تغییرات"
              : "ثبت تراکنش"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}