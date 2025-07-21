import { useDashboardLogic } from "../hooks/useDashboardLogic";
import Card from "../../../shared/components/ui/Card";
import { Wallet, TrendingUp, TrendingDown, BarChart2, Percent } from "lucide-react";
import AssetAllocationChart from "../components/AssetAllocationChart";
import PortfolioGrowthChart from "../components/PortfolioGrowthChart";
import TopHoldingsTable from "../components/TopHoldingsTable";
import UpcomingEvents from "../components/UpcomingEvents";
import LoadingSpinner from "../../../shared/components/ui/LoadingSpinner";
import { formatDisplayNumber } from "../../../shared/utils/formatters";

export default function DashboardOverviewPage() {
  const {
    isLoading,
    dashboardSummary,
    assetAllocationData,
    portfolioHistoryData,
    topHoldings,
    upcomingEvents,
  } = useDashboardLogic();

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-[80vh]">
            <LoadingSpinner text="در حال بارگذاری اطلاعات داشبورد..." />
        </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-content-800">خلاصه وضعیت پورتفولیو</h1>
        <p className="mt-2 text-content-500">
          نمای کلی از عملکرد و ترکیب دارایی‌های شما.
        </p>
      </div>

<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">        <Card title="ارزش کل پورتفولیو" amount={dashboardSummary.totalPortfolioValue} color="primary" icon={<Wallet size={24} />} />
        <Card title="سود/زیان امروز" amount={dashboardSummary.todaysPL} color={dashboardSummary.todaysPL >= 0 ? "success" : "danger"} icon={dashboardSummary.todaysPL >= 0 ? <TrendingUp size={24} /> : <TrendingDown size={24} />} />
        <Card title="سود/زیان کل (باز)" amount={dashboardSummary.totalUnrealizedPL} color={dashboardSummary.totalUnrealizedPL >= 0 ? "success" : "danger"} icon={<BarChart2 size={24} />} />

        <div className="p-4 rounded-xl border-l-4 flex items-center gap-4 transition-all duration-300 shadow-sm hover:shadow-md bg-purple-50 border-purple-500">
          <div className="flex-shrink-0 p-3 bg-white/60 rounded-full">
            <Percent size={24} className="text-purple-600" />
          </div>
          <div className="flex-grow">
            <h3 className="text-sm font-medium text-content-600">بازدهی کل</h3>
            <p className={`text-2xl font-bold ${dashboardSummary.totalReturnPercent >= 0 ? "text-success-700" : "text-danger-700"}`}>
              {formatDisplayNumber(dashboardSummary.totalReturnPercent, 2, "%")}
            </p>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <h3 className="font-bold text-lg mb-4">نمودار رشد سرمایه</h3>
          <div className="h-80">
            <PortfolioGrowthChart data={portfolioHistoryData} />
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
           <h3 className="font-bold text-lg mb-4">ترکیب دارایی‌ها</h3>
           <div className="h-80">
            <AssetAllocationChart data={assetAllocationData} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="font-bold text-lg mb-4">۵ دارایی برتر</h3>
          <TopHoldingsTable data={topHoldings} />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <h3 className="font-bold text-lg mb-4">یادآوری‌های مهم (۱۴ روز آینده)</h3>
          <UpcomingEvents events={upcomingEvents} />
        </div>
      </div>
    </div>
  );
}