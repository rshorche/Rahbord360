import { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { premiumSchema } from "../../utils/schemas"; //
import useStockTradesStore from "../../store/useStockTradesStore"; //
import DateInput from "../../../../shared/components/ui/forms/DateInput"; //
import TextInput from "../../../../shared/components/ui/forms/TextInput"; //
import Button from "../../../../shared/components/ui/Button"; //
import SelectInput from "../../../../shared/components/ui/forms/SelectInput"; //
import { DateObject } from "react-multi-date-picker"; //
import persian from "react-date-object/calendars/persian"; //
import persian_fa from "react-date-object/locales/persian_fa"; //
import { cn } from "../../../../shared/utils/cn"; //

export default function AddPremiumForm({
  onSubmitSuccess,
  portfolioSymbols = [],
  initialData,
  isEditMode = false,
}) {
  const { addAction, updateAction } = useStockTradesStore(); //
  const methods = useForm({
    resolver: yupResolver(premiumSchema), //
    defaultValues: initialData || {
      //
      date: new DateObject({ calendar: persian, locale: persian_fa }), //
      symbol: "", //
      premium_type: "bonus_shares", //
      quantity: "", //
      amount: "", //
      type: "premium", //
    },
  });

  const {
    handleSubmit, //
    watch, //
    reset, //
    formState: { isSubmitting }, //
  } = methods;
  const selectedPremiumType = watch("premium_type"); //

  useEffect(() => {
    if (isEditMode && initialData) {
      //
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
      // Ensure numeric fields are correctly set, default to empty string if null/undefined for TextInputs
      dataWithDateObject.quantity = initialData.quantity ?? "";
      dataWithDateObject.amount = initialData.amount ?? "";
      reset(dataWithDateObject); //
    } else if (!isEditMode) {
      //
      reset({
        //
        date: new DateObject({ calendar: persian, locale: persian_fa }), //
        symbol: "", //
        premium_type: "bonus_shares", //
        quantity: "", //
        amount: "", //
        type: "premium", //
      });
    }
  }, [initialData, isEditMode, reset]); // 'reset' is correctly in dependency array

  const handleFormSubmit = async (formData) => {
    //
    let premiumAction = {
      ...formData,
      date:
        formData.date instanceof DateObject //
          ? formData.date.format("YYYY/MM/DD") //
          : formData.date, //
      price: 0, //  // Premium doesn't directly involve price/commission in this context
      commission: 0, //
      notes: `افزایش سرمایه از محل صرف سهام: ${
        // [cite: 424]
        formData.premium_type === "cash_payment" ? "پرداخت نقدی" : "سهام جایزه" // [cite: 425]
      }`,
    };
    if (formData.premium_type === "cash_payment") {
      //
      premiumAction.amount = parseFloat(formData.amount); //
      premiumAction.quantity = 0; //
    } else if (formData.premium_type === "bonus_shares") {
      //
      premiumAction.quantity = parseFloat(formData.quantity); //
      premiumAction.amount = 0; //
    }
    let success = false; //
    if (isEditMode) {
      //
      success = await updateAction(initialData.id, premiumAction); //
    } else {
      success = await addAction(premiumAction); //
    }
    if (success && onSubmitSuccess) onSubmitSuccess(); //
  };

  const symbolOptions = portfolioSymbols.map((symbol) => ({
    //
    value: symbol, //
    label: symbol, //
  }));

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        <p className="text-sm text-content-600">
          افزایش سرمایه از محل صرف سهام را ثبت کنید (پرداخت نقدی یا سهام جایزه).
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DateInput name="date" label="تاریخ رویداد" />
          <SelectInput
            name="symbol"
            label="انتخاب نماد"
            options={symbolOptions}
            placeholder="یک نماد انتخاب کنید"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-content-700 mb-2">
            نوع صرف سهام
          </label>
          <div className="flex gap-4">
            <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
              <input
                type="radio"
                value="bonus_shares"
                {...methods.register("premium_type")}
                className={cn(
                  "h-4 w-4 text-primary-600 border-content-300 focus:ring-primary-500" 
                )}
              />
              <span className="text-sm">سهام جایزه</span> {/*  */}
            </label>
            <label className="flex items-center space-x-2 rtl:space-x-reverse cursor-pointer">
              <input
                type="radio"
                value="cash_payment"
                {...methods.register("premium_type")}
                className={cn(
                  "h-4 w-4 text-primary-600 border-content-300 focus:ring-primary-500" 
                )}
              />
              <span className="text-sm">پرداخت نقدی</span> 
            </label>
          </div>
        </div>
        {/* فیلدهای شرطی */}
        {selectedPremiumType === "bonus_shares" && ( //
          <div
            className={cn(
              "p-4 border border-content-200 rounded-lg bg-content-50" 
            )}>
            <TextInput
              name="quantity"
              label="تعداد سهام جایزه"
              type="number"
              inputMode="numeric"
            />
          </div>
        )}
        {selectedPremiumType === "cash_payment" && ( //
          <div
            className={cn(
              "p-4 border border-content-200 rounded-lg bg-content-50" 
            )}>
            <TextInput
              name="amount"
              label="مبلغ دریافتی (تومان)"
              type="number"
              inputMode="decimal"
            />
          </div>
        )}
        <div className="flex justify-end pt-3">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isEditMode ? "ذخیره تغییرات" : "ثبت صرف سهام"} {/*  */}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
