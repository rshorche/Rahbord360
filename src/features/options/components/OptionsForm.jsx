import { useState, useEffect, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { optionsTradeSchema } from "../utils/schemas";
import useAllSymbolsStore from "../../../shared/store/useAllSymbolsStore";
import DateInput from "../../../shared/components/ui/forms/DateInput";
import TextInput from "../../../shared/components/ui/forms/TextInput";
import Button from "../../../shared/components/ui/Button";
import SelectInput from "../../../shared/components/ui/forms/SelectInput";
import TextareaInput from "../../../shared/components/ui/forms/TextareaInput";
import { cn } from "../../../shared/utils/cn";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";

const normalizePersianString = (str) => {
  if (typeof str !== "string") return "";
  return str.replace(/ی/g, "ي").replace(/ک/g, "ك").trim().toLowerCase();
};

const tradeTypeOptions = [
    { value: 'buy_to_open', label: 'باز کردن پوزیشن خرید (Long)' },
    { value: 'sell_to_open', label: 'باز کردن پوزیشن فروش (Short)' },
    { value: 'sell_to_close', label: 'بستن پوزیشن خرید' },
    { value: 'buy_to_close', label: 'بستن پوزیشن فروش' },
];

const optionTypeOptions = [
    { value: 'call', label: 'اختیار خرید (Call)' },
    { value: 'put', label: 'اختیار فروش (Put)' },
];

export default function OptionsForm({
  onSubmit,
  isLoading,
  initialData = null,
  isEditMode = false,
}) {
  const allSymbols = useAllSymbolsStore((state) => state.symbols);

  const [underlyingQuery, setUnderlyingQuery] = useState("");
  const [underlyingResults, setUnderlyingResults] = useState([]);
  const [isUnderlyingFocused, setIsUnderlyingFocused] = useState(false);

  const methods = useForm({
    resolver: yupResolver(optionsTradeSchema),
    defaultValues: {
      trade_date: new Date(),
      expiration_date: new Date(),
      trade_type: "buy_to_open",
      option_type: "call",
      commission: 0,
      notes: "",
    },
  });

  const {
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = methods;

  const showLoadingOverlay = isLoading || isSubmitting;
  
  useEffect(() => {
    if (initialData) {
      const dataToSet = { ...initialData };
      if (typeof dataToSet.trade_date === 'string') dataToSet.trade_date = new Date(dataToSet.trade_date);
      if (typeof dataToSet.expiration_date === 'string') dataToSet.expiration_date = new Date(dataToSet.expiration_date);
      
      reset(dataToSet);
      setUnderlyingQuery(dataToSet.underlying_symbol || "");
    } else {
        reset({
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
        });
        setUnderlyingQuery("");
    }
  }, [initialData, reset]);

  const filterSymbols = useCallback((query, setResults) => {
    if (query.length > 1) {
      const normalizedQuery = normalizePersianString(query);
      const results = allSymbols.filter((s) => normalizePersianString(s.l18).includes(normalizedQuery) || normalizePersianString(s.l30).includes(normalizedQuery)).slice(0, 10);
      setResults(results);
    } else {
      setResults([]);
    }
  }, [allSymbols]);

  useEffect(() => {
    if (isUnderlyingFocused) {
      filterSymbols(underlyingQuery, setUnderlyingResults);
    } else {
      setUnderlyingResults([]);
    }
  }, [underlyingQuery, isUnderlyingFocused, filterSymbols]);

  const handleSelectUnderlying = (symbol) => {
    setUnderlyingQuery(symbol.l18);
    setValue("underlying_symbol", symbol.l18, { shouldValidate: true });
    setIsUnderlyingFocused(false);
  };
  
  return (
    <FormProvider {...methods}>
      <div className="relative">
        {showLoadingOverlay && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-lg">
            <LoadingSpinner text="در حال پردازش..." />
          </div>
        )}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative sm:col-span-1">
              <label className="block text-sm font-medium text-content-700 mb-1.5 px-1">نماد پایه</label>
              <input type="text" value={underlyingQuery} onChange={(e) => setUnderlyingQuery(e.target.value)} onFocus={() => setIsUnderlyingFocused(true)} onBlur={() => setTimeout(() => setIsUnderlyingFocused(false), 200)} placeholder="جستجوی نماد پایه..." autoComplete="off" className={cn("w-full h-12 px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 transition-all", errors.underlying_symbol ? "border-danger-500 bg-danger-50 focus:ring-danger-500/50" : "border-content-300 bg-white focus:ring-primary-500/50")} />
              {errors.underlying_symbol && <p className="text-xs text-danger-700 mt-1.5 px-1">{errors.underlying_symbol.message}</p>}
              {underlyingResults.length > 0 && isUnderlyingFocused && (
                <ul className="absolute z-20 w-full mt-1 bg-white border border-content-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {underlyingResults.map((s) => (<li key={s.l18} className="px-4 py-2 text-sm hover:bg-content-100 cursor-pointer" onMouseDown={() => handleSelectUnderlying(s)}><span className="font-semibold">{s.l18}</span></li>))}
                </ul>
              )}
            </div>
            
            <TextInput name="option_symbol" label="نماد آپشن" placeholder="مثلاً: ضفلا۷۰۱۱" />

            <SelectInput name="trade_type" label="نوع معامله" options={tradeTypeOptions} disabled={isEditMode} />
            <SelectInput name="option_type" label="نوع آپشن" options={optionTypeOptions} disabled={isEditMode} />

            <DateInput name="trade_date" label="تاریخ معامله" />
            <DateInput name="expiration_date" label="تاریخ سررسید" />
            <TextInput name="strike_price" label="قیمت اعمال" type="number" />
            <TextInput name="contracts_count" label="تعداد قرارداد" type="number" />
            <TextInput name="premium" label="پرمیوم معامله (تومان)" type="number" />
            <TextInput name="commission" label="کارمزد (تومان)" type="number" />
          </div>
          <div className="sm:col-span-2">
            <TextareaInput name="notes" label="یادداشت" rows={2} />
          </div>
          <div className="flex justify-end pt-3">
            <Button type="submit" variant="primary" disabled={showLoadingOverlay}>
              {showLoadingOverlay ? "در حال پردازش..." : (isEditMode ? "ذخیره تغییرات" : "ثبت معامله")}
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}