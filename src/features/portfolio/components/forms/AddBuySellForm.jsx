import { useState, useEffect } from "react";
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
import { cn } from "../../../../shared/utils/cn";

const normalizePersianString = (str) => {
  if (typeof str !== "string") return "";
  return str.replace(/ی/g, "ي").replace(/ک/g, "ك").trim().toLowerCase();
};

export default function AddBuySellForm({
  onSubmitSuccess,
  initialData,
  isEditMode = false,
}) {
  const { addAction, updateAction, isLoading } = useStockTradesStore();
  const allSymbols = useAllSymbolsStore((state) => state.symbols);

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const methods = useForm({
    resolver: yupResolver(buySellSchema),
    defaultValues: initialData
      ? { ...initialData, date: new Date(initialData.date) }
      : {
          date: new Date(),
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
    reset,
    formState: { errors },
  } = methods;

  useEffect(() => {
    if (isEditMode && initialData) {
      reset({ ...initialData, date: new Date(initialData.date) });
      setSearchQuery(initialData.symbol || "");
    } else if (!isEditMode) {
      reset({
        date: new Date(), type: "buy", symbol: "", quantity: "", price: "", commission: 0, notes: "",
      });
    }
  }, [initialData, isEditMode, reset]);

  useEffect(() => {
    if (searchQuery.length > 1 && isSearchFocused) {
      const normalizedQuery = normalizePersianString(searchQuery);
      const results = allSymbols
        .filter(
          (s) =>
            normalizePersianString(s.l18).includes(normalizedQuery) ||
            normalizePersianString(s.l30).includes(normalizedQuery)
        )
        .slice(0, 10);
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery, allSymbols, isSearchFocused]);

  const handleSelectSymbol = (symbol) => {
    setSearchQuery(symbol.l18);
    setValue("symbol", symbol.l18, { shouldValidate: true });
    if (symbol.pl) {
      setValue("price", symbol.pl / 10, { shouldValidate: true });
    }
    setSearchResults([]);
    setIsSearchFocused(false);
  };

  const handleFormSubmit = async (formData) => {
    const success = isEditMode
      ? await updateAction(initialData.id, formData)
      : await addAction(formData);

    if (success && onSubmitSuccess) {
      onSubmitSuccess();
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-5">
          <SelectInput
            name="type"
            label="نوع معامله"
            options={[ { value: "buy", label: "خرید" }, { value: "sell", label: "فروش" } ]}
          />
          <DateInput name="date" label="تاریخ معامله" />
          
          <div className="relative">
            <label className="block text-sm font-medium text-content-700 mb-1.5 px-1">
              جستجوی نماد
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setValue("symbol", e.target.value, { shouldValidate: true });
              }}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
              placeholder="بخشی از نام نماد..."
              autoComplete="off"
              className={cn(
                "w-full h-12 px-3 py-2 text-sm border rounded-lg outline-none focus:ring-2 transition-all",
                errors.symbol
                  ? "border-danger-500 bg-danger-50 focus:ring-danger-500/50"
                  : "border-content-300 bg-white focus:ring-primary-500/50"
              )}
            />
             {errors.symbol && (
              <p className="text-xs text-danger-700 mt-1.5 px-1">{errors.symbol.message}</p>
            )}
            {searchResults.length > 0 && (
              <ul className="absolute z-20 w-full mt-1 bg-white border border-content-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((s) => (
                  <li
                    key={s.l18}
                    className="px-4 py-2 text-sm hover:bg-content-100 cursor-pointer"
                    onMouseDown={() => handleSelectSymbol(s)}
                  >
                    <span className="font-semibold">{s.l18}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <TextInput name="price" label="قیمت (تومان)" type="number" />
          <TextInput name="quantity" label="تعداد" type="number" />
          <TextInput name="commission" label="کارمزد (تومان)" type="number" />
        </div>
        <TextareaInput name="notes" label="یادداشت (اختیاری)" rows={2} />

        <div className="flex justify-end pt-3">
          <Button type="submit" variant="primary" disabled={isLoading}>
            {isLoading ? "در حال پردازش..." : (isEditMode ? "ذخیره تغییرات" : "ثبت معامله")}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}