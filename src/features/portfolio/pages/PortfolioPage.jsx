import { useState, useMemo, useCallback, useEffect } from "react";
import useStockTradesStore from "../store/useStockTradesStore";
import usePriceHistoryStore from "../../../shared/store/usePriceHistoryStore";
import { processPortfolio } from "../utils/portfolioCalculator.js";
import AgGridTable from "../../../shared/components/ui/AgGridTable";
import Modal from "../../../shared/components/ui/Modal";
import AddActionModal from "../components/AddActionModal";
import Button from "../../../shared/components/ui/Button";
import {
  getMasterColumnDefs,
  getDetailColumnDefs,
} from "../utils/portfolioTableConfig.jsx";
import {
  PlusCircle,
  Wallet,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import Card from "../../../shared/components/ui/Card";
import { showConfirmAlert } from "../../../shared/utils/notifications";

export default function PortfolioPage() {
  const { actions, fetchActions } = useStockTradesStore();
  const { priceHistory } = usePriceHistoryStore();

  const [activeTab, setActiveTab] = useState("open");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  // خط زیر را اصلاح می‌کنیم:
  const [isEditActionModalOpen, setIsEditActionModalOpen] = useState(false); // نام اصلی را برگرداندیم
  const [editingAction, setEditingAction] = useState(null);
  const [detailData, setDetailData] = useState({ symbol: "", trades: [] });

  useEffect(() => {
    fetchActions();
  }, [fetchActions]);

  const { openPositions, closedPositions } = useMemo(() => {
    const latestPricesForCalculator = Array.from(priceHistory.entries()).map(
      ([symbol, data]) => ({
        l18: symbol,
        pl: data.price,
      })
    );
    return processPortfolio(actions, latestPricesForCalculator);
  }, [actions, priceHistory]);

  const handleOpenAddModal = useCallback(() => {
    setEditingAction(null);
    setIsEditActionModalOpen(false); // اینجا هم از نام اصلی استفاده می‌کنیم
    setIsAddModalOpen(true);
  }, []);

  const handleCloseAddModal = useCallback(() => setIsAddModalOpen(false), []);

  const handleOpenDetailModal = useCallback((summaryRowData) => {
    setDetailData({
      symbol: summaryRowData.symbol,
      trades: summaryRowData.detailData,
    });
    setIsDetailModalOpen(true);
  }, []);

  const handleCloseDetailModal = useCallback(
    () => setIsDetailModalOpen(false),
    []
  );

  const handleEditAction = useCallback((action) => {
    setEditingAction(action);
    setIsEditActionModalOpen(true); // اینجا هم از نام اصلی استفاده می‌کنیم
  }, []);

  const handleCloseEditActionModal = useCallback(() => {
    setIsEditActionModalOpen(false); // اینجا هم از نام اصلی استفاده می‌کنیم
    setEditingAction(null);
    fetchActions();
    handleCloseDetailModal();
  }, [fetchActions, handleCloseDetailModal]);

  const handleDeleteAction = useCallback(
    async (id) => {
      const confirmed = await showConfirmAlert(
        "حذف رویداد",
        "آیا از حذف این رویداد مطمئن هستید؟ این عمل غیرقابل بازگشت است."
      );
      if (confirmed) {
        const { deleteAction } = useStockTradesStore.getState();
        const success = await deleteAction(id);
        if (success) {
          fetchActions();
          handleCloseDetailModal();
        }
      }
    },
    [fetchActions, handleCloseDetailModal]
  );

  const portfolioMetrics = useMemo(() => {
    const allPositions = [...openPositions, ...closedPositions];
    const totalRealizedReturn = allPositions.reduce(
      (sum, pos) =>
        sum +
        (pos.totalRealizedPL || 0) +
        (pos.totalDividend || 0) +
        (pos.totalRightsSellRevenue || 0),
      0
    );
    const totalUnrealizedPL = openPositions.reduce(
      (sum, pos) => sum + (pos.unrealizedPL || 0),
      0
    );
    const totalCurrentValue = openPositions.reduce(
      (sum, pos) => sum + (pos.currentValue || 0),
      0
    );
    return {
      totalRealizedReturn,
      totalUnrealizedPL,
      totalCurrentValue,
    };
  }, [openPositions, closedPositions]);

  const masterColumnDefs = useMemo(
    () => getMasterColumnDefs(handleOpenDetailModal),
    [handleOpenDetailModal]
  );

  const detailColumnDefs = useMemo(
    () => getDetailColumnDefs(handleEditAction, handleDeleteAction),
    [handleEditAction, handleDeleteAction]
  );

  const tabButtonClasses =
    "px-4 py-2 text-sm font-medium transition-colors border-b-2";
  const activeTabClasses = "border-primary-500 text-primary-600";
  const inactiveTabClasses =
    "border-transparent text-content-500 hover:text-content-700";

  return (
    <div className="p-4 sm:p-6 space-y-6 max-w-screen-2xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card
          color="primary"
          title="ارزش لحظه‌ای پورتفوی"
          amount={portfolioMetrics.totalCurrentValue}
          icon={<Wallet size={24} className="text-primary-600" />}
        />
        <Card
          color={portfolioMetrics.totalUnrealizedPL >= 0 ? "success" : "danger"}
          title="سود/زیان محقق نشده"
          amount={portfolioMetrics.totalUnrealizedPL}
          icon={
            portfolioMetrics.totalUnrealizedPL >= 0 ? (
              <TrendingUp size={24} className="text-success-600" />
            ) : (
              <TrendingDown size={24} className="text-danger-600" />
            )
          }
        />
        <Card
          color={
            portfolioMetrics.totalRealizedReturn >= 0 ? "success" : "danger"
          }
          title="بازده محقق شده (فروش + مجمع + حق تقدم)"
          amount={portfolioMetrics.totalRealizedReturn}
          icon={
            <DollarSign
              size={24}
              className={
                portfolioMetrics.totalRealizedReturn >= 0
                  ? "text-success-600"
                  : "text-danger-600"
              }
            />
          }
        />
      </div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-content-800">
          پورتفوی جامع سهام
        </h1>
        <Button
          variant="primary"
          onClick={handleOpenAddModal}
          icon={<PlusCircle size={20} />}>
          ثبت رویداد جدید
        </Button>
      </div>

      <div className="border-b border-content-200">
        <nav
          className="-mb-px flex space-x-4 rtl:space-x-reverse"
          aria-label="Tabs">
          <button
            onClick={() => setActiveTab("open")}
            className={cn(
              tabButtonClasses,
              activeTab === "open" ? activeTabClasses : inactiveTabClasses
            )}>
            پوزیشن‌های باز ({openPositions.length})
          </button>
          <button
            onClick={() => setActiveTab("closed")}
            className={cn(
              tabButtonClasses,
              activeTab === "closed" ? activeTabClasses : inactiveTabClasses
            )}>
            تاریخچه ({closedPositions.length})
          </button>
        </nav>
      </div>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <AgGridTable
          rowData={activeTab === "open" ? openPositions : closedPositions}
          columnDefs={masterColumnDefs}
          domLayout="autoHeight"
        />
      </div>
      <Modal
        isOpen={isAddModalOpen}
        onClose={handleCloseAddModal}
        title="ثبت رویداد جدید پورتفوی">
        <AddActionModal
          onSubmitSuccess={handleCloseAddModal}
          portfolioPositions={openPositions}
          isEditMode={false}
          initialData={null}
        />
      </Modal>
      <Modal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        title={`تاریخچه رویدادهای نماد: ${detailData.symbol}`}>
        <div className="max-h-[60vh] overflow-y-auto">
          <AgGridTable
            rowData={detailData.trades}
            columnDefs={detailColumnDefs}
            domLayout="autoHeight"
          />
        </div>
      </Modal>
      {/* مودال ویرایش رویداد خاص */}
      <Modal
        isOpen={isEditActionModalOpen} // اینجا هم از نام اصلی استفاده می‌کنیم
        onClose={handleCloseEditActionModal}
        title={`ویرایش رویداد: ${editingAction?.symbol} (${
          editingAction?.type === "buy"
            ? "خرید"
            : editingAction?.type === "sell"
            ? "فروش"
            : editingAction?.type === "dividend"
            ? "سود نقدی"
            : editingAction?.type === "bonus"
            ? "سهام جایزه"
            : editingAction?.type === "rights_exercise"
            ? "استفاده از حق"
            : editingAction?.type === "rights_sell"
            ? "فروش حق"
            : editingAction?.type === "revaluation"
            ? "تجدید ارزیابی"
            : editingAction?.type === "premium"
            ? "صرف سهام"
            : editingAction?.type
        })`}>
        <AddActionModal
          onSubmitSuccess={handleCloseEditActionModal}
          initialData={editingAction}
          isEditMode={true}
          portfolioPositions={openPositions}
        />
      </Modal>
    </div>
  );
}
