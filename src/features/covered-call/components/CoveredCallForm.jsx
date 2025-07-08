import { useEffect, useMemo } from "react"; // 1. useMemo ایمپورت شد
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { coveredCallSchema } from "../utils/schemas";
import DateInput from "../../../shared/components/ui/forms/DateInput";
import TextInput from "../../../shared/components/ui/forms/TextInput";
import Button from "../../../shared/components/ui/Button";
import SelectInput from "../../../shared/components/ui/forms/SelectInput";
import TextareaInput from "../../../shared/components/ui/forms/TextareaInput";

const DEFAULT_FORM_VALUES = {
  trade_date: new Date(),
  expiration_date: new Date(),
  underlying_symbol: "",
  option_symbol: "",
  strike_price: "",
  contracts_count: "",
  shares_per_contract: 1000,
  premium_per_share: "",
  commission: 0,
  underlying_cost_basis: "",
  notes: "",
};

export default function CoveredCallForm({
  onSubmit,
  isLoading,
  initialData = null,
  isEditMode = false,
  openPositions = [],
}) {
  const methods = useForm({
    resolver: yupResolver(coveredCallSchema),
    defaultValues: initialData || DEFAULT_FORM_VALUES,
  });

  const {
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { isSubmitting },
  } = methods;

  const selectedUnderlying = watch("underlying_symbol");

  useEffect(() => {
    if (isEditMode && initialData) {
      reset({
        ...initialData,
        trade_date: new Date(initialData.trade_date),
        expiration_date: new Date(initialData.expiration_date),
      });
    } else if (!isEditMode) {
      reset(DEFAULT_FORM_VALUES);
    }
  }, [initialData, isEditMode, reset]);

  useEffect(() => {
    if (selectedUnderlying && !isEditMode && openPositions.length > 0) {
      const position = openPositions.find(p => p.symbol === selectedUnderlying);
      if (position) {
        setValue("underlying_cost_basis", Math.round(position.avgBuyPriceAdjusted));
      }
    }
  }, [selectedUnderlying, openPositions, setValue, isEditMode]);

  const handleFormSubmit = async (formData) => {
    await onSubmit(formData);
  };

  // 2. منطق ساخت گزینه‌ها با useMemo بهبود یافت
  const underlyingSymbolOptions = useMemo(() => {
    const symbols = new Set(openPositions.map(p => p.symbol));

    // در حالت ویرایش، اطمینان حاصل می‌شود که نماد فعلی همیشه در لیست گزینه‌ها وجود دارد
    if (isEditMode && initialData?.underlying_symbol) {
      symbols.add(initialData.underlying_symbol);
    }

    return Array.from(symbols).map(symbol => ({
      value: symbol,
      label: symbol,
    }));
  }, [openPositions, isEditMode, initialData]);

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <SelectInput
            name="underlying_symbol"
            label="نماد پایه"
            options={underlyingSymbolOptions}
            placeholder="انتخاب کنید"
            disabled={isEditMode}
          />
          <TextInput
            name="underlying_cost_basis"
            label="قیمت سر به سر سهم"
            type="number"
          />
          <TextInput name="contracts_count" label="تعداد قرارداد" type="number" />
          <TextInput
            name="shares_per_contract"
            label="اندازه قرارداد"
            type="number"
          />
          <DateInput name="trade_date" label="تاریخ معامله" />
          <DateInput name="expiration_date" label="تاریخ سررسید" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
          <TextInput name="strike_price" label="قیمت اعمال" type="number" />
          <TextInput
            name="option_symbol"
            label="نماد آپشن"
            placeholder="مثلاً: ضستا..."
          />
          <TextInput
            name="premium_per_share"
            label="پرمیوم (هر سهم)"
            type="number"
          />
        </div>

        <TextareaInput name="notes" label="یادداشت / استراتژی" rows={2} />

        <div className="flex justify-end pt-3">
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting
              ? "در حال پردازش..."
              : isEditMode
              ? "ذخیره تغییرات"
              : "ثبت معامله"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}