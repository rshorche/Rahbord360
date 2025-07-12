import { useMemo } from "react";
import { useOptionsLogic } from "../hooks/useOptionsLogic";
import { getOpenOptionsColumnDefs, getHistoryOptionsColumnDefs } from "../utils/optionsTableConfig";
import AgGridTable from "../../../shared/components/ui/AgGridTable";
import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";
import OptionsForm from "../components/OptionsForm";
import { PlusCircle, Edit, Trash2, CheckSquare, RotateCcw, XCircle, ShoppingCart } from "lucide-react";
import { cn } from "../../../shared/utils/cn";

export default function OptionsPage() {
  const {
    isLoading,
    activeTab,
    setActiveTab,
    openPositions,
    historyPositions,
    modal,
    openModal,
    closeModal,
    handleAddSubmit,
    handleEditSubmit,
    handleExercisePosition,
    handleExpirePosition,
    handleReopenPosition,
    handleDeletePosition,
  } = useOptionsLogic();

  const columnDefs = useMemo(
    () =>
      activeTab === "open"
        ? getOpenOptionsColumnDefs(position => openModal("actions", position))
        : getHistoryOptionsColumnDefs(position => openModal("actions", position)),
    [activeTab, openModal]
  );

  const tabButtonClasses = "px-4 py-2 text-sm font-medium transition-colors border-b-2";
  const activeTabClasses = "border-primary-500 text-primary-600";
  const inactiveTabClasses = "border-transparent text-content-500 hover:text-content-700";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-content-800">
          مدیریت معاملات اختیار
        </h1>
        <Button
          variant="primary"
          onClick={() => openModal("add")}
          icon={<PlusCircle size={20} />}
        >
          ثبت معامله جدید
        </Button>
      </div>

      <div className="border-b border-content-200">
        <nav className="-mb-px flex space-x-4 rtl:space-x-reverse" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("open")}
            className={cn(tabButtonClasses, activeTab === "open" ? activeTabClasses : inactiveTabClasses)}
          >
            پوزیشن‌های باز ({openPositions.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(tabButtonClasses, activeTab === "history" ? activeTabClasses : inactiveTabClasses)}
          >
            تاریخچه ({historyPositions.length})
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <AgGridTable
          rowData={activeTab === "open" ? openPositions : historyPositions}
          columnDefs={columnDefs}
          isLoading={isLoading}
        />
      </div>

      <Modal isOpen={modal.type === "add" || modal.type === "edit"} onClose={closeModal} title={modal.type === 'edit' ? "ویرایش معامله" : "ثبت معامله جدید"} isLoading={isLoading}>
        <OptionsForm
          onSubmit={modal.type === 'edit' ? handleEditSubmit : handleAddSubmit}
          isLoading={isLoading}
          isEditMode={modal.type === 'edit'}
          initialData={modal.data}
        />
      </Modal>
      
      <Modal isOpen={modal.type === "actions"} onClose={closeModal} title={`عملیات برای: ${modal.data?.option_symbol}`}>
        <div className="flex flex-col space-y-3 p-2">
            {modal.data?.status === 'OPEN' ? (
                <>
                    <Button
                        variant="outline"
                        onClick={() => openModal('add', { trade_type: 'sell_to_close', option_symbol: modal.data.option_symbol })}
                        icon={<ShoppingCart size={18} />}
                    >
                        فروش (معامله معکوس)
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleExercisePosition(modal.data)}
                        icon={<CheckSquare size={18} />}
                    >
                        اعمال اختیار
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => handleExpirePosition(modal.data)}
                        icon={<XCircle size={18} />}
                    >
                        منقضی کردن
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => openModal("edit", modal.data)}
                        icon={<Edit size={18} />}
                    >
                        ویرایش معامله
                    </Button>
                </>
            ) : (
                <Button
                    variant="outline"
                    onClick={() => handleReopenPosition(modal.data)}
                    icon={<RotateCcw size={18} />}
                >
                    اصلاح / بازگشایی پوزیشن
                </Button>
            )}
            <Button
              variant="danger-light"
              onClick={() => handleDeletePosition(modal.data.id)}
              icon={<Trash2 size={18} />}
            >
              حذف کلی معامله
            </Button>
        </div>
      </Modal>
    </div>
  );
}