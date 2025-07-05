import { useState, useEffect } from "react";
import AddBuySellForm from "./forms/AddBuySellForm";
import AddDividendForm from "./forms/AddDividendForm";
import AddBonusForm from "./forms/AddBonusForm";
import AddRightsForm from "./forms/AddRightsForm";
import AddRevaluationForm from "./forms/AddRevaluationForm";
import AddPremiumForm from "./forms/AddPremiumForm";
import SelectInput from "../../../shared/components/ui/forms/SelectInput";
import { cn } from "../../../shared/utils/cn";

export default function AddActionModal({
  onSubmitSuccess,
  portfolioPositions = [],
  initialData = null,
  isEditMode = false,
}) {
  const [mainTab, setMainTab] = useState("main_trades");
  const [capitalIncreaseType, setCapitalIncreaseType] = useState("dividend");

  useEffect(() => {
    if (isEditMode && initialData) {
      const type = initialData.type;
      if (["buy", "sell"].includes(type)) {
        setMainTab("main_trades");
      } else {
        setMainTab("capital_increase");
        if (type === "rights_exercise" || type === "rights_sell") {
          setCapitalIncreaseType("rights");
        } else {
          setCapitalIncreaseType(type);
        }
      }
    }
  }, [initialData, isEditMode]);

  const renderForm = () => {
    const portfolioSymbols = portfolioPositions.map((p) => p.symbol);
    const formProps = { onSubmitSuccess, portfolioSymbols, initialData, isEditMode };

    if (isEditMode) {
      switch (initialData.type) {
        case 'buy':
        case 'sell':
          return <AddBuySellForm {...formProps} />;
        case 'dividend':
          return <AddDividendForm {...formProps} />;
        case 'bonus':
          return <AddBonusForm {...formProps} />;
        case 'rights_exercise':
        case 'rights_sell':
          return <AddRightsForm {...formProps} />;
        case 'revaluation':
          return <AddRevaluationForm {...formProps} />;
        case 'premium':
          return <AddPremiumForm {...formProps} />;
        default:
          return <p>نوع رویداد برای ویرایش معتبر نیست.</p>;
      }
    }

    if (mainTab === "main_trades") {
      return <AddBuySellForm onSubmitSuccess={onSubmitSuccess} />;
    } 
    
    if (mainTab === "capital_increase") {
      switch (capitalIncreaseType) {
        case "dividend":
          return <AddDividendForm onSubmitSuccess={onSubmitSuccess} portfolioSymbols={portfolioSymbols} />;
        case "bonus":
          return <AddBonusForm onSubmitSuccess={onSubmitSuccess} portfolioSymbols={portfolioSymbols} />;
        case "rights":
          return <AddRightsForm onSubmitSuccess={onSubmitSuccess} portfolioSymbols={portfolioSymbols} />;
        case "revaluation":
          return <AddRevaluationForm onSubmitSuccess={onSubmitSuccess} portfolioSymbols={portfolioSymbols} />;
        case "premium":
          return <AddPremiumForm onSubmitSuccess={onSubmitSuccess} portfolioSymbols={portfolioSymbols} />;
        default:
          return null;
      }
    }
    return null;
  };

  const tabButtonClasses = "px-4 py-2 text-sm font-medium transition-colors focus:outline-none";
  const activeTabClasses = "border-b-2 border-primary-500 text-primary-600";
  const inactiveTabClasses = "text-content-500 hover:text-content-700 border-b-2 border-transparent";

  const capitalIncreaseOptions = [
    { value: "dividend", label: "سود نقدی" },
    { value: "bonus", label: "سهام جایزه" },
    { value: "rights", label: "حق تقدم" },
    { value: "revaluation", label: "تجدید ارزیابی" },
    { value: "premium", label: "صرف سهام" },
  ];

  return (
    <div className="space-y-4">
      <div className="border-b border-content-200">
        <nav className="-mb-px flex space-x-4 rtl:space-x-reverse" aria-label="Tabs">
          {!isEditMode ? (
            <>
              <button onClick={() => setMainTab("main_trades")} className={cn(tabButtonClasses, mainTab === "main_trades" ? activeTabClasses : inactiveTabClasses)}>
                معاملات اصلی
              </button>
              <button onClick={() => setMainTab("capital_increase")} className={cn(tabButtonClasses, mainTab === "capital_increase" ? activeTabClasses : inactiveTabClasses)}>
                افزایش سرمایه و سود
              </button>
            </>
          ) : (
            <span className={cn(tabButtonClasses, activeTabClasses, "cursor-default")}>
              ویرایش رویداد
            </span>
          )}
        </nav>
      </div>
      
      <div className="pt-2 min-h-[350px]">
        {!isEditMode && mainTab === "capital_increase" && (
          <div className="mb-6">
            <SelectInput
              label="نوع رویداد را انتخاب کنید"
              options={capitalIncreaseOptions}
              value={capitalIncreaseType}
              onChange={(e) => setCapitalIncreaseType(e.target.value)}
            />
          </div>
        )}
        {renderForm()}
      </div>
    </div>
  );
}