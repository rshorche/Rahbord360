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
  onSubmit,
  initialData,
}) {
  const isEditMode = !!initialData;
  
  const methods = useForm({
    resolver: yupResolver(transactionSchema),
    defaultValues: initialData
      ? { ...initialData, date: new Date(initialData.date) }
      : {
          date: new Date(),
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
    if (initialData) {
      reset({ ...initialData, date: new Date(initialData.date) });
    } else {
      reset({ date: new Date(), type: 'deposit', broker: '', amount: '', description: '' });
    }
  }, [initialData, reset]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
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
          />
        </div>
        <div className="sm:col-span-2">
          <TextareaInput
            name="description"
            label="توضیحات (اختیاری)"
            rows={3}
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