import { useState, useMemo, useCallback } from "react";
import useTransactionStore from "../store/transactions/transactions";
import AgGridTable from "../components/AgGridTable";
import TransactionForm from "../components/transactions/TransactionForm";
import Card from "../components/common/Card";
import Modal from "../components/common/Modal";
import Button from "../components/common/Button";
import {
  PlusCircle,
  Edit,
  Trash2,
  Wallet,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import Swal from "sweetalert2";

const formatCurrency = (value) => Number(value).toLocaleString("fa-IR");

const ActionsRenderer = ({ data, onEdit, onDelete }) => (
  <div className="flex items-center justify-center h-full space-x-1 rtl:space-x-reverse">
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onEdit(data)}
      title="ویرایش"
      className="h-8 w-8 shadow-none text-blue-600 hover:bg-blue-100">
      <Edit size={16} />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      onClick={() => onDelete(data.id)}
      title="حذف"
      className="h-8 w-8 shadow-none text-danger-600 hover:bg-danger-100">
      <Trash2 size={16} />
    </Button>
  </div>
);

export default function Transactions() {
  const { transactions, deleteTransaction } = useTransactionStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const { totalDeposit, totalWithdraw, netValue } = useMemo(() => {
    let deposit = 0;
    let withdraw = 0;
    transactions.forEach((t) => {
      if (t.type === "deposit") {
        deposit += t.amount;
      } else {
        withdraw += t.amount;
      }
    });
    return {
      totalDeposit: deposit,
      totalWithdraw: withdraw,
      netValue: deposit - withdraw,
    };
  }, [transactions]);

  const handleOpenModal = useCallback((transaction = null) => {
    setEditingTransaction(transaction);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTransaction(null);
  }, []);

  const handleDelete = useCallback(
    async (id) => {
      const result = await Swal.fire({
        title: "آیا مطمئن هستید؟",
        text: "این تراکنش برای همیشه حذف خواهد شد!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6b7280",
        confirmButtonText: "بله، حذف کن!",
        cancelButtonText: "لغو",
      });
      if (result.isConfirmed) {
        deleteTransaction(id);
        Swal.fire({
          title: "حذف شد!",
          text: "تراکنش با موفقیت حذف شد.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
          toast: true,
          position: "top-end",
        });
      }
    },
    [deleteTransaction]
  );

  const columnDefs = useMemo(
    () => [
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
        cellRenderer: ActionsRenderer,
        cellRendererParams: { onEdit: handleOpenModal, onDelete: handleDelete },
        sortable: false,
        resizable: false,
      },
    ],
    [handleDelete, handleOpenModal]
  );

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-screen-xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-content-800">
          تراکنش‌های واریز و برداشت
        </h1>
        <Button
          variant="primary"
          onClick={() => handleOpenModal()}
          icon={<PlusCircle size={20} />}>
          ثبت تراکنش جدید
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="مجموع واریزها"
          amount={totalDeposit}
          color="success"
          icon={<ArrowDown size={28} className="text-success-700" />}
        />
        <Card
          title="مجموع برداشت‌ها"
          amount={totalWithdraw}
          color="danger"
          icon={<ArrowUp size={28} className="text-danger-700" />}
        />
        <Card
          title="خالص موجودی"
          amount={netValue}
          color="primary"
          icon={<Wallet size={28} className="text-primary-600" />}
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg w-full overflow-hidden">
        <div style={{ height: "65vh" }}>
          <AgGridTable rowData={transactions} columnDefs={columnDefs} />
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTransaction ? "ویرایش تراکنش" : "ثبت تراکنش جدید"}>
        <TransactionForm
          onSubmitSuccess={handleCloseModal}
          initialData={editingTransaction}
          isEditMode={!!editingTransaction}
        />
      </Modal>
    </div>
  );
}
