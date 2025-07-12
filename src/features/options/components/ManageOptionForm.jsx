import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { manageOptionSchema } from "../utils/schemas";
import DateInput from "../../../shared/components/ui/forms/DateInput";
import TextInput from "../../../shared/components/ui/forms/TextInput";
import Button from "../../../shared/components/ui/Button";
import SelectInput from "../../../shared/components/ui/forms/SelectInput";

const STATUS_OPTIONS = [
  { value: "EXERCISED", label: "اعمال شدن" },
  { value: "EXPIRED", label: "منقضی شدن" },
];

export default function ManageOptionForm({ position, onSubmit, isLoading }) {
  const methods = useForm({
    resolver: yupResolver(manageOptionSchema),
    defaultValues: {
      status: "EXERCISED",
      closing_date: new Date(position.expiration_date),
      contracts_count: position.contracts_count,
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <p className="mb-2 text-sm text-content-600">
            وضعیت نهایی پوزیشن را برای{" "}
            <strong>{position.option_symbol}</strong> مشخص کنید.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectInput name="status" label="وضعیت نهایی" options={STATUS_OPTIONS} />
            <DateInput name="closing_date" label="تاریخ اعمال / انقضا" />
        </div>
        <TextInput
            name="contracts_count"
            label="تعداد قرارداد برای اعمال/بستن"
            type="number"
        />
        <div className="flex justify-end pt-3">
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting ? "در حال پردازش..." : "ثبت وضعیت نهایی"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}