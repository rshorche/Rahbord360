import DetailsActionRenderer from "../components/DetailsActionRenderer";
import StockTradeActionsRenderer from "../components/StockTradeActionsRenderer";
import { formatDisplayNumber } from "../../../shared/utils/formatters";
import { cn } from "../../../shared/utils/cn";

export const getMasterColumnDefs = (handleOpenDetailModal) => [
  { headerName: "نماد", field: "symbol", width: 120, pinned: 'right' },
  { headerName: "تعداد باقی‌مانده", field: "remainingQty", width: 140, valueFormatter: (p) => formatDisplayNumber(p.value, 0), cellClass: "font-semibold" },
  { headerName: "قیمت سر به سر", field: "avgBuyPriceAdjusted", width: 140, valueFormatter: (p) => formatDisplayNumber(p.value, 0) },
  { headerName: "قیمت لحظه‌ای", field: "currentPrice", width: 130, valueFormatter: (p) => formatDisplayNumber(p.value, 0) },
  { headerName: "ارزش لحظه‌ای", field: "currentValue", width: 150, valueFormatter: (p) => formatDisplayNumber(p.value, 0), cellClass: "font-bold text-primary-700" },
  { headerName: "سود/زیان محقق نشده", field: "unrealizedPL", width: 160, valueFormatter: (p) => formatDisplayNumber(p.value, 0), cellClass: (p) => cn(p.value >= 0 ? "text-success-600" : "text-danger-600", "font-medium") },
  { headerName: "سود/زیان محقق شده", field: "totalRealizedPL", width: 160, valueFormatter: (p) => formatDisplayNumber(p.value, 0), cellClass: (p) => (p.value >= 0 ? "text-success-600" : "text-danger-600") },
  { headerName: "سود نقدی و درآمدها", field: "totalDividend", width: 160, valueFormatter: (p) => formatDisplayNumber(p.value, 0) },
  { headerName: "جزئیات", width: 80, cellRenderer: DetailsActionRenderer, cellRendererParams: { onViewDetails: handleOpenDetailModal }, sortable: false, filter: false, resizable: false },
];

export const getDetailColumnDefs = (handleEditAction, handleDeleteAction) => [
    { headerName: "نوع رویداد", field: "type", width: 140, cellRenderer: (p) => {
        const typeMap = { buy: "خرید", sell: "فروش", dividend: "سود نقدی", bonus: "سهام جایزه", rights_exercise: "استفاده از حق", rights_sell: "فروش حق", revaluation: "تجدید ارزیابی", premium: "صرف سهام" };
        return typeMap[p.value] || p.value;
    }},
    { headerName: "تاریخ", field: "date", width: 130, sort: "desc" },
    { headerName: "تعداد", field: "quantity", width: 110, valueFormatter: (p) => p.value ? formatDisplayNumber(p.value, 0) : '-' },
    { headerName: "قیمت", field: "price", width: 120, valueFormatter: (p) => p.value ? formatDisplayNumber(p.value, 0) : '-' },
    { headerName: "مبلغ", field: "amount", width: 140, valueFormatter: (p) => p.value ? formatDisplayNumber(p.value, 0) : '-' },
    { headerName: "یادداشت", field: "notes", flex: 1, tooltipField: 'notes' },
    { headerName: "عملیات", width: 100, cellRenderer: StockTradeActionsRenderer, cellRendererParams: { onEdit: handleEditAction, onDelete: handleDeleteAction }, sortable: false, filter: false, resizable: false },
];