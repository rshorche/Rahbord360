
import TransactionActionsRenderer from "../components/TransactionActionsRenderer"; // مسیر جدید و صحیح

import { formatCurrency } from "../../../shared/utils/formatters"; // فرض می‌کنیم formatters.js هم در utils/transactions هست

/**
 * پیکربندی ستون‌ها برای جدول تراکنش‌ها (Ag-Grid).
 * @param {function} onEdit - تابع callback برای ویرایش تراکنش.
 * @param {function} onDelete - تابع callback برای حذف تراکنش.
 * @returns {Array} - آرایه‌ای از تعریف ستون‌ها.
 */
export const getTransactionColumnDefs = (onEdit, onDelete) => [
  { headerName: "تاریخ", field: "date", width: 130, sort: "desc" },
  {
    headerName: "نوع",
    field: "type",
    width: 110,
    cellRenderer: (p) => (
      <span
        className={`px-2 py-1 text-xs rounded-full font-medium ${
          p.value === "deposit"
            ? "bg-success-light text-success-800"
            : "bg-danger-light text-danger-800"
        }`}>
        {p.value === "deposit" ? "واریز" : "برداشت"}
      </span>
    ),
  },
  {
    headerName: "مبلغ (تومان)",
    field: "amount",
    width: 160,
    valueFormatter: (p) => formatCurrency(p.value),
    cellClass: "font-semibold",
  },
  { headerName: "کارگزاری", field: "broker", width: 150 },
  {
    headerName: "توضیحات",
    field: "description",
    flex: 1,
    tooltipField: "description",
  },
  {
    headerName: "عملیات",
    width: 100,
    cellRenderer: TransactionActionsRenderer,
    cellRendererParams: { onEdit: onEdit, onDelete: onDelete },
    sortable: false,
    resizable: false,
  },
];
