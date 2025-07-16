export const processPortfolio = (actions, allSymbolsData) => {
  const positionsMap = new Map();
  const symbolLatestPrices = new Map();

  allSymbolsData.forEach((s) => {
    if (s.symbol && s.price != null) symbolLatestPrices.set(s.symbol, s.price / 10);
  });

  const sortedActions = [...actions].sort((a, b) => new Date(a.date) - new Date(b.date));

  const createNewPosition = (symbol) => ({
    symbol: symbol, remainingQty: 0, totalBuyCost: 0, totalRealizedPL: 0, totalDividend: 0, totalRightsSellRevenue: 0, detailData: [], firstBuyDate: null, lastSellDate: null, totalBoughtQty: 0, totalSoldQty: 0, totalBoughtValue: 0, totalSoldValue: 0,
    bonusQty: 0, revaluationQtyIncrease: 0, rightsQty: 0, premiumQty: 0,
  });

  sortedActions.forEach((action) => {
    const { symbol } = action;
    if (!symbol) return;

    if (!positionsMap.has(symbol)) {
      positionsMap.set(symbol, createNewPosition(symbol));
    }
    
    const position = positionsMap.get(symbol);
    position.detailData.push(action);

    const quantity = Number(action.quantity) || 0;
    const price = Number(action.price) || 0;
    const commission = Number(action.commission) || 0;
    const amount = Number(action.amount) || 0;

    switch (action.type) {
      case 'buy':
      case 'rights_exercise':
        if (!position.firstBuyDate || position.remainingQty < 0.001) {
            position.firstBuyDate = action.date;
            position.lastSellDate = null;
        }
        const buyCost = (quantity * price) + commission;
        position.remainingQty += quantity;
        position.totalBuyCost += buyCost;
        position.totalBoughtQty += quantity;
        position.totalBoughtValue += buyCost;
        if (action.type === 'rights_exercise') position.rightsQty += quantity;
        break;
        
      case 'sell':
        if (position.remainingQty > 0) {
          const avgCostPerShare = position.totalBuyCost / position.remainingQty;
          const costOfSoldShares = quantity * avgCostPerShare;
          const sellRevenue = (quantity * price) - commission;
          position.totalRealizedPL += sellRevenue - costOfSoldShares;
          position.totalBuyCost -= costOfSoldShares;
          position.remainingQty -= quantity;
          position.totalSoldQty += quantity;
          position.totalSoldValue += sellRevenue;
          
          // --- تغییر کلیدی و نهایی برای حل مشکل ---
          if (position.remainingQty < 0.001) {
              position.lastSellDate = action.date;
              position.remainingQty = 0; // اطمینان از صفر شدن
              position.totalBuyCost = 0; // اطمینان از صفر شدن
          }
        }
        break;

      case 'dividend':
        position.totalDividend += amount;
        break;

      case 'premium':
        if (action.premium_type === 'cash_payment') position.totalDividend += amount;
        if (action.premium_type === 'bonus_shares') {
          position.remainingQty += quantity;
          position.totalBoughtQty += quantity;
          position.premiumQty += quantity; 
        }
        break;
      
      case 'bonus':
        position.remainingQty += quantity;
        position.totalBoughtQty += quantity;
        position.bonusQty += quantity; 
        break;
      
      case 'rights_sell':
        position.totalRightsSellRevenue += amount;
        break;

      case 'revaluation':
        const currentQty = position.remainingQty;
        const multiplier = 1 + (Number(action.revaluation_percentage) / 100);
        const newQty = Math.round(currentQty * multiplier);
        const addedQty = newQty - currentQty;
        position.remainingQty = newQty;
        position.totalBoughtQty += addedQty;
        position.revaluationQtyIncrease += addedQty;
        break;
    }
  });

  let totalPortfolioValue = 0;
  const allPositions = Array.from(positionsMap.values());

  const MS_IN_DAY = 1000 * 60 * 60 * 24;

  allPositions.forEach((position) => {
    const latestPrice = symbolLatestPrices.get(position.symbol) || 0;
    position.currentPrice = latestPrice;
    position.currentValue = position.remainingQty * latestPrice;
    
    if (position.remainingQty > 0.001) {
      position.avgBuyPriceAdjusted = position.totalBuyCost / position.remainingQty;
      position.unrealizedPL = position.currentValue - position.totalBuyCost;
      totalPortfolioValue += position.currentValue;

      const startDate = new Date(position.firstBuyDate);
      const endDate = position.lastSellDate ? new Date(position.lastSellDate) : new Date();
      position.positionAgeDays = Math.round((endDate - startDate) / MS_IN_DAY);

    } else {
      position.unrealizedPL = 0;
      position.avgBuyPriceAdjusted = 0;
      if(position.firstBuyDate && position.lastSellDate) {
        const startDate = new Date(position.firstBuyDate);
        const endDate = new Date(position.lastSellDate);
        position.positionAgeDays = Math.round((endDate - startDate) / MS_IN_DAY);
      } else {
        position.positionAgeDays = 0;
      }
    }
    
    position.totalPL = position.totalRealizedPL + position.unrealizedPL + position.totalDividend + position.totalRightsSellRevenue;
    const totalInvestment = position.totalBoughtValue - position.totalRightsSellRevenue;
    position.percentagePL = totalInvestment > 0 ? (position.totalPL / totalInvestment) * 100 : 0;
    
    if(position.positionAgeDays > 0) {
        position.annualizedReturnPercent = (position.percentagePL / position.positionAgeDays) * 365;
    } else {
        position.annualizedReturnPercent = 0;
    }

    position.avgBoughtPrice = position.totalBoughtQty > 0 ? position.totalBoughtValue / position.totalBoughtQty : 0;
    position.avgSoldPrice = position.totalSoldQty > 0 ? position.totalSoldValue / position.totalSoldQty : 0;
  });
  
  allPositions.forEach(p => {
    p.percentageOfPortfolio = totalPortfolioValue > 0 ? (p.currentValue / totalPortfolioValue) * 100 : 0;
  });

  const openPositions = allPositions.filter(p => p.remainingQty > 0.001);
  const closedPositions = allPositions.filter(p => p.remainingQty <= 0.001);
  
  return { openPositions, closedPositions };
};