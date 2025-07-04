import { useMemo } from "react";
import { useTransactionsLogic } from "../hooks/useTransactionsLogic"; // هوک جدید را ایمپورت می‌کنیم
import { getTransactionColumnDefs } from "../utils/transactionTableConfig.jsx";
import Card from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";
import Modal from "../../../shared/components/ui/Modal";
import AgGridTable from "../../../shared/components/ui/AgGridTable";
import TransactionForm from "../components/TransactionForm";
import { PlusCircle, Wallet, ArrowUp, ArrowDown } from "lucide-react";

export default function TransactionsPage() {
  // تمام منطق از طریق این یک خط فراخوانی می‌شود
  const {
    transactions,
    isLoading,
    totalDeposit,
    totalWithdraw,
    netValue,
    isModalOpen,
    editingTransaction,
    handleOpenModal,
    handleCloseModal,
    handleDelete,
    handleSubmitForm,
  } = useTransactionsLogic();

  // تعریف ستون‌ها همچنان اینجا باقی می‌ماند چون مستقیماً به UI مربوط است
  const columnDefs = useMemo(
    () => getTransactionColumnDefs(handleOpenModal, handleDelete),
    [handleOpenModal, handleDelete]
  );

  return (
    <div className="flex flex-col gap-4 md:gap-6 lg:gap-8">
      {/* --- Header --- */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between items-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-content-800">
          تراکنش‌های واریز و برداشت
        </h1>
        <Button
          variant="primary"
          onClick={() => handleOpenModal()}
          icon={<PlusCircle size={20} />}
        >
          ثبت تراکنش جدید
        </Button>
      </div>

      {/* --- Metric Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
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

      {/* --- Data Grid --- */}
      <div className="bg-white rounded-xl shadow-lg w-full overflow-hidden">
        <AgGridTable
          rowData={transactions}
          columnDefs={columnDefs}
          isLoading={isLoading}
        />
      </div>

      {/* --- Add/Edit Modal --- */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isLoading={isLoading}
        title={editingTransaction ? "ویرایش تراکنش" : "ثبت تراکنش جدید"}
      >
        <TransactionForm
          onSubmitSuccess={handleSubmitForm}
          initialData={editingTransaction}
          isEditMode={!!editingTransaction}
        />
      </Modal>
    </div>
  );
}