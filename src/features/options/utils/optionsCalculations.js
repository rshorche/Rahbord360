const MS_IN_DAY = 1000 * 60 * 60 * 24;

export const calculateOptionMetrics = (position, underlyingPrice = 0, optionPrice = 0) => {
    const contracts = Number(position.contracts_count) || 0;
    const premium = Number(position.premium) || 0;
    const commission = Number(position.commission) || 0;
    const strike = Number(position.strike_price) || 0;
    const tradeType = position.trade_type;

    let costBasis = (premium * contracts * 1000) + commission;
    if (tradeType.includes('sell')) {
        costBasis = -costBasis; // Credit received
    }

    const currentValue = optionPrice * contracts * 1000;
    const unrealizedPL = tradeType.includes('buy') ? currentValue - costBasis : costBasis - currentValue;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expirationDate = new Date(position.expiration_date);
    const daysToExpiration = Math.ceil((expirationDate - today) / MS_IN_DAY);

    let breakEven;
    if (position.option_type === 'call') {
        breakEven = strike + (premium / 1000);
    } else {
        breakEven = strike - (premium / 1000);
    }

    return {
        ...position,
        cost_basis: costBasis,
        current_value: currentValue,
        unrealized_pl: unrealizedPL,
        days_to_expiration: daysToExpiration,
        break_even_price: breakEven,
        current_option_price: optionPrice,
    };
};