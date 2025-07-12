import { formatCurrency, formatDisplayNumber } from "../../../shared/utils/formatters";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { cn } from "../../../shared/utils/cn";
import OptionsActionsRenderer from "../components/OptionsActionsRenderer";

const formatDateToJalali = (params) => {
  if (!params.value) return "-";
  return new DateObject({ date: new Date(params.value), calendar: persian, locale: persian_fa }).format("YYYY/MM/DD");
};

const formatCurrencyValue = (p) => (p.value != null ? formatCurrency(p.value, 0) : "-");
const formatIntegerValue = (p) => (p.value != null ? formatDisplayNumber(p.value, 0) : "-");
const positiveNegativeClass = (p) => cn(p.value >= 0 ? "text-success-700" : "text-danger-700");

const baseColumns = (onOpenActionsModal) => [
  { headerName: "نماد آپشن", field: "option_symbol", width: 140 },
  { 
    headerName: "نوع اختیار", 
    field: "option_type", 
    width: 110,
    cellClass: (p) => p.value === 'call' ? 'text-green-600' : 'text-red-600',
    cellRenderer: (p) => p.value === 'call' ? 'خرید (Call)' : 'فروش (Put)'
  },
  { headerName: "قیمت اعمال", field: "strike_price", width: 120, valueFormatter: formatCurrencyValue },
  { headerName: "پرمیوم (هر سهم)", field: "premium", width: 130, valueFormatter: formatCurrencyValue },
  { headerName: "تعداد قرارداد", field: "contracts_count", width: 130, valueFormatter: formatIntegerValue },
  { headerName: "نماد پایه", field: "underlying_symbol", width: 120 },
  {
    headerName: "عملیات",
    width: 80,
    cellRenderer: OptionsActionsRenderer,
    cellRendererParams: { onOpenActionsModal },
    sortable: false,
    filter: false,
    resizable: false,
  },
];

export const getOpenOptionsColumnDefs = (onOpenActionsModal) => [
    ...baseColumns(onOpenActionsModal).filter(c => c.headerName !== "عملیات"),
    { headerName: "سود/زیان باز", field: "unrealized_pl", width: 150, valueFormatter: formatCurrencyValue, cellClass: positiveNegativeClass },
    { headerName: "روز تا انقضا", field: "days_to_expiration", width: 120, valueFormatter: formatIntegerValue, cellClass: "font-bold" },
    { headerName: "قیمت سربه سر", field: "break_even_price", width: 140, valueFormatter: formatCurrencyValue },
    { headerName: "تاریخ معامله", field: "trade_date", width: 130, valueFormatter: formatDateToJalali },
    { headerName: "تاریخ سررسید", field: "expiration_date", width: 130, valueFormatter: formatDateToJalali },
    ...baseColumns(onOpenActionsModal).filter(c => c.headerName === "عملیات"),
];

export const getHistoryOptionsColumnDefs = (onOpenActionsModal) => [
    ...baseColumns(onOpenActionsModal).filter(c => c.headerName !== "عملیات"),
    { 
        headerName: "وضعیت نهایی", 
        field: "status", 
        width: 120,
        cellRenderer: (p) => {
            const statusMap = { CLOSED: "بسته", EXERCISED: "اعمال شده", EXPIRED: "منقضی" };
            const colorMap = { CLOSED: "bg-gray-200 text-gray-800", EXERCISED: "bg-success-100 text-success-800", EXPIRED: "bg-warning-100 text-warning-800" };
            return <span className={cn("px-2 py-1 text-xs rounded-full font-medium", colorMap[p.value])}>{statusMap[p.value]}</span>;
        }
    },
    { headerName: "تاریخ بستن/اعمال", field: "closing_date", width: 160, valueFormatter: formatDateToJalali },
    ...baseColumns(onOpenActionsModal).filter(c => c.headerName === "عملیات"),
];