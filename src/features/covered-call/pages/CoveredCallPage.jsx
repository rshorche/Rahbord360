import { useMemo } from "react";
import { useCoveredCallLogic } from "../hooks/useCoveredCallLogic";
import { getOpenPositionsColumnDefs, getHistoryColumnDefs } from "../utils/coveredCallTableConfig";
import AgGridTable from "../../../shared/components/ui/AgGridTable";
import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card"; 
import CoveredCallForm from "../components/CoveredCallForm";
import ManageCoveredCallForm from "../components/ManageCoveredCallForm";
import { PlusCircle, Edit, Trash2, CheckCircle, RotateCcw, PiggyBank, Briefcase, DollarSign } from "lucide-react"; 
import { cn } from "../../../shared/utils/cn";

export default function CoveredCallPage() {
  const {
    isLoading,
    activeTab,
    setActiveTab,
    openPositions,
    historyPositions,
    portfolioOpenPositions,
    summaryMetrics, 
    modal,
    openModal,
    closeModal,
    handleAddSubmit,
    handleEditSubmit,
    handleManageSubmit,
    handleDeletePosition,
    handleReopenPosition,
  } = useCoveredCallLogic();

  const columnDefs = useMemo(
    () =>
      activeTab === "open"
        ? getOpenPositionsColumnDefs(position => openModal("actions", position))
        : getHistoryColumnDefs(position => openModal("actions", position)),
    [activeTab, openModal]
  );

  const tabButtonClasses = "px-4 py-2 text-sm font-medium transition-colors border-b-2";
  const activeTabClasses = "border-primary-500 text-primary-600";
  const inactiveTabClasses = "border-transparent text-content-500 hover:text-content-700";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-content-800">
          مدیریت معاملات کاورد کال
        </h1>
        <Button
          variant="primary"
          onClick={() => openModal("add")}
          icon={<PlusCircle size={20} />}
        >
          ثبت معامله جدید
        </Button>
      </div>

      {/* بخش جدید: نمایش کارت‌ها */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card
          title="پرمیوم دریافتی (باز)"
          amount={summaryMetrics.totalPremiumOpen}
          color="primary"
          icon={<PiggyBank size={24} />}
        />
        <Card
          title="سرمایه درگیر (باز)"
          amount={summaryMetrics.totalCapitalInvolved}
          color="default"
          icon={<Briefcase size={24} />}
        />
        <Card
          title="سود/زیان محقق شده"
          amount={summaryMetrics.totalRealizedPL}
          color={summaryMetrics.totalRealizedPL >= 0 ? "success" : "danger"}
          icon={<DollarSign size={24} />}
        />
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

      <Modal isOpen={modal.type === "add"} onClose={closeModal} title="ثبت معامله جدید کاورد کال" isLoading={isLoading}>
        <CoveredCallForm
          onSubmit={handleAddSubmit}
          isLoading={isLoading}
          openPositions={portfolioOpenPositions}
        />
      </Modal>

      <Modal isOpen={modal.type === "edit"} onClose={closeModal} title={`ویرایش معامله: ${modal.data?.option_symbol}`} isLoading={isLoading}>
        <CoveredCallForm
          onSubmit={handleEditSubmit}
          isLoading={isLoading}
          isEditMode={true}
          initialData={modal.data}
          openPositions={portfolioOpenPositions}
        />
      </Modal>

      <Modal isOpen={modal.type === "manage"} onClose={closeModal} title={`مدیریت پوزیشن: ${modal.data?.option_symbol}`} isLoading={isLoading}>
        <ManageCoveredCallForm
          position={modal.data}
          onSubmit={handleManageSubmit}
          isLoading={isLoading}
        />
      </Modal>

      <Modal isOpen={modal.type === "actions"} onClose={closeModal} title={`عملیات برای: ${modal.data?.option_symbol}`}>
        <div className="flex flex-col space-y-3 p-2">
          {modal.data?.status === "OPEN" ? (
            <>
              <Button
                variant="outline"
                onClick={() => openModal("manage", modal.data)}
                icon={<CheckCircle size={18} />}
              >
                بستن / مدیریت پوزیشن
              </Button>
              <Button
                variant="outline"
                onClick={() => openModal("edit", modal.data)}
                icon={<Edit size={18} />}
              >
                ویرایش معامله اولیه
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
            variant="danger"
            onClick={() => handleDeletePosition(modal.data)}
            icon={<Trash2 size={18} />}
          >
            حذف معامله
          </Button>
        </div>
      </Modal>
    </div>
  );
}