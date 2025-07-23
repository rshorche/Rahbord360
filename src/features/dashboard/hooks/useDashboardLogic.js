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
  const [dashboardSummary, setDashboardSummary] = useState({
    totalPortfolioValue: 0,
    totalUnrealizedPL: 0,
    todaysPL: 0,
    totalReturnPercent: 0,
  });
  
  const isPortfolioLoading = useStockTradesStore((state) => state.isLoading);
  const isFundsLoading = useFundTradesStore((state) => state.isLoading);
  const isOptionsLoading = useOptionsStore((state) => state.isLoading);
  const isCoveredCallLoading = useCoveredCallStore((state) => state.isLoading);
  const isPriceHistoryLoading = usePriceHistoryStore((state) => state.isLoading);
  const [isDashboardDataLoading, setIsDashboardDataLoading] = useState(true);

  const isStoresLoading = isPortfolioLoading || isFundsLoading || isOptionsLoading || isCoveredCallLoading || isPriceHistoryLoading;

  useEffect(() => {
    const fetchAsyncData = async () => {
      setIsDashboardDataLoading(true);
      
      const { data: summaryResult, error: summaryError } = await supabase.rpc('get_dashboard_summary');
      
      const { data: historyResult, error: historyError } = await supabase
          .from('portfolio_history')
          .select('snapshot_date, total_value, net_deposits')
          .order('snapshot_date', { ascending: true });

      if (summaryError) {
        console.error("Error fetching dashboard summary:", summaryError);
      } else if (summaryResult) {
        setDashboardSummary(summaryResult);
      }

      if (historyError) {
          console.error("Error fetching portfolio history:", historyError);
      } else if (historyResult) {
        setPortfolioHistoryData(historyResult.map(item => ({
          date: item.snapshot_date,
          total_value: Number(item.total_value),
          net_deposits: Number(item.net_deposits)
        })));
      }
      
      setIsDashboardDataLoading(false);
    };
    
    fetchAsyncData();
  }, []);

  const { assetAllocationData, topHoldings, upcomingEvents } = useMemo(() => {
    if (isStoresLoading || !priceHistory.size) {
      return {
        assetAllocationData: [],
        topHoldings: [],
        upcomingEvents: [],
      };
    }

    const pricesForCalc = Array.from(priceHistory.values());
    const { openPositions: portfolioOpen } = processPortfolio(portfolioActions, pricesForCalc);
    const { openPositions: fundOpen } = processFundPositions(fundTrades, pricesForCalc);
    const { openPositions: optionOpen } = processOptionsPositions(optionTrades, priceHistory);

    const portfolioValue = portfolioOpen.reduce((sum, p) => sum + p.currentValue, 0);
    const fundValue = fundOpen.reduce((sum, p) => sum + p.currentValue, 0);
    const optionValue = optionOpen.reduce((sum, p) => sum + (p.current_value || 0), 0);
    const total = portfolioValue + fundValue + optionValue;

    const assetAllocationData = total === 0 ? [] : [
      { name: 'سهام', value: portfolioValue },
      { name: 'صندوق', value: fundValue },
      { name: 'اختیار', value: optionValue },
    ].filter(item => item.value > 0).map(item => ({...item, percent: (item.value / total) * 100}));

    const allHoldings = [...portfolioOpen, ...fundOpen];
    const topHoldings = allHoldings.sort((a, b) => b.currentValue - a.currentValue).slice(0, 5);

    const MS_IN_DAY = 1000 * 60 * 60 * 24;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const upcomingOptions = optionOpen
      .map(p => ({ ...p, days_to_expiration: Math.ceil((new Date(p.expiration_date) - today) / MS_IN_DAY) }))
      .filter(p => p.days_to_expiration >= 0 && p.days_to_expiration <= 14)
      .map(p => ({ type: 'Option', symbol: p.option_symbol, date: p.expiration_date, days_left: p.days_to_expiration }));

    const upcomingCC = coveredCallTrades
      .filter(p => p.status === 'OPEN')
      .map(p => ({ ...p, days_to_expiration: Math.ceil((new Date(p.expiration_date) - today) / MS_IN_DAY) }))
      .filter(p => p.days_to_expiration >= 0 && p.days_to_expiration <= 14)
      .map(p => ({ type: 'Covered Call', symbol: p.option_symbol, date: p.expiration_date, days_left: p.days_to_expiration }));

    const upcomingEvents = [...upcomingOptions, ...upcomingCC].sort((a, b) => a.days_left - b.days_left);

    return { assetAllocationData, topHoldings, upcomingEvents };
  }, [isStoresLoading, priceHistory, portfolioActions, fundTrades, optionTrades, coveredCallTrades]);

  return {
    isLoading: isStoresLoading || isDashboardDataLoading,
    dashboardSummary,
    assetAllocationData: assetAllocationData,
    topHoldings: topHoldings,
    portfolioHistoryData,
    upcomingEvents: upcomingEvents,
  };
};