import { useMemo, useState, useCallback } from "react";
import { useOptionsLogic } from "../hooks/useOptionsLogic";
import { getOpenOptionsColumnDefs, getHistoryOptionsColumnDefs } from "../utils/optionsTableConfig";
import AgGridTable from "../../../shared/components/ui/AgGridTable";
import Modal from "../../../shared/components/ui/Modal";
import Button from "../../../shared/components/ui/Button";
import Card from "../../../shared/components/ui/Card";
import OptionsForm from "../components/OptionsForm";
import ManageOptionForm from "../components/ManageOptionForm";
import { PlusCircle, Edit, Trash2, CheckSquare, ShoppingCart, TrendingUp, Wallet, History, RotateCcw, DollarSign, PieChart, BadgePercent, Hash, ExternalLink, RefreshCw } from "lucide-react";
import { cn } from "../../../shared/utils/cn";
import { DateObject } from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { formatCurrency } from "../../../shared/utils/formatters";
import { processOptionsPositions } from "../utils/optionsCalculations";

const tradeTypeMap = {
    'buy_to_open': 'خرید برای باز کردن',
    'sell_to_open': 'فروش برای باز کردن',
    'buy_to_close': 'خرید برای بستن',
    'sell_to_close': 'فروش برای بستن',
};

const statusMap = {
    'EXERCISED': 'اعمال شده',
    'EXPIRED': 'منقضی شده'
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

const getUnifiedDetailsColumnDefs = (onEdit, onDelete, onReopen, isPositionOpen) => [
    { headerName: 'نوع معامله', field: 'trade_type', width: 160, valueFormatter: (p) => tradeTypeMap[p.value] || p.value },
    { headerName: 'تاریخ', field: 'trade_date', width: 120, sort: 'desc', valueFormatter: (p) => p.value ? new DateObject({ date: new Date(p.value), calendar: persian, locale: persian_fa }).format("YYYY/MM/DD") : '-' },
    { headerName: 'تعداد', field: 'contracts_count', width: 100, valueFormatter: (p) => p.value ? p.value.toLocaleString('fa-IR') : '-' },
    { headerName: 'پرمیوم', field: 'premium', width: 110, valueFormatter: (p) => p.value ? formatCurrency(p.value) : '-' },
    { headerName: 'ارزش معامله', width: 140, valueGetter: (p) => (p.data.premium || 0) * (p.data.contracts_count || 0) * 1000, valueFormatter: (p) => formatCurrency(p.value) },
    { headerName: 'سود/زیان محقق شده', field: 'realized_pl_on_close', width: 150, valueFormatter: (p) => p.value != null ? formatCurrency(p.value) : '---', cellClass: (p) => p.value >= 0 ? "text-success-700" : "text-danger-700" },
    { headerName: 'وضعیت', field: 'status', width: 110, valueFormatter: (p) => statusMap[p.value] || (p.data.trade_type.includes('close') ? "بسته" : "باز") },
    { 
      headerName: 'عملیات',
      width: 100,
      cellRenderer: (params) => {
        const isClosingTrade = params.data.trade_type.includes('close');

        if (isPositionOpen) {
            return <OpenTradeActions onEdit={() => onEdit(params.data)} onDelete={() => onDelete(params.data.id)} />;
        }
        
        if (isClosingTrade) {
            return <HistoryTradeActions onReopen={() => onReopen(params.data)} onDelete={() => onDelete(params.data.id)} />;
        }
        
        return null; // No actions for opening trades in a closed position's history
      }
    }
];

export default function OptionsPage() {
  const {
    isLoading: isDataLoading,
    modal,
    openModal,
    closeModal,
    handleAddSubmit,
    handleEditSubmit,
    handleManageSubmit,
    handleDeleteAllForSymbol,
    handleReopenPosition,
    handleDeleteSingleTrade,
    allTrades,
    priceHistory,
  } = useOptionsLogic();

  const [activeTab, setActiveTab] = useState("open");
  const [priceOverrides, setPriceOverrides] = useState({});
  const [manualSymbol, setManualSymbol] = useState("");
  const [manualPrice, setManualPrice] = useState("");

  const modifiedPriceHistory = useMemo(() => {
    const newPriceHistory = new Map(priceHistory);
    for (const [symbol, priceData] of Object.entries(priceOverrides)) {
        newPriceHistory.set(symbol, {
            ...newPriceHistory.get(symbol),
            price: priceData.price,
            timestamp: priceData.timestamp,
        });
    }
    return newPriceHistory;
  }, [priceHistory, priceOverrides]);
  
  const { openPositions, historyPositions } = useMemo(() => {
    if (!allTrades || !modifiedPriceHistory) {
      return { openPositions: [], historyPositions: [] };
    }
    return processOptionsPositions(allTrades, modifiedPriceHistory);
  }, [allTrades, modifiedPriceHistory]);
  
  const summaryMetrics = useMemo(() => {
    if (!openPositions) return { totalCurrentValue: 0, totalCostBasis: 0, totalUnrealizedPL: 0 };
    return openPositions.reduce((acc, pos) => {
      acc.totalCurrentValue += pos.current_value || 0;
      acc.totalCostBasis += pos.cost_basis || 0;
      acc.totalUnrealizedPL += pos.unrealized_pl || 0;
      return acc;
    }, { totalCurrentValue: 0, totalCostBasis: 0, totalUnrealizedPL: 0 });
  }, [openPositions]);


  const handleManualPriceUpdate = (e) => {
    e.preventDefault();
    if (!manualSymbol || isNaN(parseFloat(manualPrice))) return;
    setPriceOverrides(prev => ({
        ...prev,
        [manualSymbol]: {
            price: parseFloat(manualPrice) * 10,
            timestamp: new Date().toISOString(),
        }
    }));
    setManualSymbol("");
    setManualPrice("");
  };

  const openColumnDefs = useMemo(() => getOpenOptionsColumnDefs(position => openModal("actions", position)), [openModal]);
  const historyColumnDefs = useMemo(() => getHistoryOptionsColumnDefs(position => openModal("details", position)), [openModal]);
  
  const detailColumnDefs = useMemo(() => getUnifiedDetailsColumnDefs(
    (trade) => openModal('edit', trade),
    handleDeleteSingleTrade,
    handleReopenPosition,
    modal.data?.status === 'OPEN'
  ), [openModal, handleDeleteSingleTrade, handleReopenPosition, modal.data]);
  
  const handleOpenClosePositionModal = useCallback(() => {
    if (!modal.data) return;
    const position = modal.data;
    const closingTradeType = position.position_type === 'Long' ? 'sell_to_close' : 'buy_to_close';
    const newTradeData = { ...position, trade_type: closingTradeType, notes: `بستن پوزیشن ${position.option_symbol}`, contracts_count: Math.abs(position.contracts_count) };
    closeModal();
    setTimeout(() => openModal('add', newTradeData), 150);
  }, [modal.data, closeModal, openModal]);

  const totalPL = (modal.data?.unrealized_pl || 0) + (modal.data?.realized_pl || 0);

  const openPositionsOptions = useMemo(() => {
    return openPositions.map(p => ({ value: p.option_symbol, label: p.option_symbol }));
  }, [openPositions]);

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
      
     <div className="bg-content-50 border border-content-200 rounded-xl p-4">
  <form onSubmit={handleManualPriceUpdate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 items-end gap-4">
    <div className="sm:col-span-2 lg:col-span-1">
      <h3 className="text-md font-semibold text-content-700 mb-1">به‌روزرسانی دستی قیمت:</h3>
      <p className="text-xs text-content-500 hidden sm:block">قیمت لحظه‌ای را برای محاسبه سود و زیان وارد کنید.</p>
    </div>
    
    <div className="flex-grow">
      <label htmlFor="manual-symbol-select" className="block text-sm font-medium text-content-700 mb-1.5">انتخاب نماد باز</label>
      <select 
        id="manual-symbol-select" 
        value={manualSymbol} 
        onChange={(e) => setManualSymbol(e.target.value)} 
        className="w-full h-11 px-3 border border-content-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm bg-white"
      >
        <option value="">انتخاب کنید...</option>
        {openPositionsOptions.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
    
    <div className="flex-grow">
      <label htmlFor="manual-price-input" className="block text-sm font-medium text-content-700 mb-1.5">پرمیوم لحظه‌ای (تومان)</label>
      <input 
        id="manual-price-input"
        value={manualPrice} 
        onChange={(e) => setManualPrice(e.target.value)} 
        type="number" 
        placeholder="مثلا: ۲۵۰" 
        className="w-full h-11 px-3 border border-content-300 rounded-lg outline-none focus:ring-2 focus:ring-primary-500/50 transition-all text-sm" 
      />
    </div>
    
    <Button 
      type="submit" 
      variant="primary" 
      className="h-11 w-full" 
      icon={<RefreshCw size={18}/>}
    >
      ثبت قیمت
    </Button>
  </form>
</div>

      <div className="border-b border-content-200">
        <nav className="-mb-px flex space-x-4 rtl:space-x-reverse" aria-label="Tabs">
          <button onClick={() => setActiveTab("open")} className={cn("px-4 py-2 text-sm font-medium transition-colors border-b-2", activeTab === "open" ? "border-primary-500 text-primary-600" : "border-transparent text-content-500 hover:text-content-700")}>پوزیشن‌های باز ({openPositions.length})</button>
          <button onClick={() => setActiveTab("history")} className={cn("px-4 py-2 text-sm font-medium transition-colors border-b-2", activeTab === "history" ? "border-primary-500 text-primary-600" : "border-transparent text-content-500 hover:text-content-700")}>تاریخچه ({historyPositions.length})</button>
        </nav>
      </div>
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <AgGridTable rowData={activeTab === "open" ? openPositions : historyPositions} columnDefs={activeTab === 'open' ? openColumnDefs : historyColumnDefs} isLoading={isDataLoading}/>
      </div>

      <Modal isOpen={modal.type === "add" || modal.type === "edit"} onClose={closeModal} title={modal.type === 'edit' ? "ویرایش معامله" : "ثبت معامله جدید"}>
        <OptionsForm onSubmit={modal.type === 'edit' ? handleEditSubmit : handleAddSubmit} isLoading={isDataLoading} isEditMode={modal.type === 'edit'} initialData={modal.data}/>
      </Modal>
      <Modal isOpen={modal.type === "manage"} onClose={closeModal} title={`مدیریت پوزیشن: ${modal.data?.option_symbol}`}>
        <ManageOptionForm position={modal.data} onSubmit={handleManageSubmit} isLoading={isDataLoading} />
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
        <Modal 
            isOpen={modal.type === "details"} 
            onClose={closeModal} 
            title={`تاریخچه معاملات: ${modal.data?.option_symbol}`} 
            className="max-w-4xl"
        >
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
                    icon={<PieChart size={24} className="text-purple-600" />}
                    title="سود/زیان نهایی"
                    value={formatCurrency(totalPL)}
                    colorClass={totalPL >= 0 ? "text-success-600" : "text-danger-600"}
                />
                <DetailStat
                    icon={<Wallet size={24} className="text-content-500" />}
                    title="بهای تمام شده"
                    value={formatCurrency(modal.data.cost_basis)}
                />
            </div>
            <div className="max-h-[50vh] overflow-y-auto">
                <AgGridTable rowData={modal.data?.history || []} columnDefs={detailColumnDefs} domLayout="autoHeight" />
            </div>
            {modal.data.status === 'OPEN' && (
                <div className="flex justify-end pt-4 mt-4 border-t border-content-200">
                    <Button variant="primary" onClick={handleOpenClosePositionModal} icon={<ExternalLink size={18} />}>
                        بستن این پوزیشن
                    </Button>
                </div>
            )}
        </Modal>
      )}
    </div>
  );
}