import { useState, useMemo, useCallback } from "react";
import useTransactionStore from "../store/useTransactionStore";
import { PlusCircle, Wallet, ArrowUp, ArrowDown } from "lucide-react";
import Swal from "sweetalert2";
import { getTransactionColumnDefs } from "../utils/transactionTableConfig"; // مسیر رو چک کنید
import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";
import AgGridTable from "../../../shared/components/ui/AgGridTable";
import Modal from "../../../shared/components/ui/Modal";
import TransactionForm from "../components/TransactionForm";

export default function TransactionsPage() {
  const { transactions, deleteTransaction, getTotals } = useTransactionStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);

  const { totalDeposit, totalWithdraw, netValue } = useMemo(
    () => getTotals(),
    [getTotals]
  );

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
    () => getTransactionColumnDefs(handleOpenModal, handleDelete),
    [handleOpenModal, handleDelete]
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
