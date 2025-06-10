import TransactionActionsRenderer from "../components/TransactionActionsRenderer"; // مسیر صحیح کامپوننت ActionsRenderer
import { formatCurrency } from "../../../shared/utils/formatters"; // مسیر صحیح تابع فرمت‌دهی

export const getTransactionColumnDefs = (handleOpenModal, handleDelete) => [
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
    cellRendererParams: { onEdit: handleOpenModal, onDelete: handleDelete }, // پاس دادن توابع به Cell Renderer
    sortable: false,
    resizable: false,
  },
];
