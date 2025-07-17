const MS_IN_DAY = 1000 * 60 * 60 * 24;

export const processFundPositions = (trades, allSymbolsData) => {
  const positionsMap = new Map();
  const symbolLatestPrices = new Map();

  allSymbolsData.forEach((s) => {
    if (s.symbol && s.price != null) symbolLatestPrices.set(s.symbol, s.price / 10);
  });

  const sortedTrades = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));

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
    
    if(position.positionAgeDays > 0) {
        position.annualizedReturnPercent = (position.percentagePL / position.positionAgeDays) * 365;
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