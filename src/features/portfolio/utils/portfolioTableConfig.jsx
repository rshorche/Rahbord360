import DetailsActionRenderer from "../components/DetailsActionRenderer"; // مسیر صحیح کامپوننت DetailsActionRenderer
import StockTradeActionsRenderer from "../components/StockTradeActionsRenderer"; // مسیر صحیح کامپوننت StockTradeActionsRenderer
import { formatDisplayNumber } from "../../../shared/utils/formatters"; // مسیر صحیح تابع فرمت‌دهی
import { cn } from "../../../shared/utils/cn"; // مسیر صحیح تابع cn

export const getMasterColumnDefs = (handleOpenDetailModal) => [
  {
    headerName: "نماد",
    field: "symbol",
    width: 100,
    flex: 1,
  },
  {
    headerName: "تاریخ اولین خرید",
    field: "firstBuyDate",
    width: 130,
    sort: "asc",
  },
  {
    headerName: "تعداد باقی‌مانده",
    field: "remainingQty",
    width: 130,
    valueFormatter: (p) => formatDisplayNumber(p.value, 0),
    cellClass: "font-semibold",
  },
  {
    headerName: "میانگین خرید تعدیل‌شده",
    field: "avgBuyPriceAdjusted",
    width: 150,
    valueFormatter: (p) => formatDisplayNumber(p.value, 0),
  },
  {
    headerName: "قیمت لحظه‌ای",
    field: "currentPrice",
    width: 120,
    valueFormatter: (p) => formatDisplayNumber(p.value, 0),
  },
  {
    headerName: "ارزش لحظه‌ای",
    field: "currentValue",
    width: 150,
    valueFormatter: (p) => formatDisplayNumber(p.value, 0),
    cellClass: "font-semibold",
  },
  {
    headerName: "سود/زیان محقق نشده",
    field: "unrealizedPL",
    width: 160,
    valueFormatter: (p) => formatDisplayNumber(p.value, 0),
    cellClass: (p) =>
      p.value >= 0
        ? "text-success-600 font-medium"
        : "text-danger-600 font-medium",
  },
  {
    headerName: "سود/زیان محقق شده (فروش)",
    field: "totalRealizedPL",
    width: 180,
    valueFormatter: (p) => formatDisplayNumber(p.value, 0),
    cellClass: (p) => (p.value >= 0 ? "text-success-600" : "text-danger-600"),
  },
  {
    headerName: "سود مجمع",
    field: "totalDividend",
    width: 130,
    valueFormatter: (p) => formatDisplayNumber(p.value, 0),
    cellClass: "text-primary-600",
  },
  {
    headerName: "درآمد فروش حق تقدم",
    field: "totalRightsSellRevenue",
    width: 170,
    valueFormatter: (p) => formatDisplayNumber(p.value, 0),
    cellClass: "text-purple-600",
  },
  {
    headerName: "جمع کل سود و زیان",
    field: "totalPLWithDividend",
    width: 160,
    valueFormatter: (p) => formatDisplayNumber(p.value, 0),
    cellClass: (p) =>
      p.value >= 0 ? "text-success-700 font-bold" : "text-danger-700 font-bold",
    flex: 1,
  },
  {
    headerName: "درصد سود/زیان",
    field: "percentagePL",
    width: 130,
    valueFormatter: (p) => formatDisplayNumber(p.value, 2, "%"),
    cellClass: (p) =>
      p.value >= 0 ? "text-success-600 font-bold" : "text-danger-600 font-bold",
  },
  {
    headerName: "تعداد کل خرید",
    field: "totalBoughtQty",
    width: 120,
    valueFormatter: (p) => formatDisplayNumber(p.value, 0),
  },
  {
    headerName: "میانگین خرید کل",
    field: "avgBoughtPrice",
    width: 140,
    valueFormatter: (p) => formatDisplayNumber(p.value, 0),
  },
  {
    headerName: "تعداد کل فروش",
    field: "totalSoldQty",
    width: 120,
    valueFormatter: (p) => formatDisplayNumber(p.value, 0),
  },
  {
    headerName: "میانگین فروش کل",
    field: "avgSoldPrice",
    width: 140,
    valueFormatter: (p) => formatDisplayNumber(p.value, 0),
  },
  {
    headerName: "جزئیات",
    width: 80,
    cellRenderer: DetailsActionRenderer,
    cellRendererParams: { onViewDetails: handleOpenDetailModal },
    sortable: false,
    filter: false,
    resizable: false,
    flex: 0,
  },
];

export const getDetailColumnDefs = (handleEditAction, handleDeleteAction) => [
  {
    headerName: "نوع معامله",
    field: "type",
    width: 120,
    cellRenderer: (p) => {
      const typeMap = {
        buy: "خرید",
        sell: "فروش",
        dividend: "سود نقدی",
        bonus: "سهام جایزه",
        rights_exercise: "استفاده از حق",
        rights_sell: "فروش حق",
        revaluation: "تجدید ارزیابی",
        premium: "صرف سهام",
      };
      const colorMap = {
        buy: "text-success-700",
        sell: "text-danger-700",
        dividend: "text-primary-700",
        bonus: "text-purple-700",
        rights_exercise: "text-indigo-700",
        rights_sell: "text-orange-700",
        revaluation: "text-teal-700",
        premium: "text-cyan-700",
      };
      return (
        <span className={cn(`font-medium ${colorMap[p.value] || ""}`)}>
          {typeMap[p.value] || p.value}
        </span>
      );
    },
  },
  { headerName: "تاریخ معامله", field: "date", width: 130, sort: "desc" },
  { headerName: "نماد", field: "symbol", width: 120 },
  {
    headerName: "قیمت",
    field: "price",
    width: 110,
    valueFormatter: (p) =>
      ["buy", "sell", "rights_exercise"].includes(p.data.type) &&
      p.data.price != null
        ? formatDisplayNumber(p.value, 0)
        : "-",
  },
  {
    headerName: "تعداد",
    field: "quantity",
    width: 100,
    valueFormatter: (p) =>
      ["buy", "sell", "bonus", "rights_exercise", "premium"].includes(
        p.data.type
      ) && p.data.quantity != null
        ? formatDisplayNumber(p.value, 0)
        : "-",
  },
  {
    headerName: "یادداشت (اختیاری)",
    field: "notes",
    flex: 1,
    tooltipField: "notes",
  },
  {
    headerName: "عملیات",
    width: 100,
    cellRenderer: StockTradeActionsRenderer,
    cellRendererParams: {
      onEdit: handleEditAction,
      onDelete: handleDeleteAction,
    },
    sortable: false,
    filter: false,
    resizable: false,
  },
];
