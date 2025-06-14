import { useState, useEffect } from "react";
import AddBuySellForm from "./forms/AddBuySellForm";
import AddDividendForm from "./forms/AddDividendForm";
import AddBonusForm from "./forms/AddBonusForm";
import AddRightsForm from "./forms/AddRightsForm";
import AddRevaluationForm from "./forms/AddRevaluationForm";
import AddPremiumForm from "./forms/AddPremiumForm";
import { cn } from "../../../shared/utils/cn";
import SelectInput from "../../../shared/components/ui/forms/SelectInput";

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
    } else {
      setMainTab("main_trades");
      setCapitalIncreaseType("dividend");
    }
  }, [initialData, isEditMode]);

  const renderForm = () => {
    const portfolioSymbols = portfolioPositions.map((p) => p.symbol);
    console.log(
      "AddActionModal: Rendering form for type:",
      mainTab,
      "and sub-type:",
      capitalIncreaseType,
      "isEditMode:",
      isEditMode
    );

    if (isEditMode) {
      if (["buy", "sell"].includes(initialData.type)) {
        return (
          <AddBuySellForm
            onSubmitSuccess={onSubmitSuccess}
            initialData={initialData}
            isEditMode={isEditMode}
          />
        );
      } else if (initialData.type === "dividend") {
        return (
          <AddDividendForm
            onSubmitSuccess={onSubmitSuccess}
            portfolioSymbols={portfolioSymbols}
            initialData={initialData}
            isEditMode={isEditMode}
          />
        );
      } else if (initialData.type === "bonus") {
        return (
          <AddBonusForm
            onSubmitSuccess={onSubmitSuccess}
            portfolioSymbols={portfolioSymbols}
            initialData={initialData}
            isEditMode={isEditMode}
          />
        );
      } else if (
        ["rights_exercise", "rights_sell"].includes(initialData.type)
      ) {
        return (
          <AddRightsForm
            onSubmitSuccess={onSubmitSuccess}
            portfolioSymbols={portfolioSymbols}
            initialData={initialData}
            isEditMode={isEditMode}
          />
        );
      } else if (initialData.type === "revaluation") {
        return (
          <AddRevaluationForm
            onSubmitSuccess={onSubmitSuccess}
            portfolioSymbols={portfolioSymbols}
            initialData={initialData}
            isEditMode={isEditMode}
          />
        );
      } else if (initialData.type === "premium") {
        return (
          <AddPremiumForm
            onSubmitSuccess={onSubmitSuccess}
            portfolioSymbols={portfolioSymbols}
            initialData={initialData}
            isEditMode={isEditMode}
          />
        );
      } else {
        return (
          <p className="text-danger-600 text-center">
            نوع رویداد نامعتبر است یا فرمی برای ویرایش آن وجود ندارد.
          </p>
        );
      }
    }

    if (mainTab === "main_trades") {
      return <AddBuySellForm onSubmitSuccess={onSubmitSuccess} />;
    } else if (mainTab === "capital_increase") {
      switch (capitalIncreaseType) {
        case "dividend":
          return (
            <AddDividendForm
              onSubmitSuccess={onSubmitSuccess}
              portfolioSymbols={portfolioSymbols}
            />
          );
        case "bonus":
          return (
            <AddBonusForm
              onSubmitSuccess={onSubmitSuccess}
              portfolioSymbols={portfolioSymbols}
            />
          );
        case "rights":
          return (
            <AddRightsForm
              onSubmitSuccess={onSubmitSuccess}
              portfolioSymbols={portfolioSymbols}
            />
          );
        case "revaluation":
          return (
            <AddRevaluationForm
              onSubmitSuccess={onSubmitSuccess}
              portfolioSymbols={portfolioSymbols}
            />
          );
        case "premium":
          return (
            <AddPremiumForm
              onSubmitSuccess={onSubmitSuccess}
              portfolioSymbols={portfolioSymbols}
            />
          );
        default:
          return (
            <p className="text-danger-600 text-center">
              نوع رویداد افزایش سرمایه نامعتبر است.
            </p>
          );
      }
    }
    return null;
  };

  const tabButtonClasses =
    "px-4 py-2 text-sm font-medium transition-colors focus:outline-none";
  const activeTabClasses = "border-b-2 border-primary-500 text-primary-600";
  const inactiveTabClasses =
    "text-content-500 hover:text-content-700 border-b-2 border-transparent";

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
        <nav
          className="-mb-px flex space-x-2 rtl:space-x-reverse flex-wrap"
          aria-label="Tabs">
          {!isEditMode ? (
            <>
              <button
                onClick={() => setMainTab("main_trades")}
                className={cn(
                  tabButtonClasses,
                  mainTab === "main_trades"
                    ? activeTabClasses
                    : inactiveTabClasses
                )}>
                معاملات اصلی
              </button>
              <button
                onClick={() => setMainTab("capital_increase")}
                className={cn(
                  tabButtonClasses,
                  mainTab === "capital_increase"
                    ? activeTabClasses
                    : inactiveTabClasses
                )}>
                افزایش سرمایه و سود
              </button>
            </>
          ) : (
            <span
              className={cn(
                tabButtonClasses,
                activeTabClasses,
                "cursor-default"
              )}>
              {(() => {
                const typeMap = {
                  buy: "ویرایش خرید/فروش",
                  sell: "ویرایش خرید/فروش",
                  dividend: "ویرایش سود نقدی",
                  bonus: "ویرایش سهام جایزه",
                  rights_exercise: "ویرایش حق تقدم",
                  rights_sell: "ویرایش حق تقدم",
                  revaluation: "ویرایش تجدید ارزیابی",
                  premium: "ویرایش صرف سهام",
                };
                return typeMap[initialData?.type] || "ویرایش رویداد";
              })()}
            </span>
          )}
        </nav>
      </div>
      <div className="pt-2 min-h-[300px]">
        {!isEditMode && mainTab === "capital_increase" && (
          <div className="mb-4">
            <SelectInput
              label="نوع رویداد افزایش سرمایه را انتخاب کنید"
              options={capitalIncreaseOptions}
              value={capitalIncreaseType}
              onChange={(e) => setCapitalIncreaseType(e.target.value)}
              placeholder="یک نوع را انتخاب کنید"
            />
          </div>
        )}
        {renderForm()}
      </div>
    </div>
  );
}
