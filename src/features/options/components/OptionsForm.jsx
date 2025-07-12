import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { optionsTradeSchema } from "../utils/schemas";
import DateInput from "../../../shared/components/ui/forms/DateInput";
import TextInput from "../../../shared/components/ui/forms/TextInput";
import Button from "../../../shared/components/ui/Button";
import SelectInput from "../../../shared/components/ui/forms/SelectInput";
import TextareaInput from "../../../shared/components/ui/forms/TextareaInput";

export default function OptionsForm({
  onSubmit,
  isLoading,
  initialData = null,
  isEditMode = false,
}) {
  const methods = useForm({
    resolver: yupResolver(optionsTradeSchema),
    defaultValues: initialData || {
      trade_date: new Date(),
      expiration_date: new Date(),
      underlying_symbol: "",
      option_symbol: "",
      option_type: "call",
      trade_type: "buy_to_open",
      strike_price: "",
      contracts_count: "",
      premium: "",
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
          <TextInput name="underlying_symbol" label="نماد پایه" />
          <TextInput name="option_symbol" label="نماد آپشن" />
          <SelectInput
            name="option_type"
            label="نوع اختیار"
            options={[{value: 'call', label: 'خرید (Call)'}, {value: 'put', label: 'فروش (Put)'}]}
          />
           <SelectInput
            name="trade_type"
            label="نوع معامله"
            options={[
                {value: 'buy_to_open', label: 'خرید برای باز کردن'},
                {value: 'sell_to_open', label: 'فروش برای باز کردن'},
                {value: 'buy_to_close', label: 'خرید برای بستن'},
                {value: 'sell_to_close', label: 'فروش برای بستن'},
            ]}
          />
          <DateInput name="trade_date" label="تاریخ معامله" />
          <DateInput name="expiration_date" label="تاریخ سررسید" />
          <TextInput name="strike_price" label="قیمت اعمال" type="number" />
          <TextInput name="contracts_count" label="تعداد قرارداد" type="number" />
          <TextInput name="premium" label="پرمیوم" type="number" />
          <TextInput name="commission" label="کارمزد" type="number" />
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