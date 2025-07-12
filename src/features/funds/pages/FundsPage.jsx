import { useMemo } from "react";
import { useFundTradesLogic } from "../hooks/useFundTradesLogic";
import { getOpenFundPositionsColumnDefs, getHistoryFundTradesColumnDefs } from "../utils/fundTableConfig";
import AgGridTable from "../../../shared/components/ui/AgGridTable";
import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";
import FundTradeForm from "../components/FundTradeForm";
import { PlusCircle, ShoppingCart, DollarSign, Gem } from "lucide-react";
import { cn } from "../../../shared/utils/cn";

export default function FundsPage() {
  const {
    isLoading,
    activeTab,
    setActiveTab,
    openPositions,
    closedPositions,
    summaryMetrics,
    isModalOpen,
    editingTrade,
    isDetailModalOpen,
    detailData,
    openModal,
    closeModal,
    openDetailModal,
    closeDetailModal,
    handleSubmit,
    handleDelete,
    handleEditFromDetail,
  } = useFundTradesLogic();

  const openPositionsColumnDefs = useMemo(
    () => getOpenFundPositionsColumnDefs(openDetailModal),
    [openDetailModal]
  );
  
  const historyTradesColumnDefs = useMemo(
    () => getHistoryFundTradesColumnDefs(openModal, handleDelete),
    [openModal, handleDelete]
  );

  const detailColumnDefs = useMemo(
    () => getHistoryFundTradesColumnDefs(handleEditFromDetail, handleDelete),
    [handleEditFromDetail, handleDelete]
  );

  const tabButtonClasses = "px-4 py-2 text-sm font-medium transition-colors border-b-2";
  const activeTabClasses = "border-primary-500 text-primary-600";
  const inactiveTabClasses = "border-transparent text-content-500 hover:text-content-700";

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-content-800">
          صندوق‌های سرمایه‌گذاری
        </h1>
        <Button
          variant="primary"
          onClick={() => openModal()}
          icon={<PlusCircle size={20} />}
        >
          ثبت معامله جدید
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card
          title="ارزش کل صندوق‌ها"
          amount={summaryMetrics.totalValue}
          color="primary"
          icon={<Gem size={24} />}
        />
        <Card
          title="کل سرمایه‌گذاری"
          amount={summaryMetrics.totalInvestment}
          color="default"
          icon={<ShoppingCart size={24} />}
        />
        <Card
          title="کل سود و زیان"
          amount={summaryMetrics.totalPL}
          color={summaryMetrics.totalPL >= 0 ? "success" : "danger"}
          icon={<DollarSign size={24} />}
        />
      </div>

      <div className="border-b border-content-200">
        <nav className="-mb-px flex space-x-4 rtl:space-x-reverse" aria-label="Tabs">
          <button
            onClick={() => setActiveTab("open")}
            className={cn(tabButtonClasses, activeTab === 'open' ? activeTabClasses : inactiveTabClasses)}
          >
            پوزیشن‌های باز ({openPositions.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={cn(tabButtonClasses, activeTab === 'history' ? activeTabClasses : inactiveTabClasses)}
          >
            تاریخچه معاملات
          </button>
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <AgGridTable
          rowData={activeTab === 'open' ? openPositions : closedPositions.flatMap(p => p.detailData)}
          columnDefs={activeTab === 'open' ? openPositionsColumnDefs : historyTradesColumnDefs}
          isLoading={isLoading}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={closeModal} title={editingTrade ? "ویرایش معامله" : "ثبت معامله جدید"} isLoading={isLoading}>
        <FundTradeForm
          onSubmit={handleSubmit}
          isLoading={isLoading}
          isEditMode={!!editingTrade}
          initialData={editingTrade}
        />
      </Modal>

      <Modal isOpen={isDetailModalOpen} onClose={closeDetailModal} title={`تاریخچه تراکنش‌های: ${detailData.symbol}`} className="max-w-4xl">
        <div className="max-h-[70vh] overflow-y-auto">
          <AgGridTable rowData={detailData.trades} columnDefs={detailColumnDefs} domLayout="autoHeight" />
        </div>
      </Modal>
    </div>
  );
}