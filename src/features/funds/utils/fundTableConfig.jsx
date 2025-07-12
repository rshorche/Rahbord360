import FundTradeActionsRenderer from "../components/FundTradeActionsRenderer";
import FundPositionDetailsRenderer from "../components/FundPositionDetailsRenderer";
import { formatCurrency, formatDisplayNumber } from "../../../shared/utils/formatters";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { cn } from "../../../shared/utils/cn";

const formatDate = (params) => {
  if (!params.value) return "";
  return new DateObject({ date: params.value, calendar: persian, locale: persian_fa }).format("YYYY/MM/DD");
};

const fundTypeMap = {
  GOLD: "طلا",
  EQUITY: "سهامی",
  FIXED_INCOME: "درآمد ثابت",
};

const positiveNegativeClass = (p) => cn(p.value >= 0 ? "text-success-700" : "text-danger-700");

export const getOpenFundPositionsColumnDefs = (onViewDetails) => [
  { headerName: "نماد صندوق", field: "symbol", width: 140 },
  { 
    headerName: "نوع صندوق", 
    field: "fund_type", 
    width: 120,
    cellRenderer: (p) => fundTypeMap[p.value] || p.value
  },
  { headerName: "تعداد واحد", field: "quantity", width: 130, valueFormatter: (p) => formatDisplayNumber(p.value, 4) },
  { headerName: "میانگین خرید", field: "avg_buy_price", width: 150, valueFormatter: (p) => formatCurrency(p.value, 0) },
  { headerName: "ارزش کل", field: "current_value", width: 170, valueFormatter: (p) => formatCurrency(p.value, 0), cellClass: "font-semibold text-primary-700" },
  { headerName: "سود/زیان کل", field: "total_pl", width: 160, valueFormatter: (p) => formatCurrency(p.value, 0), cellClass: positiveNegativeClass },
  { 
    headerName: "جزئیات", 
    width: 100, 
    cellRenderer: FundPositionDetailsRenderer,
    cellRendererParams: { onViewDetails },
    sortable: false,
    filter: false,
  },
];

export const getHistoryFundTradesColumnDefs = (onEdit, onDelete) => [
  { headerName: "تاریخ", field: "date", width: 130, valueFormatter: formatDate, sort: 'desc' },
  { headerName: "نماد صندوق", field: "symbol", width: 140 },
  { 
    headerName: "نوع معامله", 
    field: "trade_type", 
    width: 120,
    cellRenderer: (p) => p.value === 'buy' ? 'خرید' : 'فروش'
  },
  { headerName: "تعداد واحد", field: "quantity", width: 130, valueFormatter: (p) => formatDisplayNumber(p.value, 0) },
  { headerName: "قیمت هر واحد", field: "price_per_unit", width: 150, valueFormatter: (p) => formatCurrency(p.value, 0) },
  { headerName: "کارمزد", field: "commission", width: 120, valueFormatter: (p) => formatCurrency(p.value, 0) },
  { headerName: "یادداشت", field: "notes", flex: 1, tooltipField: 'notes' },
  {
    headerName: "عملیات",
    width: 100,
    cellRenderer: FundTradeActionsRenderer,
    cellRendererParams: { onEdit, onDelete },
    sortable: false,
    filter: false,
  },
];