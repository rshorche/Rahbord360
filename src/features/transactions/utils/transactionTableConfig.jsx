import TransactionActionsRenderer from "../components/TransactionActionsRenderer";
import { formatCurrency } from "../../../shared/utils/formatters";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";

export const getTransactionColumnDefs = (onEdit, onDelete) => [
  {
    headerName: "تاریخ",
    field: "date",
    width: 130,
    sort: "desc",
    valueFormatter: (params) => {
      if (!params.value) return "";

      const gregorianDate = new Date(params.value);

      const jalaliDate = new DateObject({
        date: gregorianDate,
        calendar: persian,
        locale: persian_fa,
      }).format("YYYY/MM/DD");

      return jalaliDate;
    },
  },
  {
    headerName: "نوع",
    field: "type",
    width: 110,
    cellRenderer: (p) => (
      <span
        className={`px-2 py-1 text-xs rounded-full font-medium ${
          p.value === "deposit"
            ? "bg-success-100 text-success-800"
            : "bg-danger-100 text-danger-800"
        }`}
      >
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
    cellRendererParams: {
      onEdit: onEdit,
      onDelete: onDelete,
    },
    sortable: false,
    resizable: false,
  },
];