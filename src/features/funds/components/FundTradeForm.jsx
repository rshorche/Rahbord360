import { useState, useEffect, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { fundTradeSchema } from "../utils/schemas";
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

export default function FundTradeForm({
  onSubmit,
  isLoading,
  initialData = null,
  isEditMode = false,
}) {
  const allSymbols = useAllSymbolsStore((state) => state.symbols);

  const [symbolQuery, setSymbolQuery] = useState("");
  const [symbolResults, setSymbolResults] = useState([]);
  const [isSymbolFocused, setIsSymbolFocused] = useState(false);

  const methods = useForm({
    resolver: yupResolver(fundTradeSchema),
    defaultValues: initialData || {
      date: new Date(),
      symbol: "",
      fund_type: "EQUITY",
      trade_type: "buy",
      quantity: "",
      price_per_unit: "",
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
      if (typeof dataToSet.date === 'string') {
        dataToSet.date = new Date(dataToSet.date);
      }
      reset(dataToSet);
      setSymbolQuery(dataToSet.symbol || "");
    }
  }, [initialData, isEditMode, reset]);

  const filterSymbols = useCallback((query) => {
    if (query.length > 1) {
      const normalizedQuery = normalizePersianString(query);
      const results = allSymbols
        .filter(
          (s) =>
            normalizePersianString(s.l18).includes(normalizedQuery) ||
            normalizePersianString(s.l30).includes(normalizedQuery)
        )
        .slice(0, 10);
      setSymbolResults(results);
    } else {
      setSymbolResults([]);
    }
  }, [allSymbols]);

  useEffect(() => {
    if (isSymbolFocused) {
      filterSymbols(symbolQuery);
    } else {
      setSymbolResults([]);
    }
  }, [symbolQuery, isSymbolFocused, filterSymbols]);

  const handleSelectSymbol = (symbol) => {
    setSymbolQuery(symbol.l18);
    setValue("symbol", symbol.l18, { shouldValidate: true });
    setIsSymbolFocused(false);
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <label className="block text-sm font-medium text-content-700 mb-1.5 px-1">نماد صندوق</label>
              <input
                type="text"
                value={symbolQuery}
                onChange={(e) => setSymbolQuery(e.target.value)}
                onFocus={() => setIsSymbolFocused(true)}
                onBlur={() => setTimeout(() => setIsSymbolFocused(false), 200)}
                placeholder="جستجوی نماد..."
                autoComplete="off"
                className={cn("w-full h-12 px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 transition-all", errors.symbol ? "border-danger-500 bg-danger-50 focus:ring-danger-500/50" : "border-content-300 bg-white focus:ring-primary-500/50")}
              />
              {errors.symbol && <p className="text-xs text-danger-700 mt-1.5 px-1">{errors.symbol.message}</p>}
              {symbolResults.length > 0 && isSymbolFocused && (
                <ul className="absolute z-20 w-full mt-1 bg-white border border-content-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  {symbolResults.map((s) => (
                    <li key={s.l18} className="px-4 py-2 text-sm hover:bg-content-100 cursor-pointer" onMouseDown={() => handleSelectSymbol(s)}>
                      <span className="font-semibold">{s.l18}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            
            <SelectInput name="fund_type" label="نوع صندوق" options={[
                { value: 'EQUITY', label: 'سهامی' },
                { value: 'FIXED_INCOME', label: 'درآمد ثابت' },
                { value: 'GOLD', label: 'طلا' },
                { value: 'OTHER', label: 'سایر' },
            ]}/>

            <SelectInput name="trade_type" label="نوع معامله" options={[
                { value: 'buy', label: 'خرید' },
                { value: 'sell', label: 'فروش' },
            ]}/>

            <DateInput name="date" label="تاریخ معامله" />
            <TextInput name="quantity" label="تعداد واحد" type="number" />
            <TextInput name="price_per_unit" label="قیمت هر واحد" type="number" />
            <TextInput name="commission" label="کارمزد" type="number" />
          </div>
          <TextareaInput name="notes" label="یادداشت" rows={2} />
          <div className="flex justify-end pt-3">
            <Button
              type="submit"
              variant="primary"
              disabled={showLoadingOverlay}
            >
              {showLoadingOverlay ? "در حال پردازش..." : (isEditMode ? "ذخیره تغییرات" : "ثبت معامله")}
            </Button>
          </div>
        </form>
      </div>
    </FormProvider>
  );
}