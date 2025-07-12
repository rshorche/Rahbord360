export const processFundTrades = (trades, fundPrices) => {
  const positions = new Map();

  const sortedTrades = [...trades].sort((a, b) => new Date(a.date) - new Date(b.date));

  sortedTrades.forEach(trade => {
    if (!positions.has(trade.symbol)) {
      positions.set(trade.symbol, {
        symbol: trade.symbol,
        fund_type: trade.fund_type,
        quantity: 0,
        total_cost: 0,
        realized_pl: 0,
        detailData: [],
      });
    }

    const position = positions.get(trade.symbol);
    position.detailData.push(trade);
    const tradeValue = trade.quantity * trade.price_per_unit;

    if (trade.trade_type === 'buy') {
      position.quantity += trade.quantity;
      position.total_cost += tradeValue;
    } else { // sell
      const avgCost = position.quantity > 0 ? position.total_cost / position.quantity : 0;
      const costOfSoldUnits = trade.quantity * avgCost;
      position.realized_pl += tradeValue - costOfSoldUnits;
      position.quantity -= trade.quantity;
      position.total_cost -= costOfSoldUnits;
    }
  });

  const allPositions = Array.from(positions.values());
  
  allPositions.forEach(p => {
    p.avg_buy_price = p.quantity > 0 ? p.total_cost / p.quantity : 0;
    // For now, we assume the last trade price is the current price.
    // In a real app, you would fetch live fund prices here.
    p.current_price = p.detailData[p.detailData.length - 1]?.price_per_unit || 0;
    p.current_value = p.quantity * p.current_price;
    p.unrealized_pl = p.current_value - p.total_cost;
    p.total_pl = p.realized_pl + p.unrealized_pl;
  });

  const openPositions = allPositions.filter(p => p.quantity > 0.001);
  const closedPositions = allPositions.filter(p => p.quantity <= 0.001);

  return { openPositions, closedPositions };
};