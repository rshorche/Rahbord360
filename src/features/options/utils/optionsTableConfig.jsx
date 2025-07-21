import { formatCurrency, formatDisplayNumber } from "../../../shared/utils/formatters";
import { cn } from "../../../shared/utils/cn";
import OptionsActionsRenderer from "../components/OptionsActionsRenderer";

const formatCurrencyValue = (p) => (p.value != null ? formatCurrency(p.value, 0) : "-");
const formatPercentValue = (p) => (p.value != null ? formatDisplayNumber(p.value, 2, "%") : "-");
const positiveNegativeClass = (p) => cn(p.value >= 0 ? "text-success-700" : "text-danger-700", "font-semibold");

const getStrategyName = (data) => {
    if (!data.position_type || !data.option_type) return "---";
    const type = data.option_type === 'call' ? "خرید (ض)" : "فروش (ط)";
    const action = data.position_type === 'Long' ? "خرید" : "فروش";
    return `${action} اختیار ${type}`;
};

const baseColumns = (onOpenActionsModal) => [
  { headerName: "نماد آپشن", field: "option_symbol", width: 140 },
  { 
    headerName: "استراتژی", 
    width: 140,
    valueGetter: (p) => getStrategyName(p.data),
    cellClass: (p) => p.data.position_type === 'Long' ? 'text-success-600 font-semibold' : 'text-danger-600 font-semibold',
  },
  { headerName: "تعداد قرارداد", field: "contracts_count", width: 130, valueFormatter: (p) => formatDisplayNumber(Math.abs(p.value), 0) },
  { headerName: "قیمت اعمال", field: "strike_price", width: 120, valueFormatter: formatCurrencyValue },
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
    { headerName: "میانگین پرمیوم", field: "avg_premium", width: 140, valueFormatter: formatCurrencyValue },
    { headerName: "هزینه کل", field: "cost_basis", width: 150, valueFormatter: formatCurrencyValue },
    { headerName: "قیمت سربه سر", field: "break_even_price", width: 140, valueFormatter: formatCurrencyValue },
    { headerName: "سود/زیان باز", field: "unrealized_pl", width: 150, valueFormatter: formatCurrencyValue, cellClass: positiveNegativeClass },
    { headerName: "٪ سود/زیان باز", field: "unrealized_pl_percent", width: 140, valueFormatter: formatPercentValue, cellClass: positiveNegativeClass },
    { headerName: "روز تا انقضا", field: "days_to_expiration", width: 120, valueFormatter: (p) => formatDisplayNumber(p.value, 0), cellClass: "font-bold" },
    ...baseColumns(onOpenActionsModal).filter(c => c.headerName === "عملیات"),
];

export const getHistoryOptionsColumnDefs = (onOpenActionsModal) => [
    ...baseColumns(onOpenActionsModal).filter(c => !["عملیات", "تعداد قرارداد", "میانگین پرمیوم"].includes(c.headerName)),
    { 
        headerName: "وضعیت نهایی", 
        field: "status", 
        width: 120,
        cellRenderer: (p) => {
            const statusMap = { CLOSED: "بسته", EXERCISED: "اعمال شده", EXPIRED: "منقضی" };
            const colorMap = { CLOSED: "bg-gray-200 text-gray-800", EXERCISED: "bg-success-100 text-success-800", EXPIRED: "bg-warning-100 text-warning-800" };
            return <span className={cn("px-2 py-1 text-xs rounded-full font-medium", colorMap[p.value])}>{statusMap[p.value] || '---'}</span>;
        }
    },
    { headerName: "سود/زیان محقق شده", field: "realized_pl", width: 160, valueFormatter: formatCurrencyValue, cellClass: positiveNegativeClass },
    { headerName: "% بازده نهایی", field: "realized_pl_percent", width: 140, valueFormatter: formatPercentValue, cellClass: positiveNegativeClass },
    { headerName: "بهای تمام شده اولیه", field: "total_initial_cost", width: 160, valueFormatter: formatCurrencyValue },
    ...baseColumns(onOpenActionsModal).filter(c => c.headerName === "عملیات"),
];