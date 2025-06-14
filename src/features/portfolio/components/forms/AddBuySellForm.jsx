import { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { buySellSchema } from "../../utils/schemas";
import useAllSymbolsStore from "../../../../shared/store/useAllSymbolsStore";
import useStockTradesStore from "../../store/useStockTradesStore";
import DateInput from "../../../../shared/components/ui/forms/DateInput";
import TextInput from "../../../../shared/components/ui/forms/TextInput";
import TextareaInput from "../../../../shared/components/ui/forms/TextareaInput";
import Button from "../../../../shared/components/ui/Button";
import SelectInput from "../../../../shared/components/ui/forms/SelectInput";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { cn } from "../../../../shared/utils/cn";

const normalizePersianString = (str) => {
  if (typeof str !== "string" || str === null || str === undefined) return "";
  return str
    .replace(/ی/g, "ي")
    .replace(/ك/g, "ک")
    .replace(/هٔ/g, "ه")
    .replace(/ء/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
};

export default function AddBuySellForm({
  onSubmitSuccess,
  initialData,
  isEditMode = false,
}) {
  const { addAction, updateAction } = useStockTradesStore();
  const allSymbols = useAllSymbolsStore((state) => state.symbols);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const methods = useForm({
    resolver: yupResolver(buySellSchema),
    defaultValues: initialData || {
      date: new DateObject({ calendar: persian, locale: persian_fa }),
      symbol: "",
      type: "buy",
      quantity: "",
      price: "",
      commission: 0,
      notes: "",
    },
  });

  const {
    handleSubmit,
    setValue,
    reset, // <-- Destructure reset from methods
    formState: { isSubmitting },
  } = methods;

  useEffect(() => {
    if (isEditMode && initialData) {
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
      // For buy/sell, ensure commission is a number, default to 0 if null/undefined
      dataWithDateObject.commission = initialData.commission ?? 0;
      reset(dataWithDateObject); // Use the destructured reset
      setSearchQuery(initialData.symbol || "");
    } else if (!isEditMode) {
      reset({
        // Use the destructured reset
        date: new DateObject({ calendar: persian, locale: persian_fa }),
        symbol: "",
        type: "buy",
        quantity: "",
        price: "",
        commission: 0,
        notes: "",
      });
      setSearchQuery("");
    }
  }, [initialData, isEditMode, reset]); // Removed 'methods', added 'reset' instead to dependency array as it's the direct dependency

  useEffect(() => {
    if (searchQuery.length > 0 && isSearchFocused) {
      const normalizedQuery = normalizePersianString(searchQuery);
      const scoredResults = allSymbols
        .map((s) => {
          const l18Normalized = normalizePersianString(s.l18);
          const l30Normalized = normalizePersianString(s.l30);
          const isinNormalized = normalizePersianString(s.isin);
          let score = 0;

          if (l18Normalized === normalizedQuery) score += 1000;
          else if (l30Normalized === normalizedQuery) score += 900;

          if (l18Normalized.startsWith(normalizedQuery)) score += 500;
          else if (l30Normalized.startsWith(normalizedQuery)) score += 400;

          if (l18Normalized.includes(normalizedQuery)) score += 200;
          else if (l30Normalized.includes(normalizedQuery)) score += 100;

          if (isinNormalized === normalizedQuery) score += 80;
          else if (isinNormalized.startsWith(normalizedQuery)) score += 40;
          else if (isinNormalized.includes(normalizedQuery)) score += 20;

          if (score > 0) {
            return { symbol: s, score: score };
          }
          return null;
        })
        .filter((item) => item !== null)
        .sort((a, b) => b.score - a.score)
        .map((item) => item.symbol)
        .slice(0, 20);

      setSearchResults(scoredResults);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, allSymbols, isSearchFocused]);

  const handleSelectSymbol = (symbol) => {
    setSearchQuery(symbol.l18);
    setValue("symbol", symbol.l18, { shouldValidate: true });
    setValue("price", symbol.pl / 10, { shouldValidate: true });
    setSearchResults([]);
    setIsSearchFocused(false);
  };

  const handleFormSubmit = async (formData) => {
    const processedData = {
      ...formData,
      quantity: parseFloat(formData.quantity),
      price: parseFloat(formData.price),
      commission: parseFloat(formData.commission) || 0,
      date:
        formData.date instanceof DateObject
          ? formData.date.format("YYYY/MM/DD")
          : formData.date,
    };
    let success = false;
    if (isEditMode) {
      success = await updateAction(initialData.id, processedData);
    } else {
      success = await addAction(processedData);
    }
    if (success && onSubmitSuccess) onSubmitSuccess();
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
          <SelectInput
            name="type"
            label="نوع معامله"
            options={[
              { value: "buy", label: "خرید" },
              { value: "sell", label: "فروش" },
            ]}
          />
          <DateInput name="date" label="تاریخ معامله" />
          <div className="relative">
            <label className="block text-sm font-medium text-content-700 mb-1">
              جستجوی نماد
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="نام یا نماد سهم..."
              autoComplete="off"
              className={cn(
                "w-full h-12 px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2",
                methods.formState.errors.symbol // Access errors directly from methods
                  ? "border-danger-500 bg-danger-50 focus:ring-danger-500/50"
                  : "border-content-300 bg-white focus:ring-primary-500"
              )}
            />
            {methods.formState.errors.symbol && (
              <p className="text-xs text-danger-700 mt-1.5 px-1">
                {methods.formState.errors.symbol.message}
              </p>
            )}
            {isSearchFocused && searchResults.length > 0 && (
              <ul className="absolute z-20 w-full mt-1 bg-white border border-content-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((s) => (
                  <li
                    key={s.isin}
                    className="px-4 py-2 text-sm hover:bg-content-100 cursor-pointer"
                    onMouseDown={() => handleSelectSymbol(s)}>
                    <span className="font-semibold">{s.l18}</span>
                    {s.l30 && s.l18 !== s.l30 && (
                      <span className="text-content-500 mr-2"> ({s.l30})</span>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <TextInput name="price" label="قیمت (تومان)" inputMode="decimal" />
          <TextInput
            name="quantity"
            label="تعداد"
            type="number"
            inputMode="numeric"
          />
          <TextInput
            name="commission"
            label="کارمزد (تومان)"
            type="number"
            inputMode="decimal"
          />
        </div>
        <TextareaInput name="notes" label="یادداشت (اختیاری)" rows={2} />

        <div className="flex justify-end pt-3">
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isEditMode ? "ذخیره تغییرات" : "ثبت معامله"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
