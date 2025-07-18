import { useMemo, useEffect, useState } from "react";
import useStockTradesStore from "../../portfolio/store/useStockTradesStore";
import useFundTradesStore from "../../funds/store/useFundTradesStore";
import useOptionsStore from "../../options/store/useOptionsStore";
import useCoveredCallStore from "../../covered-call/store/useCoveredCallStore";
import usePriceHistoryStore from "../../../shared/store/usePriceHistoryStore";
import { processPortfolio } from "../../portfolio/utils/portfolioCalculator";
import { processFundPositions } from "../../funds/utils/fundCalculator";
import { processOptionsPositions } from "../../options/utils/optionsCalculations";
import { supabase } from "../../../shared/services/supabase";

export const useDashboardLogic = () => {
  const portfolioActions = useStockTradesStore((state) => state.actions);
  const fundTrades = useFundTradesStore((state) => state.trades);
  const optionTrades = useOptionsStore((state) => state.positions);
  const coveredCallTrades = useCoveredCallStore((state) => state.positions);
  const priceHistory = usePriceHistoryStore((state) => state.priceHistory);

  const [portfolioHistoryData, setPortfolioHistoryData] = useState([]);
  
  const isPortfolioLoading = useStockTradesStore((state) => state.isLoading);
  const isFundsLoading = useFundTradesStore((state) => state.isLoading);
  const isOptionsLoading = useOptionsStore((state) => state.isLoading);
  const isCoveredCallLoading = useCoveredCallStore((state) => state.isLoading);
  const isPriceHistoryLoading = usePriceHistoryStore((state) => state.isLoading);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  const isLoading = isPortfolioLoading || isFundsLoading || isOptionsLoading || isCoveredCallLoading || isPriceHistoryLoading || isHistoryLoading;

  useEffect(() => {
    const fetchPortfolioHistory = async () => {
      setIsHistoryLoading(true);
      const { data, error } = await supabase
        .from('portfolio_history')
        .select('snapshot_date, total_value, net_deposits')
        .order('snapshot_date', { ascending: true });

      if (!error && data) {
        setPortfolioHistoryData(data.map(item => ({
          date: item.snapshot_date,
          total_value: Number(item.total_value),
          net_deposits: Number(item.net_deposits)
        })));
      }
      setIsHistoryLoading(false);
    };
    fetchPortfolioHistory();
  }, []);

  const processedData = useMemo(() => {
    if (!portfolioActions || !fundTrades || !optionTrades || !priceHistory || !coveredCallTrades) {
      return {
        dashboardSummary: { totalPortfolioValue: 0, totalUnrealizedPL: 0, todaysPL: 0 },
        assetAllocationData: [],
        topHoldings: [],
        upcomingEvents: [],
      };
    }

    const pricesForCalc = Array.from(priceHistory.values());

    const { openPositions: portfolioOpen } = processPortfolio(portfolioActions, pricesForCalc);
    const portfolioValue = portfolioOpen.reduce((sum, p) => sum + p.currentValue, 0);
    const portfolioCost = portfolioOpen.reduce((sum, p) => sum + p.totalBuyCost, 0);

    const { openPositions: fundOpen } = processFundPositions(fundTrades, pricesForCalc);
    const fundValue = fundOpen.reduce((sum, p) => sum + p.currentValue, 0);

    const { openPositions: optionOpen } = processOptionsPositions(optionTrades, priceHistory);
    const optionValue = optionOpen.reduce((sum, p) => sum + (p.current_value || 0), 0);

    const totalPortfolioValue = portfolioValue + fundValue + optionValue;
    const totalUnrealizedPL = (portfolioValue - portfolioCost) + (fundOpen.reduce((sum, p) => sum + p.unrealizedPL, 0)) + (optionOpen.reduce((sum, p) => sum + (p.unrealized_pl || 0), 0));
    const dashboardSummary = { totalPortfolioValue, totalUnrealizedPL, todaysPL: 0 };

    const total = totalPortfolioValue;
    const assetAllocationData = total === 0 ? [] : [
      { name: 'سهام', value: portfolioValue },
      { name: 'صندوق', value: fundValue },
      { name: 'اختیار', value: optionValue },
    ].filter(item => item.value > 0).map(item => ({...item, percent: (item.value / total) * 100}));

    const allHoldings = [...portfolioOpen, ...fundOpen];
    const topHoldings = allHoldings.sort((a, b) => b.currentValue - a.currentValue).slice(0, 5);

    const MS_IN_DAY = 1000 * 60 * 60 * 24;
    const today = new Date();
    today.setHours(0,0,0,0);
    
    const upcomingOptions = optionOpen
        .map(p => ({ ...p, days_to_expiration: Math.ceil((new Date(p.expiration_date) - today) / MS_IN_DAY)}))
        .filter(p => p.days_to_expiration >= 0 && p.days_to_expiration <= 14)
        .map(p => ({ type: 'Option', symbol: p.option_symbol, date: p.expiration_date, days_left: p.days_to_expiration }));

    const upcomingCC = coveredCallTrades
        .filter(p => p.status === 'OPEN')
        .map(p => ({ ...p, days_to_expiration: Math.ceil((new Date(p.expiration_date) - today) / MS_IN_DAY)}))
        .filter(p => p.days_to_expiration >= 0 && p.days_to_expiration <= 14)
        .map(p => ({ type: 'Covered Call', symbol: p.option_symbol, date: p.expiration_date, days_left: p.days_to_expiration }));

    const upcomingEvents = [...upcomingOptions, ...upcomingCC].sort((a,b) => a.days_left - b.days_left);

    return { dashboardSummary, assetAllocationData, topHoldings, upcomingEvents };
  }, [portfolioActions, fundTrades, optionTrades, coveredCallTrades, priceHistory]);

  return {
    isLoading,
    dashboardSummary: processedData.dashboardSummary,
    assetAllocationData: processedData.assetAllocationData,
    topHoldings: processedData.topHoldings,
    portfolioHistoryData,
    upcomingEvents: processedData.upcomingEvents,
  };
};