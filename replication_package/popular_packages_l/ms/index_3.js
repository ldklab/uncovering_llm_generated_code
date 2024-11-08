const timeUnits = {
  'y': 1000 * 60 * 60 * 24 * 365.25,
  'd': 1000 * 60 * 60 * 24,
  'h': 1000 * 60 * 60,
  'm': 1000 * 60,
  's': 1000,
  'ms': 1
};

const ms = (input, options = {}) => {
  if (typeof input === 'string') {
    return parseString(input);
  } else if (typeof input === 'number') {
    return options.long ? formatLong(input) : formatShort(input);
  }
  throw new Error('Invalid input type');
};

const parseString = (str) => {
  const match = /^(-?\d*\.?\d+)\s*(ms|s|m|h|d|y)?$/.exec(str.trim());
  if (!match) throw new Error('Invalid time string');

  const number = parseFloat(match[1]);
  const unit = match[2] || 'ms';
  const multiplier = timeUnits[unit];
  if (!multiplier) throw new Error('Invalid time unit');
  
  return number * multiplier;
};

const formatShort = (milliseconds) => {
  for (let unit of ['y', 'd', 'h', 'm', 's', 'ms']) {
    const unitValue = timeUnits[unit];
    if (Math.abs(milliseconds) >= unitValue) {
      return `${Math.round(milliseconds / unitValue)}${unit}`;
    }
  }
  return `${milliseconds}ms`;
};

const formatLong = (milliseconds) => {
  for (let unit of ['y', 'd', 'h', 'm', 's', 'ms']) {
    const unitValue = timeUnits[unit];
    if (Math.abs(milliseconds) >= unitValue) {
      const value = Math.round(milliseconds / unitValue);
      const unitLabel = { y: 'year', d: 'day', h: 'hour', m: 'minute', s: 'second', ms: 'millisecond' }[unit];
      return `${value} ${unitLabel}${value === 1 ? '' : 's'}`;
    }
  }
  return `${milliseconds} milliseconds`;
};

module.exports = ms;
