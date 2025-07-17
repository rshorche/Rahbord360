import { useMemo, useCallback } from "react";
import { useOptionsLogic } from "../hooks/useOptionsLogic";
import { getOpenOptionsColumnDefs, getHistoryOptionsColumnDefs } from "../utils/optionsTableConfig";
import AgGridTable from "../../../shared/components/ui/AgGridTable";
import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";
import OptionsForm from "../components/OptionsForm";
import ManageOptionForm from "../components/ManageOptionForm";
import { PlusCircle, Edit, Trash2, CheckSquare, XCircle, ShoppingCart, TrendingUp, Wallet, History, Eye, RotateCcw } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import { DateObject } from "react-multi-date-picker";

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
      { headerName: 'نوع معامله', field: 'trade_type', width: 150 },
      { headerName: 'تعداد قرارداد', field: 'contracts_count', width: 130 },
      { headerName: 'پرمیوم', field: 'premium', width: 120, valueFormatter: (p) => p.value ? p.value.toLocaleString('fa-IR') : '-' },
      { headerName: 'تاریخ', field: 'trade_date', width: 130, valueFormatter: (p) => p.value ? new DateObject({ date: p.value }).format("YYYY/MM/DD") : '-' },
      { headerName: 'یادداشت', field: 'notes', flex: 1 },
      { 
        headerName: 'عملیات',
        width: 100,
        cellRenderer: (params) => <OpenTradeActions onEdit={() => openModal('edit', params.data)} onDelete={() => handleDeleteSingleTrade(params.data.id)} />
      }
  ], [openModal, handleDeleteSingleTrade]);
  
  const getHistoryDetailColumnDefs = useCallback(() => [
      { headerName: 'نوع معامله', field: 'trade_type', width: 150 },
      { headerName: 'تعداد قرارداد', field: 'contracts_count', width: 130 },
      { headerName: 'وضعیت', field: 'status', width: 120 },
      { headerName: 'تاریخ', field: 'trade_date', width: 130, valueFormatter: (p) => p.value ? new DateObject({ date: p.value }).format("YYYY/MM/DD") : '-' },
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

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
       <Modal isOpen={modal.type === "details"} onClose={closeModal} title={`تاریخچه معاملات: ${modal.data?.option_symbol}`} className="max-w-4xl">
        <div className="max-h-[70vh] overflow-y-auto">
          <AgGridTable rowData={modal.data?.history || []} columnDefs={getDetailColumnDefs()} domLayout="autoHeight" />
        </div>
      </Modal>
      <Modal isOpen={modal.type === "history-details"} onClose={closeModal} title={`تاریخچه معاملات: ${modal.data?.option_symbol}`} className="max-w-4xl">
        <div className="max-h-[70vh] overflow-y-auto">
          <AgGridTable rowData={modal.data?.history || []} columnDefs={getHistoryDetailColumnDefs()} domLayout="autoHeight" />
        </div>
      </Modal>
    </div>
  );
}