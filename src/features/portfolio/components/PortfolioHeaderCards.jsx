import Card from "../../../shared/components/ui/Card";
import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function PortfolioHeaderCards({ metrics }) {
  const { totalCurrentValue, totalUnrealizedPL, totalRealizedReturn } = metrics;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      <Card
        title="ارزش لحظه‌ای پورتفوی"
        amount={totalCurrentValue}
        color="primary"
        icon={<Wallet size={24} className="text-primary-600" />}
      />
      <Card
        title="سود/زیان محقق نشده"
        amount={totalUnrealizedPL}
        color={totalUnrealizedPL >= 0 ? "success" : "danger"}
        icon={
          totalUnrealizedPL >= 0 ? (
            <TrendingUp size={24} className="text-success-600" />
          ) : (
            <TrendingDown size={24} className="text-danger-600" />
          )
        }
      />
      <Card
        title="بازده محقق شده (فروش + مجمع + حق تقدم)"
        amount={totalRealizedReturn}
        color={totalRealizedReturn >= 0 ? "success" : "danger"}
        icon={
          <DollarSign
            size={24}
            className={
              totalRealizedReturn >= 0 ? "text-success-600" : "text-danger-600"
            }
          />
        }
      />
    </div>
  );
}
