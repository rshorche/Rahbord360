export const processPortfolio = (actions, allSymbolsData) => {
  const openPositionsMap = new Map();
  const closedPositions = [];

  const symbolLatestPrices = new Map();
  allSymbolsData.forEach((s) => {
    if (s.l18 && s.pl !== undefined && s.pl !== null) {
      symbolLatestPrices.set(s.l18, s.pl);
    }
  });

  const sortedActions = [...actions].sort((a, b) => {
    const dateA = a.date.replace(/[/ ]/g, "");
    const dateB = b.date.replace(/[/ ]/g, "");
    return dateA.localeCompare(dateB);
  });

  sortedActions.forEach((action) => {
    const {
      id,
      date,
      symbol,
      type,
      quantity,
      price,
      commission,
      amount,
      revaluation_percentage,
      premium_type,
    } = action;

    if (!symbol) {
      console.warn(
        `رویداد با شناسه ${id} فاقد نماد است و از محاسبات کنار گذاشته می‌شود.`
      );
      return;
    }

    let position = openPositionsMap.get(symbol);
    if (!position) {
      position = {
        symbol,
        remainingQty: 0,
        totalBuyCost: 0,
        totalSellRevenue: 0,
        totalRealizedPL: 0,
        totalDividend: 0,
        totalBonusShares: 0,
        totalRightsExerciseCost: 0,
        totalRightsSellRevenue: 0,
        firstBuyDate: null,
        totalBoughtQty: 0,
        totalBoughtValue: 0,
        totalSoldQty: 0,
        totalSoldValue: 0,
        detailData: [],
      };
      openPositionsMap.set(symbol, position);
    }

    position.detailData.push(action);
    position.detailData.sort((a, b) => {
      const dateA = a.date.replace(/[/ ]/g, "");
      const dateB = b.date.replace(/[/ ]/g, "");
      return dateA.localeCompare(dateB);
    });

    const currentPrice = symbolLatestPrices.get(symbol) || 0;

    switch (type) {
      case "buy": {
        position.remainingQty += quantity;
        position.totalBuyCost += quantity * price + (commission || 0);
        position.totalBoughtQty += quantity;
        position.totalBoughtValue += quantity * price + (commission || 0);
        if (!position.firstBuyDate) {
          position.firstBuyDate = date;
        }
        break;
      }
      case "sell": {
        const avgCostBeforeSell =
          position.remainingQty > 0
            ? position.totalBuyCost / position.remainingQty
            : 0;
        position.remainingQty -= quantity;
        position.totalSellRevenue += quantity * price - (commission || 0);
        position.totalSoldQty += quantity;
        position.totalSoldValue += quantity * price - (commission || 0);
        position.totalRealizedPL +=
          quantity * price - (commission || 0) - quantity * avgCostBeforeSell;
        break;
      }
      case "dividend": {
        position.totalDividend += amount;
        break;
      }
      case "bonus": {
        position.remainingQty += quantity;
        position.totalBonusShares += quantity;
        position.totalBoughtQty += quantity;
        break;
      }
      case "rights_exercise": {
        position.remainingQty += quantity;
        position.totalBuyCost += quantity * price + (commission || 0);
        position.totalRightsExerciseCost += quantity * price + (commission || 0);
        position.totalBoughtQty += quantity;
        position.totalBoughtValue += quantity * price + (commission || 0);
        break;
      }
      case "rights_sell": {
        position.totalRightsSellRevenue += amount;
        position.totalBuyCost -= amount; 
        break;
      }
      case "revaluation": {
        if (revaluation_percentage > 0) {
          const newQtyMultiplier = 1 + revaluation_percentage / 100;
          position.remainingQty = position.remainingQty * newQtyMultiplier;
          position.totalBoughtQty = position.totalBoughtQty * newQtyMultiplier;
        }
        break;
      }
      case "premium": {
        if (premium_type === "cash_payment") {
          position.totalDividend += amount;
        } else if (premium_type === "bonus_shares") {
          position.remainingQty += quantity;
          position.totalBonusShares += quantity;
          position.totalBoughtQty += quantity;
        }
        break;
      }
      default:
        console.warn(`نوع رویداد ناشناخته: ${type}`);
    }

    if (position.remainingQty > 0) {
      position.currentPrice = currentPrice;
      position.currentValue = position.remainingQty * currentPrice;
      position.avgBuyPriceAdjusted = position.totalBuyCost / position.remainingQty;
      position.unrealizedPL = position.currentValue - position.remainingQty * position.avgBuyPriceAdjusted;
    } else {
      position.currentPrice = 0;
      position.currentValue = 0;
      position.unrealizedPL = 0;
    }
  });

  const finalOpenPositions = [];
  openPositionsMap.forEach((position) => {
    position.avgBuyPriceAdjusted =
      position.remainingQty > 0
        ? position.totalBuyCost / position.remainingQty
        : 0;
    position.unrealizedPL =
      position.remainingQty > 0
        ? position.currentValue -
          position.remainingQty * position.avgBuyPriceAdjusted
        : 0;
    position.totalPLWithDividend =
      position.totalRealizedPL +
      position.totalDividend +
      position.totalRightsSellRevenue +
      position.unrealizedPL;
    
    const totalInvestment = position.totalBoughtValue;
    position.percentagePL =
      totalInvestment > 0
        ? (position.totalPLWithDividend / totalInvestment) * 100
        : 0;
    
    position.avgBoughtPrice =
      position.totalBoughtQty > 0
        ? position.totalBoughtValue / position.totalBoughtQty
        : 0;
    position.avgSoldPrice =
      position.totalSoldQty > 0
        ? position.totalSoldValue / position.totalSoldQty
        : 0;

    if (position.remainingQty > 0.001) { // برای جلوگیری از نمایش پوزیشن‌های با تعداد بسیار کم (خطای محاسباتی)
      finalOpenPositions.push(position);
    } else {
      closedPositions.push(position);
    }
  });

  finalOpenPositions.sort((a, b) => b.symbol.localeCompare(a.symbol));
  closedPositions.sort((a, b) => b.symbol.localeCompare(a.symbol));

  return { openPositions: finalOpenPositions, closedPositions };
};
