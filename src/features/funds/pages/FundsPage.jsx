import { useMemo } from "react";
import { useFundTradesLogic } from "../hooks/useFundTradesLogic";
import { getOpenPositionsColumnDefs, getClosedPositionsColumnDefs, getDetailColumnDefs } from "../utils/fundTableConfig";
import AgGridTable from "../../../shared/components/ui/AgGridTable";
import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";
import FundTradeForm from "../components/FundTradeForm";
import { PlusCircle, Wallet, ShoppingCart, TrendingUp, DollarSign, PieChart, BadgePercent, Hash } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import { formatCurrency, formatDisplayNumber } from "../../../shared/utils/formatters";

const DetailStat = ({ icon, title, value, colorClass = "text-content-800" }) => (
  <div className="flex flex-col items-center justify-center rounded-lg bg-content-100/50 p-3 text-center">
    {icon}
    <p className="mt-1 text-xs text-content-600">{title}</p>
    <p className={`mt-1 text-lg font-bold ${colorClass}`}>{value}</p>
  </div>
);

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
    (trade) => {
      closeModal();
      setTimeout(() => openModal('edit', trade), 150);
    },
    handleDeleteTrade
  ), [openModal, closeModal, handleDeleteTrade]);

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-content-800">مدیریت صندوق‌های سرمایه‌گذاری</h1>
        <Button variant="primary" onClick={() => openModal("add")} icon={<PlusCircle size={20} />}>ثبت معامله جدید</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
      
      {modal.data && (
        <Modal isOpen={modal.type === "details"} onClose={closeModal} title={`تاریخچه معاملات: ${modal.data?.symbol}`} className="max-w-4xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 border-b border-content-200 pb-6">
                <DetailStat
                    icon={<DollarSign size={24} className="text-primary-600" />}
                    title="سود/زیان نهایی"
                    value={formatCurrency(modal.data.totalPL)}
                    colorClass={modal.data.totalPL >= 0 ? "text-success-600" : "text-danger-600"}
                />
                <DetailStat
                    icon={<BadgePercent size={24} className="text-primary-600" />}
                    title="٪ بازده نهایی"
                    value={formatDisplayNumber(modal.data.percentagePL, 2, "%")}
                    colorClass={modal.data.percentagePL >= 0 ? "text-success-600" : "text-danger-600"}
                />
                 <DetailStat
                    icon={<PieChart size={24} className="text-content-500" />}
                    title="ارزش روز دارایی"
                    value={formatCurrency(modal.data.currentValue)}
                />
                 <DetailStat
                    icon={<Hash size={24} className="text-content-500" />}
                    title="تعداد واحد فعلی"
                    value={formatDisplayNumber(modal.data.remainingQty, 0)}
                />
            </div>
            <div className="max-h-[60vh] overflow-y-auto">
                <AgGridTable rowData={modal.data?.detailData || []} columnDefs={detailColumnDefs} domLayout="autoHeight" />
            </div>
        </Modal>
      )}
    </div>
  );
}