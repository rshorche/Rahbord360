import { formatCurrency, formatDisplayNumber } from "../../../shared/utils/formatters";
import { cn } from "../../../shared/utils/cn";
import OptionsActionsRenderer from "../components/OptionsActionsRenderer";

const formatCurrencyValue = (p) => (p.value != null ? formatCurrency(p.value, 0) : "-");
const formatPercentValue = (p) => (p.value != null ? formatDisplayNumber(p.value, 2, "%") : "-");
const positiveNegativeClass = (p) => cn(p.value >= 0 ? "text-success-700" : "text-danger-700", "font-semibold");

const getStrategyName = (data) => {
    if (!data.position_type || !data.option_type) return "---";
    const type = data.option_type === 'call' ? "کال" : "پوت";
    const action = data.position_type === 'Long' ? "خرید" : "فروش";
    return `${action} ${type}`;
};

const baseColumns = (onOpenActionsModal) => [
  { headerName: "نماد آپشن", field: "option_symbol", width: 140 },
  { 
    headerName: "استراتژی", 
    width: 120,
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

const getFinalOutcome = (params) => {
    const history = params.data?.history || [];
    const closingTrades = history.filter(t => t.trade_type.includes('close'));
    if (closingTrades.length === 0) return "---";

    const outcomeSummary = closingTrades.reduce((acc, trade) => {
        let outcome = "بسته شد";
        if (trade.status === 'EXPIRED') outcome = 'منقضی شد';
        if (trade.status === 'EXERCISED') outcome = 'اعمال شد';
        
        const count = Number(trade.contracts_count) || 0;
        acc[outcome] = (acc[outcome] || 0) + count;
        return acc;
    }, {});

    return Object.entries(outcomeSummary)
        .map(([outcome, count]) => `${count} قرارداد ${outcome}`)
        .join('، ');
};

export const getHistoryOptionsColumnDefs = (onOpenActionsModal) => [
    ...baseColumns(onOpenActionsModal).filter(c => !["عملیات", "تعداد قرارداد", "استراتژی"].includes(c.headerName)),
    { headerName: "تعداد کل قراردادها", field: "history", width: 140, valueGetter: (p) => (p.data?.history || []).filter(t => t.trade_type.includes('open')).reduce((sum, t) => sum + t.contracts_count, 0), valueFormatter: p => formatDisplayNumber(p.value, 0)},
    { headerName: "سود/زیان محقق شده", field: "realized_pl", width: 160, valueFormatter: formatCurrencyValue, cellClass: positiveNegativeClass },
    { headerName: "% بازده نهایی", field: "realized_pl_percent", width: 140, valueFormatter: formatPercentValue, cellClass: positiveNegativeClass },
    { headerName: "سرنوشت نهایی", width: 220, valueGetter: getFinalOutcome, tooltipValueGetter: getFinalOutcome },
    { headerName: "بهای تمام شده اولیه", field: "total_initial_cost", width: 160, valueFormatter: formatCurrencyValue },
    ...baseColumns(onOpenActionsModal).filter(c => c.headerName === "عملیات"),
];