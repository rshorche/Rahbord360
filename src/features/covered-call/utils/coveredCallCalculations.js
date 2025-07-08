// src/features/covered-call/utils/coveredCallCalculations.js

const MS_IN_DAY = 1000 * 60 * 60 * 24;
const DAYS_IN_YEAR = 365;

const _getDaysDifference = (dateA, dateB) => {
  if (!dateA || !dateB) return 0;
  const diffTime = new Date(dateA).getTime() - new Date(dateB).getTime();
  return Math.ceil(diffTime / MS_IN_DAY);
};

const _calculateRealizedPL = (status, netPremium, totalRequiredShares, strikePrice, underlyingCostBasis, closingPricePerShare, closingCommission) => {
  switch (status) {
    case 'EXPIRED':
      return netPremium;
    case 'ASSIGNED':
      const stockProfit = (strikePrice - underlyingCostBasis) * totalRequiredShares;
      return netPremium + stockProfit;
    case 'CLOSED':
      const closingCost = (closingPricePerShare * totalRequiredShares) + closingCommission;
      return netPremium - closingCost;
    default:
      return 0;
  }
};

export const calculatePositionMetrics = (position, currentStockPrice = 0) => {
  const numContracts = Number(position.contracts_count) || 0;
  const numSharesPerContract = Number(position.shares_per_contract) || 0;
  const numUnderlyingCostBasis = Number(position.underlying_cost_basis) || 0;
  const numPremiumPerShare = Number(position.premium_per_share) || 0;
  const numCommission = Number(position.commission) || 0;
  const numStrikePrice = Number(position.strike_price) || 0;
  const numClosingPrice = Number(position.closing_price_per_share) || 0;
  const numClosingCommission = Number(position.closing_commission) || 0;

  const totalRequiredShares = numContracts * numSharesPerContract;
  const capitalInvolved = numUnderlyingCostBasis * totalRequiredShares;
  const totalPremiumReceived = numPremiumPerShare * totalRequiredShares;
  const netPremium = totalPremiumReceived - numCommission;

  const tradeDate = new Date(position.trade_date);
  const expirationDate = new Date(position.expiration_date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let realized_pl = 0;
  let holding_period_days = 0;
  let total_strategy_pl = 0;

  if (position.status !== 'OPEN') {
    const closingDate = new Date(position.closing_date || position.expiration_date);
    holding_period_days = _getDaysDifference(closingDate, tradeDate);
    realized_pl = _calculateRealizedPL(
      position.status, netPremium, totalRequiredShares, numStrikePrice, 
      numUnderlyingCostBasis, numClosingPrice, numClosingCommission
    );
    // در تاریخچه، سود کل همان سود قطعی است
    total_strategy_pl = realized_pl;
  }
  
  const daysToExpiration = position.status === 'OPEN' ? _getDaysDifference(expirationDate, today) : "پایان یافته";
  const breakEvenPrice = totalRequiredShares > 0 ? numUnderlyingCostBasis - (netPremium / totalRequiredShares) : 0;
  const maxProfit = (numStrikePrice - numUnderlyingCostBasis) * totalRequiredShares + netPremium;
  const returnIfAssignedPercent = capitalInvolved > 0 ? (maxProfit / capitalInvolved) * 100 : 0;
  
  const tradeDuration = Math.max(1, _getDaysDifference(expirationDate, tradeDate));
  const annualizedReturnPercent = (returnIfAssignedPercent / tradeDuration) * DAYS_IN_YEAR;
  
  // --- محاسبات اصلاح شده و اضافه شده ---
  const distanceToStrikePercent = currentStockPrice > 0 && numStrikePrice > 0 ? ((currentStockPrice - numStrikePrice) / numStrikePrice) * 100 : 0;
  const distanceToBePercent = currentStockPrice > 0 && breakEvenPrice > 0 ? ((currentStockPrice - breakEvenPrice) / breakEvenPrice) * 100 : 0;
  const realizedReturnPercent = capitalInvolved > 0 ? (realized_pl / capitalInvolved) * 100 : 0;
  
  return {
    ...position,
    total_required_shares: totalRequiredShares,
    capital_involved: capitalInvolved,
    total_premium_received: totalPremiumReceived,
    current_stock_price: currentStockPrice,
    days_to_expiration: daysToExpiration,
    net_premium: netPremium,
    annualized_return_percent: annualizedReturnPercent,
    break_even_price: breakEvenPrice,
    return_if_assigned_percent: returnIfAssignedPercent,
    realized_pl: realized_pl,
    realized_return_percent: realizedReturnPercent,
    distance_to_strike_percent: distanceToStrikePercent, // فیلد اضافه شده
    distance_to_be_percent: distanceToBePercent,       // فیلد اضافه شده
    total_strategy_pl: total_strategy_pl,               // فیلد اصلاح شده
    holding_period_days: Math.round(holding_period_days),
    max_profit: maxProfit,
  };
};