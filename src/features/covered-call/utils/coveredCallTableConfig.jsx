import { formatCurrency, formatDisplayNumber } from "../../../shared/utils/formatters";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { cn } from "../../../shared/utils/cn";
import CoveredCallActionsRenderer from "../components/CoveredCallActionsRenderer";

const formatDateToJalali = (params) => {
  if (!params.value) return "-";
  return new DateObject({ date: new Date(params.value), calendar: persian, locale: persian_fa }).format("YYYY/MM/DD");
};

const formatCurrencyValue = (p) => (p.value != null ? formatCurrency(p.value, 0) : "-");
const formatPercentValue = (p) => (p.value != null ? formatDisplayNumber(p.value, 1, "%") : "-");
const formatIntegerValue = (p) => (p.value != null ? formatDisplayNumber(p.value, 0) : "-");
const positiveNegativeClass = (p) => cn(p.value >= 0 ? "text-success-700" : "text-danger-700", "font-semibold");


const getCommonColumns = (onOpenActionsModal) => [
  { headerName: "نام اختیار", field: "option_symbol", width: 140 },
  {
    headerName: "مدیریت",
    width: 80,
    cellRenderer: CoveredCallActionsRenderer,
    cellRendererParams: { onOpenActionsModal },
    sortable: false,
    filter: false,
    resizable: false,
  },
];

export const getOpenPositionsColumnDefs = (onOpenActionsModal) => [
  ...getCommonColumns(onOpenActionsModal).filter(c => c.field === 'option_symbol'),
  { headerName: "تعداد قرارداد", field: "contracts_count", width: 130, valueFormatter: formatIntegerValue },
  { headerName: "قیمت پایه", field: "underlying_cost_basis", width: 120, valueFormatter: formatCurrencyValue },
  { headerName: "قیمت اعمال", field: "strike_price", width: 120, valueFormatter: formatCurrencyValue },
  { headerName: "قیمت سر به سر", field: "break_even_price", width: 130, valueFormatter: formatCurrencyValue },
  { headerName: "قیمت لحظه‌ای سهم", field: "current_stock_price", width: 140, valueFormatter: formatCurrencyValue },
  { headerName: "روز تا سررسید", field: "days_to_expiration", width: 120, valueFormatter: formatIntegerValue, cellClass:"font-bold" },
  { headerName: "فاصله تا اعمال", field: "distance_to_strike_percent", width: 140, valueFormatter: formatPercentValue, cellClass: positiveNegativeClass },
  { headerName: "فاصله تا سربه سر", field: "distance_to_be_percent", width: 150, valueFormatter: formatPercentValue, cellClass: positiveNegativeClass },
  { headerName: "سود تا سررسید", field: "return_if_assigned_percent", width: 140, valueFormatter: formatPercentValue, cellClass:"text-primary-600 font-semibold" },
  { headerName: "سود سالانه", field: "annualized_return_percent", width: 130, valueFormatter: formatPercentValue, cellClass: "font-bold text-lg text-primary-700" },
  { headerName: "ارزش سود بالقوه", field: "max_profit", width: 150, valueFormatter: formatCurrencyValue },
  { headerName: "پرمیوم خالص", field: "net_premium", width: 140, valueFormatter: formatCurrencyValue },
  { headerName: "سرمایه درگیر", field: "capital_involved", width: 150, valueFormatter: formatCurrencyValue },
  ...getCommonColumns(onOpenActionsModal).filter(c => c.headerName === 'مدیریت'),
];

export const getHistoryColumnDefs = (onOpenActionsModal) => [
  ...getCommonColumns(onOpenActionsModal).filter(c => c.field === 'option_symbol'),
  {
    headerName: "وضعیت نهایی", field: "status", width: 120, cellRenderer: (p) => {
      const statusMap = { CLOSED: "بسته", ASSIGNED: "اعمال شده", EXPIRED: "منقضی" };
      const colorMap = { CLOSED: "bg-gray-200 text-gray-800", ASSIGNED: "bg-success-100 text-success-800", EXPIRED: "bg-warning-100 text-warning-800" };
      return <span className={cn("px-2 py-1 text-xs rounded-full font-medium", colorMap[p.value])}>{statusMap[p.value]}</span>;
    },
  },
  { headerName: "سود/زیان محقق شده", field: "realized_pl", width: 160, valueFormatter: formatCurrencyValue, cellClass: positiveNegativeClass },
  { headerName: "بازده محقق شده", field: "realized_return_percent", width: 150, valueFormatter: formatPercentValue, cellClass: positiveNegativeClass },
  { headerName: "قیمت اعمال", field: "strike_price", width: 120, valueFormatter: formatCurrencyValue },
  { headerName: "پرمیوم دریافتی", field: "premium_per_share", width: 140, valueFormatter: formatCurrencyValue },
  { headerName: "مدت نگهداری", field: "holding_period_days", width: 130, valueFormatter: (p) => `${formatDisplayNumber(p.value, 0)} روز` },
  { headerName: "تاریخ بستن/سررسید", field: "closing_date", width: 160, valueFormatter: formatDateToJalali },
  { headerName: "یادداشت", field: "notes", width: 180, tooltipField: 'notes' },
  ...getCommonColumns(onOpenActionsModal).filter(c => c.headerName === 'مدیریت'),
];