import { useMemo } from "react";
import { useFundTradesLogic } from "../hooks/useFundTradesLogic";
import { getOpenPositionsColumnDefs, getClosedPositionsColumnDefs, getDetailColumnDefs } from "../utils/fundTableConfig";
import AgGridTable from "../../../shared/components/ui/AgGridTable";
import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";
import FundTradeForm from "../components/FundTradeForm";
import { PlusCircle, Wallet, ShoppingCart, TrendingUp } from "lucide-react";
import { cn } from "../../../shared/utils/cn";

export default function FundsPage() {
  const {
    isLoading,
    activeTab,
    setActiveTab,
    openPositions,
    closedPositions,
    summaryMetrics,
    modal,
    openModal,
    closeModal,
    handleAddSubmit,
    handleEditSubmit,
    handleDeleteTrade,
  } = useFundTradesLogic();

  const openColumnDefs = useMemo(() => getOpenPositionsColumnDefs(position => openModal("details", position)), [openModal]);
  const closedColumnDefs = useMemo(() => getClosedPositionsColumnDefs(position => openModal("details", position)), [openModal]);
  const detailColumnDefs = useMemo(() => getDetailColumnDefs(
    (trade) => openModal('edit', trade),
    handleDeleteTrade
  ), [openModal, handleDeleteTrade]);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-content-800">مدیریت صندوق‌های سرمایه‌گذاری</h1>
        <Button variant="primary" onClick={() => openModal("add")} icon={<PlusCircle size={20} />}>ثبت معامله جدید</Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card title="ارزش کل صندوق‌ها" amount={summaryMetrics.totalValue} color="primary" icon={<Wallet size={24} />}/>
        <Card title="هزینه کل خرید" amount={summaryMetrics.totalCost} color="default" icon={<ShoppingCart size={24} />}/>
        <Card title="سود/زیان باز" amount={summaryMetrics.totalUnrealizedPL} color={summaryMetrics.totalUnrealizedPL >= 0 ? "success" : "danger"} icon={<TrendingUp size={24} />}/>
      </div>

      <div className="border-b border-content-200">
        <nav className="-mb-px flex space-x-4 rtl:space-x-reverse" aria-label="Tabs">
          <button onClick={() => setActiveTab("open")} className={cn("px-4 py-2 text-sm font-medium transition-colors border-b-2", activeTab === "open" ? "border-primary-500 text-primary-600" : "border-transparent text-content-500 hover:text-content-700")}>پوزیشن‌های باز ({openPositions.length})</button>
          <button onClick={() => setActiveTab("history")} className={cn("px-4 py-2 text-sm font-medium transition-colors border-b-2", activeTab === "history" ? "border-primary-500 text-primary-600" : "border-transparent text-content-500 hover:text-content-700")}>پوزیشن‌های بسته ({closedPositions.length})</button>
        </nav>
      </div>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <AgGridTable rowData={activeTab === "open" ? openPositions : closedPositions} columnDefs={activeTab === 'open' ? openColumnDefs : closedColumnDefs} isLoading={isLoading}/>
      </div>

      <Modal isOpen={modal.type === "add" || modal.type === "edit"} onClose={closeModal} title={modal.type === 'edit' ? "ویرایش معامله" : "ثبت معامله جدید"}>
        <FundTradeForm onSubmit={modal.type === 'edit' ? handleEditSubmit : handleAddSubmit} isLoading={isLoading} isEditMode={modal.type === 'edit'} initialData={modal.data}/>
      </Modal>
      
      <Modal isOpen={modal.type === "details"} onClose={closeModal} title={`تاریخچه معاملات: ${modal.data?.symbol}`} className="max-w-4xl">
        <div className="max-h-[70vh] overflow-y-auto">
          <AgGridTable rowData={modal.data?.detailData || []} columnDefs={detailColumnDefs} domLayout="autoHeight" />
        </div>
      </Modal>
    </div>
  );
}