import { useMemo, useEffect, useState } from "react";
import { supabase } from "../../../shared/services/supabase";
import useStockTradesStore from "../../portfolio/store/useStockTradesStore";
import useFundTradesStore from "../../funds/store/useFundTradesStore";
import useOptionsStore from "../../options/store/useOptionsStore";
import useCoveredCallStore from "../../covered-call/store/useCoveredCallStore";
import useTransactionStore from "../../transactions/store/useTransactionStore";
import usePriceHistoryStore from "../../../shared/store/usePriceHistoryStore";
import { processPortfolio } from "../../portfolio/utils/portfolioCalculator";
import { processFundPositions } from "../../funds/utils/fundCalculator";
import { processOptionsPositions } from "../../options/utils/optionsCalculations";
import { calculatePositionMetrics } from "../../covered-call/utils/coveredCallCalculations";

export const useDashboardLogic = () => {
  const { actions: portfolioActions, isLoading: isPortfolioLoading } = useStockTradesStore();
  const { trades: fundTrades, isLoading: isFundsLoading } = useFundTradesStore();
  const { positions: optionTrades, isLoading: isOptionsLoading } = useOptionsStore();
  const { positions: coveredCallTrades, isLoading: isCoveredCallLoading } = useCoveredCallStore();
  const { transactions, isLoading: isTransactionsLoading } = useTransactionStore();
  const { priceHistory, lastFetchTimestamp, isLoading: isPriceHistoryLoading } = usePriceHistoryStore();

  const [portfolioHistoryData, setPortfolioHistoryData] = useState([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(true);

  const isStoresLoading = isPortfolioLoading || isFundsLoading || isOptionsLoading || isCoveredCallLoading || isTransactionsLoading || isPriceHistoryLoading;
  const isLoading = isStoresLoading || isHistoryLoading;

  useEffect(() => {
    const fetchHistory = async () => {
      setIsHistoryLoading(true);
      const { data, error } = await supabase
        .from('portfolio_history')
        .select('snapshot_date, total_value, net_deposits, cumulative_pl')
        .order('snapshot_date', { ascending: true });

      if (error) {
        console.error("Error fetching portfolio history:", error);
      } else if (data) {
        setPortfolioHistoryData(data.map(item => ({
          date: item.snapshot_date,
          capital_growth: Number(item.net_deposits) + Number(item.cumulative_pl),
          net_deposits: Number(item.net_deposits)
        })));
      }
      setIsHistoryLoading(false);
    };
    fetchHistory();
  }, []);

  const dashboardMetrics = useMemo(() => {
    if (isLoading || !priceHistory.size) {
      return {
        dashboardSummary: { totalPortfolioValue: 0, totalUnrealizedPL: 0, todaysPL: 0, totalReturnPercent: 0 },
        assetAllocationData: [],
        topHoldings: [],
        upcomingEvents: [],
        finalPortfolioHistoryData: portfolioHistoryData
      };
    }

    const pricesForCalc = Array.from(priceHistory.values());

    const { openPositions: portfolioOpen, closedPositions: portfolioClosed } = processPortfolio(portfolioActions, pricesForCalc);
    const { openPositions: fundOpen, closedPositions: fundClosed } = processFundPositions(fundTrades, pricesForCalc);
    const { openPositions: optionOpen, historyPositions: optionClosed } = processOptionsPositions(optionTrades, priceHistory);
    const coveredCallAll = coveredCallTrades.map(p => {
        const currentStockPrice = priceHistory.get(p.underlying_symbol)?.price / 10 || 0;
        return calculatePositionMetrics(p, currentStockPrice);
    });
    const coveredCallClosed = coveredCallAll.filter(p => p.status !== 'OPEN');

    const stockValue = portfolioOpen.reduce((sum, p) => sum + p.currentValue, 0);
    const fundValue = fundOpen.reduce((sum, p) => sum + p.currentValue, 0);
    const optionValue = optionOpen.reduce((sum, p) => sum + (p.current_value || 0), 0);
    const totalPortfolioValue = stockValue + fundValue + optionValue;

    const totalUnrealizedPL = portfolioOpen.reduce((sum, p) => sum + p.unrealizedPL, 0) +
                              fundOpen.reduce((sum, p) => sum + p.unrealizedPL, 0) +
                              optionOpen.reduce((sum, p) => sum + (p.unrealized_pl || 0), 0);

    const totalRealizedPL = [...portfolioOpen, ...portfolioClosed].reduce((sum, p) => sum + p.totalRealizedPL + p.totalDividend + p.totalRightsSellRevenue, 0) +
                            [...fundOpen, ...fundClosed].reduce((sum, p) => sum + p.totalRealizedPL, 0) +
                            [...optionOpen, ...optionClosed].reduce((sum, p) => sum + p.realized_pl, 0) +
                            coveredCallClosed.reduce((sum, p) => sum + p.realized_pl, 0);
    
    const netDeposits = transactions.reduce((acc, t) => acc + (t.type === "deposit" ? Number(t.amount) : -Number(t.amount)), 0);

    const totalPL = totalUnrealizedPL + totalRealizedPL;
    
    const currentCapitalGrowth = netDeposits + totalPL;

    const today = new Date().toISOString().split('T')[0];
    const todayDataPoint = {
      date: today,
      capital_growth: currentCapitalGrowth,
      net_deposits: netDeposits
    };

    let combinedHistory = [...portfolioHistoryData];
    const lastHistoryEntry = combinedHistory.length > 0 ? combinedHistory[combinedHistory.length - 1] : null;

    if (lastHistoryEntry && lastHistoryEntry.date === today) {
      combinedHistory[combinedHistory.length - 1] = todayDataPoint;
    } else if (lastHistoryEntry && new Date(lastHistoryEntry.date) > new Date(today)) {
      let filteredHistory = combinedHistory.filter(p => new Date(p.date) < new Date(today));
      filteredHistory.push(todayDataPoint);
      combinedHistory = filteredHistory;
    }
    else {
      combinedHistory.push(todayDataPoint);
    }
    
    const totalReturnPercent = netDeposits !== 0 ? (totalPL / netDeposits) * 100 : 0;

    let todaysPL = 0;
    const todayDate = new Date();
    const priceDate = new Date(lastFetchTimestamp);
    if (priceDate.toDateString() !== todayDate.toDateString()) {
        todaysPL = 0;
    } else if (portfolioHistoryData.length > 1) {
        const yesterdayData = portfolioHistoryData[portfolioHistoryData.length - 2];
        if (yesterdayData) {
            const yesterdayValue = yesterdayData.net_deposits + yesterdayData.cumulative_pl;
            const netDepositsToday = netDeposits - yesterdayData.net_deposits;
            todaysPL = totalPortfolioValue - yesterdayValue - netDepositsToday;
        } else {
            todaysPL = totalPortfolioValue - netDeposits;
        }
    } else if (transactions.length > 0) {
        todaysPL = totalPortfolioValue - netDeposits;
    }

    const summary = { totalPortfolioValue, totalUnrealizedPL, todaysPL, totalReturnPercent };

    const totalAssetValue = stockValue + fundValue + optionValue;
    const allocationData = totalAssetValue === 0 ? [] : [
      { name: 'سهام', value: stockValue },
      { name: 'صندوق', value: fundValue },
      { name: 'اختیار', value: optionValue },
    ].filter(item => item.value > 0).map(item => ({...item, percent: (item.value / totalAssetValue) * 100}));

    const allHoldings = [...portfolioOpen, ...fundOpen].sort((a, b) => b.currentValue - a.currentValue).slice(0, 5);
    
    const MS_IN_DAY = 1000 * 60 * 60 * 24;
    const todayForEvents = new Date();
    todayForEvents.setHours(0, 0, 0, 0);

    const upcomingOpts = optionOpen
      .map(p => ({ ...p, days_to_expiration: Math.ceil((new Date(p.expiration_date) - todayForEvents) / MS_IN_DAY) }))
      .filter(p => p.days_to_expiration >= 0 && p.days_to_expiration <= 14)
      .map(p => ({ type: 'Option', symbol: p.option_symbol, date: p.expiration_date, days_left: p.days_to_expiration }));

    const upcomingCCs = coveredCallTrades
      .filter(p => p.status === 'OPEN')
      .map(p => ({ ...p, days_to_expiration: Math.ceil((new Date(p.expiration_date) - todayForEvents) / MS_IN_DAY) }))
      .filter(p => p.days_to_expiration >= 0 && p.days_to_expiration <= 14)
      .map(p => ({ type: 'Covered Call', symbol: p.option_symbol, date: p.expiration_date, days_left: p.days_to_expiration }));

    const events = [...upcomingOpts, ...upcomingCCs].sort((a, b) => a.days_left - b.left);

    return { 
        dashboardSummary: summary, 
        assetAllocationData: allocationData, 
        topHoldings: allHoldings, 
        upcomingEvents: events,
        finalPortfolioHistoryData: combinedHistory
    };

  }, [isLoading, priceHistory, portfolioActions, fundTrades, optionTrades, coveredCallTrades, transactions, portfolioHistoryData, lastFetchTimestamp]);

  return {
    isLoading,
    dashboardSummary: dashboardMetrics.dashboardSummary,
    assetAllocationData: dashboardMetrics.assetAllocationData,
    topHoldings: dashboardMetrics.topHoldings,
    upcomingEvents: dashboardMetrics.upcomingEvents,
    portfolioHistoryData: dashboardMetrics.finalPortfolioHistoryData
  };
};