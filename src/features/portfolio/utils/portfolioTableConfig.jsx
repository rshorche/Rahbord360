import DetailsActionRenderer from "../components/DetailsActionRenderer";
import StockTradeActionsRenderer from "../components/StockTradeActionsRenderer";
import PercentageBarRenderer from "../components/PercentageBarRenderer";
import { formatDisplayNumber, formatCurrency } from "../../../shared/utils/formatters";
import { cn } from "../../../shared/utils/cn";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

const formatDateToJalali = (params) => {
  if (!params.value) return "";
  return new DateObject({ date: new Date(params.value), calendar: persian, locale: persian_fa }).format("YYYY/MM/DD");
};

const formatNoteForDisplay = (params) => {
    const originalNote = params.value;
    if (!originalNote) return '';
    // This will remove the technical reference part, e.g., " [ref_cc:...]"
    return originalNote.replace(/\s*\[ref_cc:.*\]$/, '').trim();
};

const boldClass = "font-bold";
const positiveNegativeClass = (p) => cn(p.value >= 0 ? "text-success-700" : "text-danger-700");

export const getMasterColumnDefs = (handleOpenDetailModal) => [
  { headerName: "نماد", field: "symbol", width: 110 },
  { headerName: "تاریخ ورود", field: "firstBuyDate", width: 130, valueFormatter: formatDateToJalali },
  { headerName: "تعداد فعلی", field: "remainingQty", width: 120, valueFormatter: (p) => formatDisplayNumber(p.value, 0), cellClass: boldClass },
  { headerName: "قیمت سر به سر", field: "avgBuyPriceAdjusted", width: 140, valueFormatter: (p) => formatCurrency(p.value) },
  { headerName: "قیمت لحظه‌ای", field: "currentPrice", width: 130, valueFormatter: (p) => formatCurrency(p.value) },
  { headerName: "ارزش لحظه‌ای", field: "currentValue", width: 150, valueFormatter: (p) => formatCurrency(p.value), cellClass: cn(boldClass, "text-primary-700") },
  { headerName: "سود/زیان نهایی", field: "totalPL", width: 160, valueFormatter: (p) => formatCurrency(p.value), cellClass: (p) => cn(positiveNegativeClass(p), boldClass) },
  { headerName: "٪ بازده نهایی", field: "percentagePL", width: 130, valueFormatter: (p) => formatDisplayNumber(p.value, 2, "%"), cellClass: (p) => cn(positiveNegativeClass(p), boldClass) },
  { headerName: "بازده سالانه", field: "annualizedReturnPercent", width: 140, valueFormatter: (p) => formatDisplayNumber(p.value, 1, "%"), cellClass: (p) => cn(positiveNegativeClass(p), "text-lg")},
  { headerName: "عمر پوزیشن (روز)", field: "positionAgeDays", width: 140, valueFormatter: (p) => formatDisplayNumber(p.value, 0) },
  { headerName: "٪ از کل پورتفولیو", field: "percentageOfPortfolio", width: 150, cellRenderer: PercentageBarRenderer, cellStyle: { padding: 0 } },
  { headerName: "جزئیات", width: 80, cellRenderer: DetailsActionRenderer, cellRendererParams: { onViewDetails: handleOpenDetailModal }, sortable: false, filter: false, resizable: false },
];

export const getClosedColumnDefs = (handleOpenDetailModal) => [
    { headerName: "نماد", field: "symbol", width: 110 },
    { headerName: "تاریخ ورود", field: "firstBuyDate", width: 130, valueFormatter: formatDateToJalali },
    { headerName: "میانگین خرید", field: "avgBoughtPrice", width: 140, valueFormatter: (p) => formatCurrency(p.value)},
    { headerName: "میانگین فروش", field: "avgSoldPrice", width: 140, valueFormatter: (p) => p.value > 0 ? formatCurrency(p.value) : '-' },
    { headerName: "٪ بازده نهایی", field: "percentagePL", width: 130, valueFormatter: (p) => formatDisplayNumber(p.value, 2, "%"), cellClass: (p) => cn(positiveNegativeClass(p), boldClass) },
    { headerName: "درآمدهای جانبی", field: "totalDividend", width: 150, valueFormatter: (p) => formatCurrency(p.value), cellClass: "text-sky-700" },
    { headerName: "سود/زیان فروش", field: "totalRealizedPL", width: 150, valueFormatter: (p) => formatCurrency(p.value), cellClass: (p) => cn(positiveNegativeClass(p), boldClass) },
    { headerName: "تاریخ خروج", field: "lastSellDate", width: 130, valueFormatter: formatDateToJalali },
    { headerName: "عمر پوزیشن (روز)", field: "positionAgeDays", width: 140, valueFormatter: (p) => formatDisplayNumber(p.value, 0) },
    { headerName: "جزئیات", width: 80, cellRenderer: DetailsActionRenderer, cellRendererParams: { onViewDetails: handleOpenDetailModal }, sortable: false, filter: false, resizable: false },
]

export const getDetailColumnDefs = (handleEditAction, handleDeleteAction) => [
  { headerName: "نوع رویداد", field: "type", width: 140, cellRenderer: (p) => {
      const typeMap = { buy: "خرید", sell: "فروش", dividend: "سود نقدی", bonus: "سهام جایزه", rights_exercise: "استفاده از حق", rights_sell: "فروش حق", revaluation: "تجدید ارزیابی", premium: "صرف سهام" };
      return typeMap[p.value] || p.value;
  }},
  { headerName: "تاریخ", field: "date", width: 130, sort: "desc", valueFormatter: formatDateToJalali },
  { headerName: "تعداد", field: "quantity", width: 110, valueFormatter: (p) => p.value ? formatDisplayNumber(p.value, 0) : '-' },
  { headerName: "قیمت", field: "price", width: 120, valueFormatter: (p) => p.value ? formatCurrency(p.value) : '-' },
  { headerName: "مبلغ", field: "amount", width: 140, valueFormatter: (p) => p.value ? formatCurrency(p.value) : '-' },
  { headerName: "یادداشت", field: "notes", flex: 1, tooltipField: 'notes', valueFormatter: formatNoteForDisplay },
  { headerName: "عملیات", width: 100, cellRenderer: StockTradeActionsRenderer, cellRendererParams: { onEdit: handleEditAction, onDelete: handleDeleteAction }, sortable: false, filter: false, resizable: false },
];