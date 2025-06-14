export const processPortfolio = (actions, allSymbolsData) => {
  const openPositionsMap = new Map();
  const closedPositions = [];

  // تعریف ثابت برای تقسیم قیمت‌ها
  const PRICE_DIVISOR = 10; //

  const symbolLatestPrices = new Map();
  allSymbolsData.forEach((s) => {
    if (s.l18 && s.pl !== undefined && s.pl !== null) {
      symbolLatestPrices.set(s.l18, s.pl / PRICE_DIVISOR); //
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
        `Action with ID ${id} is missing a symbol and will be skipped.`
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

    const currentPrice = symbolLatestPrices.get(symbol) || 0; //

    switch (type) {
      case "buy": {
        const convertedPrice = price / PRICE_DIVISOR; //
        const convertedCommission = commission / PRICE_DIVISOR; //
        position.remainingQty += quantity;
        position.totalBuyCost +=
          quantity * convertedPrice + (convertedCommission || 0); //
        position.totalBoughtQty += quantity; //
        position.totalBoughtValue +=
          quantity * convertedPrice + (convertedCommission || 0); //
        if (!position.firstBuyDate) {
          position.firstBuyDate = date; //
        }
        break;
      }
      case "sell": {
        const convertedPrice = price / PRICE_DIVISOR; //
        const convertedCommission = commission / PRICE_DIVISOR; //
        position.remainingQty -= quantity;
        position.totalSellRevenue +=
          quantity * convertedPrice - (convertedCommission || 0); //
        position.totalSoldQty += quantity; //
        position.totalSoldValue +=
          quantity * convertedPrice - (convertedCommission || 0); //
        const avgCostBeforeSell =
          position.remainingQty + quantity > 0
            ? position.totalBuyCost / (position.remainingQty + quantity)
            : 0; //
        position.totalRealizedPL +=
          quantity * convertedPrice -
          (convertedCommission || 0) -
          quantity * avgCostBeforeSell; //
        break;
      }
      case "dividend": {
        position.totalDividend += amount / PRICE_DIVISOR; //
        break;
      }
      case "bonus": {
        position.remainingQty += quantity; //
        position.totalBonusShares += quantity; //
        position.totalBoughtQty += quantity; //
        break;
      }
      case "rights_exercise": {
        const convertedPrice = price / PRICE_DIVISOR; //
        const convertedCommission = commission / PRICE_DIVISOR; //
        position.remainingQty += quantity;
        position.totalBuyCost +=
          quantity * convertedPrice + (convertedCommission || 0); //
        position.totalRightsExerciseCost +=
          quantity * convertedPrice + (convertedCommission || 0); //
        position.totalBoughtQty += quantity; //
        position.totalBoughtValue +=
          quantity * convertedPrice + (convertedCommission || 0); //
        break;
      }
      case "rights_sell": {
        position.totalRightsSellRevenue += amount / PRICE_DIVISOR; //
        position.totalRealizedPL += amount / PRICE_DIVISOR; //
        break;
      }
      case "revaluation": {
        if (revaluation_percentage > 0) {
          const newQtyMultiplier = 1 + revaluation_percentage / 100; //
          position.remainingQty = position.remainingQty * newQtyMultiplier; //
          position.totalBoughtQty = position.totalBoughtQty * newQtyMultiplier; //
        }
        break;
      }
      case "premium": {
        if (premium_type === "cash_payment") {
          position.totalDividend += amount / PRICE_DIVISOR; //
        } else if (premium_type === "bonus_shares") {
          position.remainingQty += quantity; //
          position.totalBonusShares += quantity; //
          position.totalBoughtQty += quantity; //
        }
        break;
      }
      default:
        console.warn(`Unknown action type: ${type}`); //
    }

    position.avgBuyPriceAdjusted =
      position.remainingQty > 0
        ? position.totalBuyCost / position.remainingQty
        : 0; //
    if (position.remainingQty > 0) {
      position.currentPrice = currentPrice; //
      position.currentValue = position.remainingQty * currentPrice; //
      position.unrealizedPL =
        position.currentValue -
        position.remainingQty * position.avgBuyPriceAdjusted; //
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
        : 0; //
    position.unrealizedPL =
      position.remainingQty > 0
        ? position.currentValue -
          position.remainingQty * position.avgBuyPriceAdjusted
        : 0; //
    position.totalPLWithDividend =
      position.totalRealizedPL +
      position.totalDividend +
      position.totalRightsSellRevenue +
      position.unrealizedPL; //
    const totalInvestment = position.totalBoughtValue; //
    position.percentagePL =
      totalInvestment > 0
        ? (position.totalPLWithDividend / totalInvestment) * 100
        : 0; //
    position.avgBoughtPrice =
      position.totalBoughtQty > 0
        ? position.totalBoughtValue / position.totalBoughtQty
        : 0; //
    position.avgSoldPrice =
      position.totalSoldQty > 0
        ? position.totalSoldValue / position.totalSoldQty
        : 0; //

    if (position.remainingQty > 0) {
      finalOpenPositions.push(position); //
    } else {
      closedPositions.push(position); //
    }
  });

  finalOpenPositions.sort((a, b) => b.symbol.localeCompare(a.symbol)); //
  closedPositions.sort((a, b) => b.symbol.localeCompare(a.symbol)); //

  return { openPositions: finalOpenPositions, closedPositions }; //
};
