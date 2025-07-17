import { useState, useEffect } from "react";
import { useForm, FormProvider, useWatch } from "react-hook-form";
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

const customTradeTypeOptions = [
    { value: 'buy_call', label: 'خرید اختیار خرید (ض)' },
    { value: 'sell_call', label: 'فروش اختیار خرید (ض)' },
    { value: 'buy_put', label: 'خرید اختیار فروش (ط)' },
    { value: 'sell_put', label: 'فروش اختیار فروش (ط)' },
    { value: 'close_long', label: 'بستن پوزیشن خرید' },
    { value: 'close_short', label: 'بستن پوزیشن فروش' },
];

export default function OptionsForm({
  onSubmit,
  isLoading,
  initialData = null,
  isEditMode = false,
}) {
  const allSymbols = useAllSymbolsStore((state) => state.symbols);

  const [underlyingQuery, setUnderlyingQuery] = useState("");
  const [optionQuery, setOptionQuery] = useState("");
  const [underlyingResults, setUnderlyingResults] = useState([]);
  const [optionResults, setOptionResults] = useState([]);
  const [isUnderlyingFocused, setIsUnderlyingFocused] = useState(false);
  const [isOptionFocused, setIsOptionFocused] = useState(false);

  const methods = useForm({
    resolver: yupResolver(optionsTradeSchema),
    defaultValues: {
      trade_date: new Date(),
      expiration_date: new Date(),
      custom_trade_type: "buy_call",
    },
  });

  const {
    handleSubmit,
    setValue,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = methods;

  const showLoadingOverlay = isLoading || isSubmitting;
  const customTradeType = useWatch({ control, name: "custom_trade_type", defaultValue: "buy_call" });

  useEffect(() => {
    let tradeType, optionType;
    switch (customTradeType) {
      case 'buy_call':
        tradeType = 'buy_to_open'; optionType = 'call'; break;
      case 'sell_call':
        tradeType = 'sell_to_open'; optionType = 'call'; break;
      case 'buy_put':
        tradeType = 'buy_to_open'; optionType = 'put'; break;
      case 'sell_put':
        tradeType = 'sell_to_open'; optionType = 'put'; break;
      case 'close_long':
        tradeType = 'sell_to_close'; optionType = initialData?.option_type || 'call'; break;
      case 'close_short':
        tradeType = 'buy_to_close'; optionType = initialData?.option_type || 'call'; break;
      default:
        tradeType = 'buy_to_open'; optionType = 'call';
    }
    setValue('trade_type', tradeType);
    setValue('option_type', optionType);
  }, [customTradeType, setValue, initialData]);

  useEffect(() => {
    if (initialData) {
      const dataToSet = { ...initialData };
      if (typeof dataToSet.trade_date === 'string') dataToSet.trade_date = new Date(dataToSet.trade_date);
      if (typeof dataToSet.expiration_date === 'string') dataToSet.expiration_date = new Date(dataToSet.expiration_date);
      
      reset(dataToSet);
      setUnderlyingQuery(dataToSet.underlying_symbol || "");
      setOptionQuery(dataToSet.option_symbol || "");
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
            custom_trade_type: "buy_call",
        });
        setUnderlyingQuery("");
        setOptionQuery("");
    }
  }, [initialData, reset]);

  const filterSymbols = (query, setResults) => {
    if (query.length > 1) {
      const normalizedQuery = normalizePersianString(query);
      const results = allSymbols.filter((s) => normalizePersianString(s.l18).includes(normalizedQuery) || normalizePersianString(s.l30).includes(normalizedQuery)).slice(0, 10);
      setResults(results);
    } else {
      setResults([]);
    }
  };

  useEffect(() => {
    if (isUnderlyingFocused) {
      filterSymbols(underlyingQuery, setUnderlyingResults);
    } else {
      setUnderlyingResults([]);
    }
  }, [underlyingQuery, isUnderlyingFocused, allSymbols]);

  useEffect(() => {
    if (isOptionFocused) {
      filterSymbols(optionQuery, setOptionResults);
    } else {
      setOptionResults([]);
    }
  }, [optionQuery, isOptionFocused, allSymbols]);

  const handleSelectSymbol = (symbol, fieldName, setQuery, setFocus) => {
    setQuery(symbol.l18);
    setValue(fieldName, symbol.l18, { shouldValidate: true });
    setFocus(false);
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
                  {underlyingResults.map((s) => (<li key={s.l18} className="px-4 py-2 text-sm hover:bg-content-100 cursor-pointer" onMouseDown={() => handleSelectSymbol(s, "underlying_symbol", setUnderlyingQuery, setIsUnderlyingFocused)}><span className="font-semibold">{s.l18}</span></li>))}
                </ul>
              )}
            </div>
            <div className="relative sm:col-span-1">
              <label className="block text-sm font-medium text-content-700 mb-1.5 px-1">نماد آپشن</label>
              <input type="text" value={optionQuery} onChange={(e) => setOptionQuery(e.target.value)} onFocus={() => setIsOptionFocused(true)} onBlur={() => setTimeout(() => setIsOptionFocused(false), 200)} placeholder="جستجوی نماد آپشن..." autoComplete="off" className={cn("w-full h-12 px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 transition-all", errors.option_symbol ? "border-danger-500 bg-danger-50 focus:ring-danger-500/50" : "border-content-300 bg-white focus:ring-primary-500/50")} />
              {errors.option_symbol && <p className="text-xs text-danger-700 mt-1.5 px-1">{errors.option_symbol.message}</p>}
              {optionResults.length > 0 && isOptionFocused && (
                <ul className="absolute z-20 w-full mt-1 bg-white border border-content-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {optionResults.map((s) => (<li key={s.l18} className="px-4 py-2 text-sm hover:bg-content-100 cursor-pointer" onMouseDown={() => handleSelectSymbol(s, "option_symbol", setOptionQuery, setIsOptionFocused)}><span className="font-semibold">{s.l18}</span></li>))}
                </ul>
              )}
            </div>

            <div className="sm:col-span-2">
              <SelectInput name="custom_trade_type" label="نوع معامله" options={customTradeTypeOptions.filter(o => isEditMode ? o.value !== initialData.trade_type : !o.value.includes('close'))} />
            </div>

            <DateInput name="trade_date" label="تاریخ معامله" />
            <DateInput name="expiration_date" label="تاریخ سررسید" />
            <TextInput name="strike_price" label="قیمت اعمال" type="number" />
            <TextInput name="contracts_count" label="تعداد قرارداد" type="number" />
            <TextInput name="premium" label="پرمیوم" type="number" />
            <TextInput name="commission" label="کارمزد" type="number" />
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