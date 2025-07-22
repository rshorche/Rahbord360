const MS_IN_DAY = 1000 * 60 * 60 * 24;

export const calculateOptionMetrics = (position, optionPrice = 0) => {
    const contracts = Number(position.contracts_count) || 0;
    const strike = Number(position.strike_price) || 0;
    const costBasis = Number(position.total_cost) || 0;

    const currentOptionPrice = optionPrice > 0 ? optionPrice : position.avg_premium;
    
    const currentValue = currentOptionPrice * contracts * 1000;

    const unrealizedPL = currentValue - costBasis;

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

    if (position.status === 'CLOSED' && position.total_initial_cost !== 0) {
        position.realized_pl_percent = (position.realized_pl / Math.abs(position.total_initial_cost)) * 100;
    } else {
        position.realized_pl_percent = 0;
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
  
  const sortedTrades = [...trades].sort((a, b) => {
    const dateA = new Date(a.trade_date);
    const dateB = new Date(b.trade_date);
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    const createdAtA = new Date(a.created_at);
    const createdAtB = new Date(b.created_at);
    return createdAtA - createdAtB;
  });
  
  sortedTrades.forEach(trade => {
    const symbol = trade.option_symbol;
    if (!positions.has(symbol)) {
      positions.set(symbol, {
        ...trade, 
        net_contracts: 0,
        total_cost: 0,
        realized_pl: 0,
        total_initial_cost: 0,
        history: [],
      });
    }

    const position = positions.get(symbol);

    const tradeContracts = Number(trade.contracts_count) || 0;
    const tradeValue = (Number(trade.premium) || 0) * tradeContracts * 1000;
    const tradeCommission = Number(trade.commission) || 0;
    
    const costMultiplier = trade.trade_type.includes('buy') ? 1 : -1;

    if (trade.trade_type.includes('open')) {
        position.net_contracts += tradeContracts * costMultiplier;
        const costOfOpening = (tradeValue * costMultiplier) + tradeCommission;
        position.total_cost += costOfOpening;
        position.total_initial_cost += costOfOpening;
    } else { 
        const contractsBeforeClose = position.net_contracts;
        const costBeforeClose = position.total_cost;
        
        const avgCostPerContract = contractsBeforeClose !== 0 ? costBeforeClose / contractsBeforeClose : 0;
        const costOfContractsClosed = avgCostPerContract * tradeContracts * (costMultiplier * -1);
        
        const revenueFromClosing = (tradeValue * costMultiplier * -1) - tradeCommission;
        const realizedPlForThisTrade = revenueFromClosing - costOfContractsClosed;
        
        trade.realized_pl_on_close = realizedPlForThisTrade;
        position.realized_pl += realizedPlForThisTrade;
        
        position.net_contracts -= tradeContracts * (costMultiplier * -1);
        position.total_cost -= costOfContractsClosed;
    }
    
    position.history.push(trade);
  });
  
  const allPositions = Array.from(positions.values()).map(p => {
    p.history.sort((a, b) => {
        const dateA = new Date(a.trade_date);
        const dateB = new Date(b.trade_date);
        if (dateA > dateB) return -1;
        if (dateA < dateB) return 1;
        const createdAtA = new Date(a.created_at);
        const createdAtB = new Date(b.created_at);
        return createdAtB - createdAtA;
    });

    p.status = Math.abs(p.net_contracts) < 0.001 ? 'CLOSED' : 'OPEN';
    p.position_type = p.net_contracts > 0 ? 'Long' : (p.net_contracts < 0 ? 'Short' : '---');
    p.contracts_count = p.net_contracts;
    p.total_cost = p.status === 'CLOSED' ? 0 : p.total_cost;
    
    p.avg_premium = p.net_contracts !== 0 ? Math.abs(p.total_cost / p.net_contracts / 1000) : 0;
    
    const optionPriceData = priceHistory.get(p.option_symbol);
    const optionPrice = optionPriceData ? optionPriceData.price / 10 : 0;
    const metrics = calculateOptionMetrics(p, optionPrice);
    
    return { ...p, ...metrics };
  });

  return {
    openPositions: allPositions.filter(p => p.status === 'OPEN'),
    historyPositions: allPositions.filter(p => p.status === 'CLOSED'),
  };
};