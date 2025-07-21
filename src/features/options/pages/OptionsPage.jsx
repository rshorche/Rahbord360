import { useMemo, useCallback } from "react";
import { useOptionsLogic } from "../hooks/useOptionsLogic";
import { getOpenOptionsColumnDefs, getHistoryOptionsColumnDefs } from "../utils/optionsTableConfig";
import AgGridTable from "../../../shared/components/ui/AgGridTable";
import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";
import OptionsForm from "../components/OptionsForm";
import ManageOptionForm from "../components/ManageOptionForm";
import { PlusCircle, Edit, Trash2, CheckSquare, ShoppingCart, TrendingUp, Wallet, History, RotateCcw, DollarSign, PieChart, BadgePercent, Hash } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { formatCurrency, formatDisplayNumber } from "../../../shared/utils/formatters";

const tradeTypeMap = {
    'buy_to_open': 'خرید برای باز کردن',
    'sell_to_open': 'فروش برای باز کردن',
    'buy_to_close': 'خرید برای بستن',
    'sell_to_close': 'فروش برای بستن',
};

const OpenTradeActions = ({ onEdit, onDelete }) => (
  <div className="flex items-center justify-center h-full space-x-1 rtl:space-x-reverse">
    <Button variant="ghost" size="icon" onClick={onEdit} title="ویرایش" className="h-8 w-8 shadow-none text-primary-600 hover:bg-primary-100">
      <Edit size={16} />
    </Button>
    <Button variant="ghost" size="icon" onClick={onDelete} title="حذف" className="h-8 w-8 shadow-none text-danger-600 hover:bg-danger-100">
      <Trash2 size={16} />
    </Button>
  </div>
);

const HistoryTradeActions = ({ onReopen, onDelete }) => (
  <div className="flex items-center justify-center h-full space-x-1 rtl:space-x-reverse">
    <Button variant="ghost" size="icon" onClick={onReopen} title="بازنشانی" className="h-8 w-8 shadow-none text-success-600 hover:bg-success-100">
      <RotateCcw size={16} />
    </Button>
    <Button variant="ghost" size="icon" onClick={onDelete} title="حذف" className="h-8 w-8 shadow-none text-danger-600 hover:bg-danger-100">
      <Trash2 size={16} />
    </Button>
  </div>
);

const DetailStat = ({ icon, title, value, colorClass = "text-content-800" }) => (
    <div className="flex flex-col items-center justify-center rounded-lg bg-content-100/50 p-3 text-center">
      {icon}
      <p className="mt-1 text-xs text-content-600">{title}</p>
      <p className={`mt-1 text-lg font-bold ${colorClass}`}>{value}</p>
    </div>
);

export default function OptionsPage() {
  const {
    isLoading,
    activeTab,
    setActiveTab,
    openPositions,
    historyPositions,
    summaryMetrics,
    modal,
    openModal,
    closeModal,
    handleAddSubmit,
    handleEditSubmit,
    handleManageSubmit,
    handleDeleteAllForSymbol,
    handleReopenPosition,
    handleDeleteSingleTrade,
  } = useOptionsLogic();

  const openColumnDefs = useMemo(() => getOpenOptionsColumnDefs(position => openModal("actions", position)), [openModal]);
  const historyColumnDefs = useMemo(() => getHistoryOptionsColumnDefs(trade => openModal("history-details", trade)), [openModal]);
  
  const getDetailColumnDefs = useCallback(() => [
      { headerName: 'نوع معامله', field: 'trade_type', width: 150, valueFormatter: (p) => tradeTypeMap[p.value] || p.value },
      { headerName: 'تعداد قرارداد', field: 'contracts_count', width: 130, valueFormatter: (p) => p.value ? p.value.toLocaleString('fa-IR') : '-' },
      { headerName: 'پرمیوم', field: 'premium', width: 120, valueFormatter: (p) => p.value ? p.value.toLocaleString('fa-IR') : '-' },
      { headerName: 'تاریخ', field: 'trade_date', width: 130, valueFormatter: (p) => p.value ? new DateObject({ date: new Date(p.value), calendar: persian, locale: persian_fa }).format("YYYY/MM/DD") : '-' },
      { headerName: 'یادداشت', field: 'notes', flex: 1 },
      { 
        headerName: 'عملیات',
        width: 100,
        cellRenderer: (params) => <OpenTradeActions onEdit={() => openModal('edit', params.data)} onDelete={() => handleDeleteSingleTrade(params.data.id)} />
      }
  ], [openModal, handleDeleteSingleTrade]);
  
  const getHistoryDetailColumnDefs = useCallback(() => [
      { headerName: 'نوع معامله', field: 'trade_type', width: 150, valueFormatter: (p) => tradeTypeMap[p.value] || p.value },
      { headerName: 'تعداد قرارداد', field: 'contracts_count', width: 130, valueFormatter: (p) => p.value ? p.value.toLocaleString('fa-IR') : '-' },
      { headerName: 'وضعیت', field: 'status', width: 120 },
      { headerName: 'تاریخ', field: 'trade_date', width: 130, valueFormatter: (p) => p.value ? new DateObject({ date: new Date(p.value), calendar: persian, locale: persian_fa }).format("YYYY/MM/DD") : '-' },
      { 
        headerName: 'عملیات',
        width: 100,
        cellRenderer: (params) => <HistoryTradeActions onReopen={() => handleReopenPosition(params.data)} onDelete={() => handleDeleteSingleTrade(params.data.id)} />
      }
  ], [handleReopenPosition, handleDeleteSingleTrade]);

  const handleOpenClosePositionModal = () => {
    if (!modal.data) return;
    const position = modal.data;
    const closingTradeType = position.position_type === 'Long' ? 'sell_to_close' : 'buy_to_close';
    const newTradeData = { ...position, trade_type: closingTradeType, notes: `بستن پوزیشن ${position.option_symbol}`, contracts_count: Math.abs(position.contracts_count) };
    openModal('add', newTradeData);
  };

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-content-800">مدیریت معاملات اختیار</h1>
        <Button variant="primary" onClick={() => openModal("add")} icon={<PlusCircle size={20} />}>ثبت معامله جدید</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <Card title="ارزش کل آپشن‌ها (باز)" amount={summaryMetrics.totalCurrentValue} color="primary" icon={<Wallet size={24} />}/>
        <Card title="هزینه کل (باز)" amount={summaryMetrics.totalCostBasis} color="default" icon={<ShoppingCart size={24} />}/>
        <Card title="سود/زیان باز" amount={summaryMetrics.totalUnrealizedPL} color={summaryMetrics.totalUnrealizedPL >= 0 ? "success" : "danger"} icon={<TrendingUp size={24} />}/>
      </div>

      <div className="border-b border-content-200">
        <nav className="-mb-px flex space-x-4 rtl:space-x-reverse" aria-label="Tabs">
          <button onClick={() => setActiveTab("open")} className={cn("px-4 py-2 text-sm font-medium transition-colors border-b-2", activeTab === "open" ? "border-primary-500 text-primary-600" : "border-transparent text-content-500 hover:text-content-700")}>پوزیشن‌های باز ({openPositions.length})</button>
          <button onClick={() => setActiveTab("history")} className={cn("px-4 py-2 text-sm font-medium transition-colors border-b-2", activeTab === "history" ? "border-primary-500 text-primary-600" : "border-transparent text-content-500 hover:text-content-700")}>تاریخچه ({historyPositions.length})</button>
        </nav>
      </div>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <AgGridTable rowData={activeTab === "open" ? openPositions : historyPositions} columnDefs={activeTab === 'open' ? openColumnDefs : historyColumnDefs} isLoading={isLoading}/>
      </div>

      <Modal isOpen={modal.type === "add" || modal.type === "edit"} onClose={closeModal} title={modal.type === 'edit' ? "ویرایش معامله" : "ثبت معامله جدید"}>
        <OptionsForm onSubmit={modal.type === 'edit' ? handleEditSubmit : handleAddSubmit} isLoading={isLoading} isEditMode={modal.type === 'edit'} initialData={modal.data}/>
      </Modal>
      <Modal isOpen={modal.type === "manage"} onClose={closeModal} title={`مدیریت پوزیشن: ${modal.data?.option_symbol}`}>
        <ManageOptionForm position={modal.data} onSubmit={handleManageSubmit} isLoading={isLoading} />
      </Modal>
      
      <Modal isOpen={modal.type === "actions"} onClose={closeModal} title={`عملیات برای: ${modal.data?.option_symbol}`}>
        <div className="flex flex-col space-y-3 p-2">
            <Button variant="outline" onClick={handleOpenClosePositionModal} icon={<ShoppingCart size={18} />}>بستن پوزیشن</Button>
            <Button variant="outline" onClick={() => openModal("manage", modal.data)} icon={<CheckSquare size={18} />}>اعمال / منقضی کردن</Button>
            <Button variant="outline" onClick={() => openModal('details', modal.data)} icon={<History size={18} />}>مشاهده تاریخچه معاملات</Button>
            <Button variant="danger" onClick={() => handleDeleteAllForSymbol(modal.data.option_symbol)} icon={<Trash2 size={18} />}>حذف کلی پوزیشن</Button>
        </div>
      </Modal>

      {modal.data && (
        <>
            <Modal isOpen={modal.type === "details"} onClose={closeModal} title={`تاریخچه معاملات: ${modal.data?.option_symbol}`} className="max-w-4xl">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 border-b border-content-200 pb-6">
                    <DetailStat
                        icon={<TrendingUp size={24} className="text-primary-600" />}
                        title="سود/زیان باز"
                        value={formatCurrency(modal.data.unrealized_pl)}
                        colorClass={modal.data.unrealized_pl >= 0 ? "text-success-600" : "text-danger-600"}
                    />
                    <DetailStat
                        icon={<DollarSign size={24} className="text-primary-600" />}
                        title="سود/زیان محقق شده"
                        value={formatCurrency(modal.data.realized_pl)}
                        colorClass={modal.data.realized_pl >= 0 ? "text-success-600" : "text-danger-600"}
                    />
                    <DetailStat
                        icon={<Wallet size={24} className="text-content-500" />}
                        title="هزینه کل"
                        value={formatCurrency(modal.data.cost_basis)}
                    />
                    <DetailStat
                        icon={<Hash size={24} className="text-content-500" />}
                        title="تعداد قرارداد خالص"
                        value={formatDisplayNumber(modal.data.contracts_count, 0)}
                    />
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                    <AgGridTable rowData={modal.data?.history || []} columnDefs={getDetailColumnDefs()} domLayout="autoHeight" />
                </div>
            </Modal>
            
            <Modal isOpen={modal.type === "history-details"} onClose={closeModal} title={`تاریخچه معاملات: ${modal.data?.option_symbol}`} className="max-w-4xl">
                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6 border-b border-content-200 pb-6">
                    <DetailStat
                        icon={<DollarSign size={24} className="text-primary-600" />}
                        title="سود/زیان محقق شده"
                        value={formatCurrency(modal.data.realized_pl)}
                        colorClass={modal.data.realized_pl >= 0 ? "text-success-600" : "text-danger-600"}
                    />
                </div>
                <div className="max-h-[60vh] overflow-y-auto">
                    <AgGridTable rowData={modal.data?.history || []} columnDefs={getHistoryDetailColumnDefs()} domLayout="autoHeight" />
                </div>
            </Modal>
        </>
      )}
    </div>
  );
}