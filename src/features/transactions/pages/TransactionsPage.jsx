// src/features/transactions/pages/TransactionsPage.jsx
import { useMemo, useEffect } from "react";
import { useTransactionsLogic } from "../hooks/useTransactionsLogic";

// ایمپورت کامپوننت‌های عمومی
import Card from "../../../shared/components/ui/Card";
import Button from "../../../shared/components/ui/Button";
import Modal from "../../../shared/components/ui/Modal";
import AgGridTable from "../../../shared/components/ui/AgGridTable";

// ایمپورت کامپوننت‌های خاص فیچر تراکنش
import TransactionForm from "../components/TransactionForm";
import TransactionActionsRenderer from "../components/TransactionActionsRenderer";

// ایمپورت getTransactionColumnDefs
import { getTransactionColumnDefs } from "../utils/transactionTableConfig.jsx";

import { DateObject } from "react-multi-date-picker";

// ایمپورت آیکون‌ها
import { PlusCircle, Wallet, ArrowUp, ArrowDown } from "lucide-react";

export default function TransactionsPage() {
  const {
    transactions,
    totalDeposit,
    totalWithdraw,
    netValue,
    isModalOpen,
    editingTransaction,
    handleOpenModal,
    handleCloseModal,
    handleDelete,
    handleSaveTransaction,
    fetchTransactions,
  } = useTransactionsLogic();

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const columnDefs = useMemo(
    () => getTransactionColumnDefs(handleOpenModal, handleDelete),
    [handleOpenModal, handleDelete]
  );

  const handleSubmitFormSuccess = async (formData, isEditMode) => {
    const processedData = {
      ...formData,
      amount: parseFloat(formData.amount),
      date:
        formData.date instanceof DateObject
          ? formData.date.format("YYYY/MM/DD")
          : formData.date,
    };
    const success = await handleSaveTransaction(processedData, isEditMode);
    if (success) {
      handleCloseModal();
    }
  };

  return (
    <div className="flex flex-col gap-4 md:gap-6 lg:gap-8">

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-between items-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-content-800">
    
          تراکنش‌های واریز و برداشت
        </h1>
        <Button
          variant="primary"
          onClick={() => handleOpenModal()}
          icon={<PlusCircle size={20} />}>
          ثبت تراکنش جدید
        </Button>
      </div>
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
      <div className="bg-white rounded-xl shadow-lg w-full overflow-hidden">
        <AgGridTable rowData={transactions} columnDefs={columnDefs} />
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingTransaction ? "ویرایش تراکنش" : "ثبت تراکنش جدید"}>
        <TransactionForm
          onSubmitSuccess={(formData) =>
            handleSubmitFormSuccess(formData, !!editingTransaction)
          }
          initialData={editingTransaction}
          isEditMode={!!editingTransaction}
        />
      </Modal>
    </div>
  );
}
