import { useState, useMemo, useCallback } from "react";
import useStockTradesStore from "../store/useStockTradesStore";
import usePriceHistoryStore from "../../../shared/store/usePriceHistoryStore";
import { processPortfolio } from "../utils/portfolioCalculator.js";
import { getMasterColumnDefs, getClosedColumnDefs, getDetailColumnDefs } from "../utils/portfolioTableConfig.jsx";
import { showConfirmAlert } from "../../../shared/utils/notifications";
import { formatCurrency, formatDisplayNumber } from "../../../shared/utils/formatters";
import AgGridTable from "../../../shared/components/ui/AgGridTable";
import Modal from "../../../shared/components/ui/Modal";
import AddActionModal from "../components/AddActionModal";
import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";
import { PlusCircle, Wallet, TrendingUp, TrendingDown, DollarSign, PieChart, BadgePercent, Hash } from "lucide-react";

const DetailStat = ({ icon, title, value, colorClass = "text-content-800" }) => (
  <div className="flex flex-col items-center justify-center rounded-lg bg-content-100/50 p-3 text-center">
    {icon}
    <p className="mt-1 text-xs text-content-600">{title}</p>
    <p className={`mt-1 text-lg font-bold ${colorClass}`}>{value}</p>
  </div>
);

export default function PortfolioPage() {
  const { actions, deleteAction, isLoading: isActionsLoading } = useStockTradesStore();
  const { priceHistory } = usePriceHistoryStore();

  const [activeTab, setActiveTab] = useState("open");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  const [detailData, setDetailData] = useState(null); 

  const { openPositions, closedPositions } = useMemo(() => {
    const latestPricesForCalculator = Array.from(priceHistory.values());
    return processPortfolio(actions, latestPricesForCalculator);
  }, [actions, priceHistory]);

  const portfolioMetrics = useMemo(() => {
    const totalCurrentValue = openPositions.reduce((sum, pos) => sum + pos.currentValue, 0);
    const totalUnrealizedPL = openPositions.reduce((sum, pos) => sum + pos.unrealizedPL, 0);
    const allPositions = [...openPositions, ...closedPositions];
    const totalRealizedReturn = allPositions.reduce((sum, pos) => sum + pos.totalRealizedPL + pos.totalDividend, 0);
    return { totalCurrentValue, totalUnrealizedPL, totalRealizedReturn };
  }, [openPositions, closedPositions]);

  const handleOpenAddModal = useCallback(() => {
    setEditingAction(null);
    setIsAddModalOpen(true);
  }, []);

  const handleCloseAddModal = useCallback(() => {
    setIsAddModalOpen(false);
    setEditingAction(null);
  }, []);

  const handleOpenDetailModal = useCallback((summaryRowData) => {
    setDetailData(summaryRowData);
    setIsDetailModalOpen(true);
  }, []);
  
  const handleCloseDetailModal = useCallback(() => setIsDetailModalOpen(false), []);

  const handleEditAction = useCallback((action) => {
    setIsDetailModalOpen(false);
    setTimeout(() => {
      setEditingAction(action);
      setIsAddModalOpen(true);
    }, 150);
  }, []);

  const handleDeleteAction = useCallback(async (id) => {
    const confirmed = await showConfirmAlert("حذف رویداد", "آیا از حذف این رویداد مطمئن هستید؟");
    if (confirmed) {
      const success = await deleteAction(id);
      if (success) {
        const deletedAction = actions.find(a => a.id === id);
        if (deletedAction && detailData && deletedAction.symbol === detailData.symbol) {
            const latestPricesForCalculator = Array.from(priceHistory.values());
            const { openPositions, closedPositions } = processPortfolio(actions.filter(a => a.id !== id), latestPricesForCalculator);
            const updatedPositionData = [...openPositions, ...closedPositions].find(p => p.symbol === deletedAction.symbol);
            if(updatedPositionData) {
                setDetailData(updatedPositionData);
            } else {
                handleCloseDetailModal();
            }
        }
      }
    }
  }, [deleteAction, actions, detailData, handleCloseDetailModal, priceHistory]);

  const masterColumnDefs = useMemo(() => getMasterColumnDefs(handleOpenDetailModal), [handleOpenDetailModal]);
  const closedColumnDefs = useMemo(() => getClosedColumnDefs(handleOpenDetailModal), [handleOpenDetailModal]);
  const detailColumnDefs = useMemo(() => getDetailColumnDefs(handleEditAction, handleDeleteAction), [handleEditAction, handleDeleteAction]);

  const tabButtonClasses = "px-4 py-2 text-sm font-medium transition-colors border-b-2";
  const activeTabClasses = "border-primary-500 text-primary-600";
  const inactiveTabClasses = "border-transparent text-content-500 hover:text-content-700";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-2xl font-bold text-content-800">پورتفوی جامع سهام</h1>
        <Button variant="primary" onClick={handleOpenAddModal} icon={<PlusCircle size={20} />}>
          ثبت رویداد جدید
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card title="ارزش لحظه‌ای پورتفوی" amount={portfolioMetrics.totalCurrentValue} color="primary" icon={<Wallet size={24} />} />
        <Card title="سود/زیان محقق نشده" amount={portfolioMetrics.totalUnrealizedPL} color={portfolioMetrics.totalUnrealizedPL >= 0 ? "success" : "danger"} icon={portfolioMetrics.totalUnrealizedPL >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />} />
        <Card title="بازده محقق شده" amount={portfolioMetrics.totalRealizedReturn} color={portfolioMetrics.totalRealizedReturn >= 0 ? "success" : "danger"} icon={<DollarSign size={24} />} />
      </div>

      <div className="border-b border-content-200">
        <nav className="-mb-px flex space-x-4 rtl:space-x-reverse" aria-label="Tabs">
          <button onClick={() => setActiveTab("open")} className={`${tabButtonClasses} ${activeTab === 'open' ? activeTabClasses : inactiveTabClasses}`}>پوزیشن‌های باز ({openPositions.length})</button>
          <button onClick={() => setActiveTab("closed")} className={`${tabButtonClasses} ${activeTab === 'closed' ? activeTabClasses : inactiveTabClasses}`}>تاریخچه ({closedPositions.length})</button>
        </nav>
      </div>

      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <AgGridTable
          rowData={activeTab === "open" ? openPositions : closedPositions}
          columnDefs={activeTab === "open" ? masterColumnDefs : closedColumnDefs}
          isLoading={isActionsLoading}
        />
      </div>
      
      <Modal 
        isOpen={isAddModalOpen} 
        onClose={handleCloseAddModal} 
        title={editingAction ? "ویرایش رویداد" : "ثبت رویداد جدید"}
        isLoading={isActionsLoading}
      >
        <AddActionModal
          onSubmitSuccess={handleCloseAddModal}
          initialData={editingAction}
          isEditMode={!!editingAction}
          portfolioPositions={openPositions}
        />
      </Modal>
      
      {detailData && (
        <Modal isOpen={isDetailModalOpen} onClose={handleCloseDetailModal} title={`تاریخچه و تحلیل نماد: ${detailData.symbol}`} className="max-w-4xl">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 border-b border-content-200 pb-6">
                <DetailStat
                    icon={<DollarSign size={24} className="text-primary-600" />}
                    title="سود/زیان نهایی"
                    value={formatCurrency(detailData.totalPL)}
                    colorClass={detailData.totalPL >= 0 ? "text-success-600" : "text-danger-600"}
                />
                <DetailStat
                    icon={<BadgePercent size={24} className="text-primary-600" />}
                    title="٪ بازده نهایی"
                    value={formatDisplayNumber(detailData.percentagePL, 2, "%")}
                    colorClass={detailData.percentagePL >= 0 ? "text-success-600" : "text-danger-600"}
                />
                 <DetailStat
                    icon={<PieChart size={24} className="text-content-500" />}
                    title="ارزش روز دارایی"
                    value={formatCurrency(detailData.currentValue)}
                />
                 <DetailStat
                    icon={<Hash size={24} className="text-content-500" />}
                    title="تعداد فعلی"
                    value={formatDisplayNumber(detailData.remainingQty, 0)}
                />
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
                <AgGridTable rowData={detailData.detailData} columnDefs={detailColumnDefs} domLayout="autoHeight" />
            </div>
        </Modal>
      )}
    </div>
  );
}