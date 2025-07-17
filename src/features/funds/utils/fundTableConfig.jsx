import { formatCurrency, formatDisplayNumber } from "../../../shared/utils/formatters";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { cn } from "../../../shared/utils/cn";
import FundActionsRenderer from "../components/FundActionsRenderer";
import PercentageBarRenderer from "../../portfolio/components/PercentageBarRenderer";
import Button from "../../../shared/components/ui/Button";
import { Edit, Trash2 } from "lucide-react";

const formatDateToJalali = (params) => {
  if (!params.value) return "-";
  return new DateObject({ date: new Date(params.value), calendar: persian, locale: persian_fa }).format("YYYY/MM/DD");
};

const formatCurrencyValue = (p) => (p.value != null ? formatCurrency(p.value, 0) : "-");
const formatNumberValue = (p) => (p.value != null ? formatDisplayNumber(p.value, 2) : "-");
const formatPercentValue = (p) => (p.value != null ? formatDisplayNumber(p.value, 2, "%") : "-");

const positiveNegativeClass = (p) => cn(p.value >= 0 ? "text-success-700" : "text-danger-700", "font-semibold");
const boldClass = "font-bold";

const getFundTypeLabel = (type) => {
    const map = {
        'GOLD': 'طلا',
        'EQUITY': 'سهامی',
        'FIXED_INCOME': 'درآمد ثابت',
        'OTHER': 'سایر'
    };
    return map[type] || type;
};

export const getOpenPositionsColumnDefs = (onOpenDetailsModal) => [
  { headerName: "نماد صندوق", field: "symbol", width: 120 },
  { headerName: "نوع صندوق", field: "fund_type", width: 120, valueFormatter: (p) => getFundTypeLabel(p.value) },
  { headerName: "تعداد واحد", field: "remainingQty", width: 130, valueFormatter: formatNumberValue, cellClass: boldClass },
  { headerName: "میانگین خرید", field: "avgBuyPrice", width: 140, valueFormatter: formatCurrencyValue },
  { headerName: "قیمت روز", field: "currentPrice", width: 130, valueFormatter: formatCurrencyValue },
  { headerName: "ارزش روز دارایی", field: "currentValue", width: 160, valueFormatter: formatCurrencyValue, cellClass: cn(boldClass, "text-primary-700") },
  { headerName: "سود/زیان باز", field: "unrealizedPL", width: 150, valueFormatter: formatCurrencyValue, cellClass: positiveNegativeClass },
  { headerName: "٪ بازده", field: "percentagePL", width: 120, valueFormatter: formatPercentValue, cellClass: positiveNegativeClass },
  { headerName: "٪ بازده سالانه", field: "annualizedReturnPercent", width: 130, valueFormatter: (p) => formatDisplayNumber(p.value, 1, "%"), cellClass: positiveNegativeClass },
  { headerName: "٪ از کل دارایی", field: "percentageOfPortfolio", width: 150, cellRenderer: PercentageBarRenderer, cellStyle: { padding: 0 } },
  {
    headerName: "جزئیات",
    width: 80,
    cellRenderer: FundActionsRenderer,
    cellRendererParams: { onOpenDetails: onOpenDetailsModal },
    sortable: false,
    filter: false,
  },
];

export const getClosedPositionsColumnDefs = (onOpenDetailsModal) => [
  { headerName: "نماد صندوق", field: "symbol", width: 120 },
  { headerName: "نوع صندوق", field: "fund_type", width: 120, valueFormatter: (p) => getFundTypeLabel(p.value) },
  { headerName: "سود/زیان محقق شده", field: "totalRealizedPL", width: 160, valueFormatter: formatCurrencyValue, cellClass: positiveNegativeClass },
  { headerName: "٪ بازده نهایی", field: "percentagePL", width: 130, valueFormatter: formatPercentValue, cellClass: positiveNegativeClass },
  { headerName: "تاریخ ورود", field: "firstBuyDate", width: 130, valueFormatter: formatDateToJalali },
  { headerName: "تاریخ خروج", field: "lastSellDate", width: 130, valueFormatter: formatDateToJalali },
  { headerName: "عمر پوزیشن (روز)", field: "positionAgeDays", width: 140, valueFormatter: (p) => `${p.value} روز` },
  {
    headerName: "جزئیات",
    width: 80,
    cellRenderer: FundActionsRenderer,
    cellRendererParams: { onOpenDetails: onOpenDetailsModal },
    sortable: false,
    filter: false,
  },
];

export const getDetailColumnDefs = (onEdit, onDelete) => [
    { headerName: 'نوع معامله', field: 'trade_type', width: 120, cellRenderer: p => p.value === 'buy' ? 'خرید' : 'فروش' },
    { headerName: 'تاریخ', field: 'date', width: 130, valueFormatter: formatDateToJalali },
    { headerName: 'تعداد واحد', field: 'quantity', width: 130, valueFormatter: p => p.value ? p.value.toLocaleString('fa-IR') : '-' },
    { headerName: 'قیمت هر واحد', field: 'price_per_unit', width: 140, valueFormatter: p => p.value ? p.value.toLocaleString('fa-IR') : '-' },
    { headerName: 'کارمزد', field: 'commission', width: 120, valueFormatter: p => p.value ? p.value.toLocaleString('fa-IR') : '-' },
    {
      headerName: "عملیات",
      width: 100,
      cellRenderer: (params) => (
        <div className="flex items-center justify-center h-full space-x-1 rtl:space-x-reverse">
          <Button variant="ghost" size="icon" onClick={() => onEdit(params.data)} title="ویرایش" className="h-8 w-8 shadow-none text-primary-600 hover:bg-primary-100">
            <Edit size={16} />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => onDelete(params.data.id)} title="حذف" className="h-8 w-8 shadow-none text-danger-600 hover:bg-danger-100">
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
];