export const processPortfolio = (actions, allSymbolsData) => {
  const openPositionsMap = new Map();
  const symbolLatestPrices = new Map();
  allSymbolsData.forEach((s) => {
    if (s.symbol && s.price != null) symbolLatestPrices.set(s.symbol, s.price / 10);
  });

  const sortedActions = [...actions].sort((a, b) => new Date(a.date) - new Date(b.date));
  
  let totalPortfolioValue = 0;

  sortedActions.forEach((action) => {
    if (!action.symbol) return;
    let position = openPositionsMap.get(action.symbol);
    if (!position) {
      position = {
        symbol: action.symbol, remainingQty: 0, totalBuyCost: 0, totalRealizedPL: 0, totalDividend: 0, totalRightsSellRevenue: 0, detailData: [], firstBuyDate: null, totalBoughtQty: 0, totalSoldQty: 0, totalBoughtValue: 0, totalSoldValue: 0,
        bonusQty: 0,
        revaluationQtyIncrease: 0,
        rightsQty: 0,
        premiumQty: 0,
      };
      openPositionsMap.set(action.symbol, position);
    }
    position.detailData.push(action);

    switch (action.type) {
      case 'buy':
        if (!position.firstBuyDate) position.firstBuyDate = action.date;
        const buyCost = (action.quantity * action.price) + (action.commission || 0);
        position.remainingQty += action.quantity;
        position.totalBuyCost += buyCost;
        position.totalBoughtQty += action.quantity;
        position.totalBoughtValue += buyCost;
        break;
      
      case 'rights_exercise':
        if (!position.firstBuyDate) position.firstBuyDate = action.date;
        const rightsCost = (action.quantity * action.price) + (action.commission || 0);
        position.remainingQty += action.quantity;
        position.totalBuyCost += rightsCost;
        position.totalBoughtQty += action.quantity;
        position.totalBoughtValue += rightsCost;
        position.rightsQty += action.quantity; 
        break;
        
      case 'sell':
        const avgCostPerShare = position.remainingQty > 0 ? position.totalBuyCost / position.remainingQty : 0;
        const sellRevenue = (action.quantity * action.price) - (action.commission || 0);
        position.totalRealizedPL += sellRevenue - (action.quantity * avgCostPerShare);
        position.totalBuyCost -= action.quantity * avgCostPerShare;
        position.remainingQty -= action.quantity;
        position.totalSoldQty += action.quantity;
        position.totalSoldValue += sellRevenue;
        break;

      case 'dividend':
        position.totalDividend += action.amount;
        break;

      case 'premium':
        if (action.premium_type === 'cash_payment') position.totalDividend += action.amount;
        if (action.premium_type === 'bonus_shares') {
          position.remainingQty += action.quantity;
          position.totalBoughtQty += action.quantity;
          position.premiumQty += action.quantity; 
        }
        break;
      
      case 'bonus':
        position.remainingQty += action.quantity;
        position.totalBoughtQty += action.quantity;
        position.bonusQty += action.quantity; 
        break;
      
      case 'rights_sell':
        position.totalRightsSellRevenue += action.amount;
        break;

      case 'revaluation':
        const currentQty = position.remainingQty;
        const multiplier = 1 + (action.revaluation_percentage / 100);
        const newQty = currentQty * multiplier;
        const addedQty = newQty - currentQty;
        
        position.remainingQty = newQty;
        position.totalBoughtQty += addedQty;
        position.revaluationQtyIncrease += addedQty;
        break;
    }
  });

  const finalPositions = [];
  openPositionsMap.forEach((position, symbol) => {
    const latestPrice = symbolLatestPrices.get(symbol) || 0;
    position.currentPrice = latestPrice;
    position.currentValue = position.remainingQty * latestPrice;
    totalPortfolioValue += position.currentValue;
    if (position.remainingQty > 0.001) {
      position.avgBuyPriceAdjusted = position.totalBuyCost / position.remainingQty;
      position.unrealizedPL = position.currentValue - position.totalBuyCost;
    } else {
      position.unrealizedPL = 0;
    }
    position.totalPL = position.totalRealizedPL + position.unrealizedPL + position.totalDividend + position.totalRightsSellRevenue;
    const totalInvestment = position.totalBoughtValue - position.totalRightsSellRevenue;
    position.percentagePL = totalInvestment > 0 ? (position.totalPL / totalInvestment) * 100 : 0;
    position.avgBoughtPrice = position.totalBoughtQty > 0 ? position.totalBoughtValue / position.totalBoughtQty : 0;
    position.avgSoldPrice = position.totalSoldQty > 0 ? position.totalSoldValue / position.totalSoldQty : 0;
    finalPositions.push(position);
  });
  
  finalPositions.forEach(p => {
    p.percentageOfPortfolio = totalPortfolioValue > 0 ? (p.currentValue / totalPortfolioValue) * 100 : 0;
  });

  const openPositions = finalPositions.filter(p => p.remainingQty > 0.001);
  const closedPositions = finalPositions.filter(p => p.remainingQty <= 0.001);
  return { openPositions, closedPositions };
};