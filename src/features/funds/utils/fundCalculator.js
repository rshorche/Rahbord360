const MS_IN_DAY = 1000 * 60 * 60 * 24;

function XIRR(cashflows, guess = 0.1) {
  if (cashflows.length === 0) {
    return 0;
  }

  const values = cashflows.map(cf => cf.amount);
  const dates = cashflows.map(cf => new Date(cf.date));
  
  const irrResult = (values, dates, rate) => {
    const r = rate + 1;
    let result = values[0];
    for (let i = 1; i < values.length; i++) {
      const days = (dates[i] - dates[0]) / MS_IN_DAY;
      result += values[i] / Math.pow(r, days / 365.0);
    }
    return result;
  };

  const irrResultDeriv = (values, dates, rate) => {
    const r = rate + 1;
    let result = 0;
    for (let i = 1; i < values.length; i++) {
      const days = (dates[i] - dates[0]) / MS_IN_DAY;
      result -= (days / 365.0) * values[i] / Math.pow(r, (days / 365.0) + 1);
    }
    return result;
  };

  let resultRate = guess;
  const epsMax = 1e-10;
  const iterMax = 50;
  let newRate, epsRate, resultValue;
  let iteration = 0;
  let contLoop = true;
  
  do {
    resultValue = irrResult(values, dates, resultRate);
    newRate = resultRate - resultValue / irrResultDeriv(values, dates, resultRate);
    epsRate = Math.abs(newRate - resultRate);
    resultRate = newRate;
    contLoop = (epsRate > epsMax) && (Math.abs(resultValue) > epsMax);
  } while (contLoop && (++iteration < iterMax));

  if (contLoop) {
    return Infinity; 
  }

  return resultRate;
}

export const processFundPositions = (trades, allSymbolsData) => {
  const positionsMap = new Map();
  const symbolLatestPrices = new Map();

  allSymbolsData.forEach((s) => {
    if (s.symbol && s.price != null) symbolLatestPrices.set(s.symbol, s.price / 10);
  });

const sortedTrades = [...trades].sort((a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    const createdAtA = new Date(a.created_at);
    const createdAtB = new Date(b.created_at);
    return createdAtA - createdAtB;
  });

  const createNewPosition = (trade) => ({
    symbol: trade.symbol,
    fund_type: trade.fund_type,
    remainingQty: 0,
    totalBuyCost: 0,
    totalRealizedPL: 0,
    detailData: [],
    firstBuyDate: null,
    lastSellDate: null,
    totalBoughtQty: 0,
    totalSoldQty: 0,
    totalBoughtValue: 0,
    totalSoldValue: 0,
    lastKnownPrice: 0,
  });

  sortedTrades.forEach((trade) => {
    const { symbol } = trade;
    if (!symbol) return;

    if (!positionsMap.has(symbol)) {
      positionsMap.set(symbol, createNewPosition(trade));
    }
    
    const position = positionsMap.get(symbol);
    position.detailData.push(trade);
    position.lastKnownPrice = Number(trade.price_per_unit) || position.lastKnownPrice;

    const quantity = Number(trade.quantity) || 0;
    const price = Number(trade.price_per_unit) || 0;
    const commission = Number(trade.commission) || 0;

    if (trade.trade_type === 'buy') {
      if (!position.firstBuyDate || position.remainingQty < 0.001) {
        position.firstBuyDate = trade.date;
        position.lastSellDate = null;
      }
      const buyCost = (quantity * price) + commission;
      position.remainingQty += quantity;
      position.totalBuyCost += buyCost;
      position.totalBoughtQty += quantity;
      position.totalBoughtValue += buyCost;
    } else if (trade.trade_type === 'sell') {
      if (position.remainingQty > 0) {
        const sellRevenue = (quantity * price) - commission;
        const qtyToSell = Math.min(quantity, position.remainingQty);
        const avgCostPerUnit = position.totalBuyCost / position.remainingQty;
        const costOfSoldUnits = qtyToSell * avgCostPerUnit;
        
        position.totalRealizedPL += sellRevenue - costOfSoldUnits;
        position.totalBuyCost -= costOfSoldUnits;
        position.remainingQty -= qtyToSell;
        position.totalSoldQty += quantity;
        position.totalSoldValue += sellRevenue;

        if (position.remainingQty < 0.001) {
          position.lastSellDate = trade.date;
          position.totalBuyCost = 0;
          position.remainingQty = 0;
        }
      }
    }
  });

  let totalPortfolioValue = 0;
  const allPositions = Array.from(positionsMap.values());

  allPositions.forEach((position) => {
    const latestPrice = symbolLatestPrices.get(position.symbol) || position.lastKnownPrice;
    position.currentPrice = latestPrice;
    position.currentValue = position.remainingQty * latestPrice;
    
    if (position.remainingQty > 0.001) {
      position.avgBuyPrice = position.totalBuyCost / position.remainingQty;
      position.unrealizedPL = position.currentValue - position.totalBuyCost;
      totalPortfolioValue += position.currentValue;

      const startDate = new Date(position.firstBuyDate);
      const endDate = position.lastSellDate ? new Date(position.lastSellDate) : new Date();
      position.positionAgeDays = Math.max(0, Math.round((endDate - startDate) / MS_IN_DAY));

    } else {
      position.unrealizedPL = 0;
      position.avgBuyPrice = 0;
      position.remainingQty = 0;
      if (position.firstBuyDate && position.lastSellDate) {
        const startDate = new Date(position.firstBuyDate);
        const endDate = new Date(position.lastSellDate);
        position.positionAgeDays = Math.max(0, Math.round((endDate - startDate) / MS_IN_DAY));
      } else {
        position.positionAgeDays = 0;
      }
    }
    
    position.totalPL = position.totalRealizedPL + position.unrealizedPL;
    const totalInvestment = position.totalBoughtValue;
    position.percentagePL = totalInvestment > 0 ? (position.totalPL / totalInvestment) * 100 : 0;
    
    const cashflows = position.detailData.map(t => {
        const amount = (t.quantity * t.price_per_unit);
        const commission = t.commission || 0;
        return {
            amount: t.trade_type === 'buy' ? -(amount + commission) : (amount - commission),
            date: new Date(t.date)
        };
    });

    if (position.remainingQty > 0.001) {
        cashflows.push({ amount: position.currentValue, date: new Date() });
    }

    if (cashflows.length > 1 && cashflows.some(cf => cf.amount > 0) && cashflows.some(cf => cf.amount < 0)) {
        const xirrValue = XIRR(cashflows);
        position.annualizedReturnPercent = isFinite(xirrValue) ? xirrValue * 100 : 0;
    } else {
        position.annualizedReturnPercent = 0;
    }

    position.avgSoldPrice = position.totalSoldQty > 0 ? position.totalSoldValue / position.totalSoldQty : 0;
  });
  
  allPositions.forEach(p => {
    p.percentageOfPortfolio = totalPortfolioValue > 0 ? (p.currentValue / totalPortfolioValue) * 100 : 0;
  });

  const openPositions = allPositions.filter(p => p.remainingQty > 0.001);
  const closedPositions = allPositions.filter(p => p.remainingQty <= 0.001 && p.totalSoldQty > 0);
  
  return { openPositions, closedPositions };
};