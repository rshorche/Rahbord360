const MS_IN_DAY = 1000 * 60 * 60 * 24;

export const calculateOptionMetrics = (position, optionPrice = 0) => {
    const contracts = Number(position.contracts_count) || 0;
    const strike = Number(position.strike_price) || 0;
    const costBasis = Number(position.total_cost) || 0;

    const currentValue = optionPrice * contracts * 1000;
    const unrealizedPL = (contracts > 0) ? (currentValue - costBasis) : (costBasis + currentValue);
    const unrealizedPLPercent = costBasis !== 0 ? (unrealizedPL / Math.abs(costBasis)) * 100 : 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expirationDate = new Date(position.expiration_date);
    const daysToExpiration = Math.ceil((expirationDate - today) / MS_IN_DAY);

    let breakEven;
    if (position.option_type === 'call') {
        breakEven = strike + position.avg_premium;
    } else {
        breakEven = strike - position.avg_premium;
    }

    return {
        ...position,
        cost_basis: costBasis,
        current_value: currentValue,
        unrealized_pl: unrealizedPL,
        unrealized_pl_percent: unrealizedPLPercent,
        days_to_expiration: daysToExpiration,
        break_even_price: breakEven,
    };
};

export const processOptionsPositions = (trades, priceHistory) => {
  const positions = new Map();

  if (!trades || !Array.isArray(trades)) {
    return { openPositions: [], historyPositions: [] };
  }
  
  const sortedTrades = [...trades].sort((a, b) => new Date(a.trade_date) - new Date(b.trade_date));

  sortedTrades.forEach(trade => {
    const symbol = trade.option_symbol;
    if (!positions.has(symbol)) {
      positions.set(symbol, {
        ...trade, 
        net_contracts: 0,
        total_cost: 0,
        realized_pl: 0,
        history: [],
      });
    }

    const position = positions.get(symbol);
    position.history.push(trade);

    const tradeContracts = Number(trade.contracts_count) || 0;
    const tradeValue = (Number(trade.premium) || 0) * tradeContracts * 1000;
    const tradeCommission = Number(trade.commission) || 0;
    
    const avgCostPerContract = position.net_contracts !== 0 ? position.total_cost / position.net_contracts : 0;
    
    if (trade.trade_type.includes('open')) {
        const multiplier = trade.trade_type.includes('buy') ? 1 : -1;
        position.net_contracts += tradeContracts * multiplier;
        position.total_cost += ((tradeValue * multiplier) + tradeCommission);
    } else {
        const multiplier = trade.trade_type.includes('sell') ? 1 : -1;
        const costOfContractsClosed = avgCostPerContract * tradeContracts;
        position.realized_pl += ((tradeValue * multiplier) - tradeCommission) - costOfContractsClosed;
        position.net_contracts -= tradeContracts * multiplier;
        position.total_cost -= costOfContractsClosed;
    }
  });
  
  const allPositions = Array.from(positions.values()).map(p => {
    p.status = Math.abs(p.net_contracts) < 0.001 ? 'CLOSED' : 'OPEN';
    p.position_type = p.net_contracts > 0 ? 'Long' : (p.net_contracts < 0 ? 'Short' : '---');
    p.contracts_count = p.net_contracts;
    p.avg_premium = p.net_contracts !== 0 ? Math.abs(p.total_cost / p.net_contracts / 1000) : 0;
    
    const optionPrice = priceHistory.get(p.option_symbol)?.price / 10 || p.avg_premium;
    const metrics = calculateOptionMetrics(p, 0, optionPrice);
    
    return { ...p, ...metrics };
  });

  return {
    openPositions: allPositions.filter(p => p.status === 'OPEN'),
    historyPositions: allPositions.filter(p => p.status === 'CLOSED'),
  };
};