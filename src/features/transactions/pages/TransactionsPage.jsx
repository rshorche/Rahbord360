import { useMemo } from "react";
import { useTransactionsLogic } from "../hooks/useTransactionsLogic";
import { getTransactionColumnDefs } from "../utils/transactionTableConfig.jsx";
import Card from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";
import Modal from "../../../shared/components/ui/Modal";
import AgGridTable from "../../../shared/components/ui/AgGridTable";
import TransactionForm from "../components/TransactionForm";
import { PlusCircle, Wallet, ArrowUp, ArrowDown } from "lucide-react";

export default function TransactionsPage() {
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

  const columnDefs = useMemo(
    () => getTransactionColumnDefs(handleOpenModal, handleDelete),
    [handleOpenModal, handleDelete]
  );

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
        <h1 className="text-3xl font-bold text-content-800">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <AgGridTable
          rowData={transactions}
          columnDefs={columnDefs}
          isLoading={isLoading}
        />
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        isLoading={isLoading}
        title={editingTransaction ? "ویرایش تراکنش" : "ثبت تراکنش جدید"}
      >
        <TransactionForm
          onSubmit={handleSubmitForm}
          initialData={editingTransaction}
        />
      </Modal>
    </div>
  );
}