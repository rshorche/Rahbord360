import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { fundTradeSchema } from "../utils/schemas";
import DateInput from "../../../shared/components/ui/forms/DateInput";
import TextInput from "../../../shared/components/ui/forms/TextInput";
import Button from "../../../shared/components/ui/Button";
import SelectInput from "../../../shared/components/ui/forms/SelectInput";
import TextareaInput from "../../../shared/components/ui/forms/TextareaInput";

export default function FundTradeForm({
  onSubmit,
  isLoading,
  initialData = null,
  isEditMode = false,
}) {
  const methods = useForm({
    resolver: yupResolver(fundTradeSchema),
    defaultValues: initialData || {
      date: new Date(),
      symbol: "",
      fund_type: "GOLD",
      trade_type: "buy",
      quantity: "",
      price_per_unit: "",
      commission: 0,
      notes: "",
    },
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DateInput name="date" label="تاریخ معامله" />
          <TextInput name="symbol" label="نماد صندوق" placeholder="مثلا: عیار" />
          <SelectInput
            name="fund_type"
            label="نوع صندوق"
            options={[
              { value: 'GOLD', label: 'طلا' },
              { value: 'EQUITY', label: 'سهامی' },
              { value: 'FIXED_INCOME', label: 'درآمد ثابت' }
            ]}
          />
          <SelectInput
            name="trade_type"
            label="نوع معامله"
            options={[{ value: 'buy', label: 'خرید' }, { value: 'sell', label: 'فروش' }]}
          />
          <TextInput name="quantity" label="تعداد واحد" type="number" />
          <TextInput name="price_per_unit" label="قیمت هر واحد (تومان)" type="number" />
          <TextInput name="commission" label="کارمزد (تومان)" type="number" />
        </div>
        <TextareaInput name="notes" label="یادداشت" rows={2} />
        <div className="flex justify-end pt-3">
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting ? "در حال پردازش..." : (isEditMode ? "ذخیره تغییرات" : "ثبت معامله")}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}