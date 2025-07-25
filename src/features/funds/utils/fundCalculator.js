const MS_IN_DAY = 1000 * 60 * 60 * 24;

function XIRR(cashflows, guess = 0.1) {
    if (cashflows.length < 2 || !cashflows.some(cf => cf.amount > 0) || !cashflows.some(cf => cf.amount < 0)) {
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
            const exponent = (days / 365.0) + 1;
            result -= (days / 365.0) * values[i] / Math.pow(r, exponent);
        }
        return result;
    };

    let resultRate = guess;
    const epsMax = 1e-10;
    const iterMax = 100; // Increased iterations for better convergence
    let newRate, epsRate, resultValue;
    let iteration = 0;
    let contLoop = true;

    do {
        resultValue = irrResult(values, dates, resultRate);
        const derivative = irrResultDeriv(values, dates, resultRate);

        if (Math.abs(derivative) < epsMax) {
            return 0; // Avoid division by zero
        }

        newRate = resultRate - resultValue / derivative;
        epsRate = Math.abs(newRate - resultRate);
        resultRate = newRate;
        contLoop = (epsRate > epsMax) && (Math.abs(resultValue) > epsMax);
    } while (contLoop && (++iteration < iterMax));

    if (contLoop || !isFinite(resultRate)) {
        return 0; // Return 0 if it fails to converge or result is not finite
    }

    return resultRate;
}


export const processFundPositions = (trades, allSymbolsData) => {
  const allPositionInstances = [];
  const openPositionsMap = new Map();
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
    instanceId: `${trade.symbol}-${Date.now()}-${Math.random()}`,
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

    let position = openPositionsMap.get(symbol);

    if (!position) {
      position = createNewPosition(trade);
      allPositionInstances.push(position);
      openPositionsMap.set(symbol, position);
    }
    
    position.detailData.push(trade);
    position.lastKnownPrice = Number(trade.price_per_unit) || position.lastKnownPrice;

    const quantity = Number(trade.quantity) || 0;
    const price = Number(trade.price_per_unit) || 0;
    const commission = Number(trade.commission) || 0;

    if (trade.trade_type === 'buy') {
      if (!position.firstBuyDate) {
        position.firstBuyDate = trade.date;
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
          openPositionsMap.delete(symbol);
        }
      }
    }
  });

  let totalPortfolioValue = 0;
  
  allPositionInstances.forEach((position) => {
    const latestPrice = symbolLatestPrices.get(position.symbol) || position.lastKnownPrice;
    position.currentPrice = latestPrice;
    position.currentValue = position.remainingQty * latestPrice;
    
    if (position.remainingQty > 0.001) {
      position.avgBuyPrice = position.totalBuyCost / position.remainingQty;
      position.unrealizedPL = position.currentValue - position.totalBuyCost;
      totalPortfolioValue += position.currentValue;

      const startDate = new Date(position.firstBuyDate);
      const endDate = new Date();
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

    const xirrValue = XIRR(cashflows);
    position.annualizedReturnPercent = xirrValue * 100;

    position.avgSoldPrice = position.totalSoldQty > 0 ? position.totalSoldValue / position.totalSoldQty : 0;
  });
  
  allPositionInstances.forEach(p => {
    p.percentageOfPortfolio = totalPortfolioValue > 0 ? (p.currentValue / totalPortfolioValue) * 100 : 0;
  });

  const openPositions = allPositionInstances.filter(p => p.remainingQty > 0.001);
  const closedPositions = allPositionInstances.filter(p => p.remainingQty <= 0.001 && p.totalSoldQty > 0);
  
  return { openPositions, closedPositions };
};