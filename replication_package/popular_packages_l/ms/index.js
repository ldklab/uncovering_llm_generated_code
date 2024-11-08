const timeUnits = {
  'y': 1000 * 60 * 60 * 24 * 365.25, // milliseconds in a year
  'd': 1000 * 60 * 60 * 24,          // milliseconds in a day
  'h': 1000 * 60 * 60,               // milliseconds in an hour
  'm': 1000 * 60,                    // milliseconds in a minute
  's': 1000,                         // milliseconds in a second
  'ms': 1                            // milliseconds
};

function ms(input, options = {}) {
  if (typeof input === 'string') {
    return parseString(input);
  } else if (typeof input === 'number') {
    return options.long ? formatLong(input) : formatShort(input);
  }
  throw new Error('Invalid input type');
}

function parseString(str) {
  str = String(str);
  const match = /^(-?\d*\.?\d+)\s*(ms|s|m|h|d|y)?$/.exec(str.trim());
  if (!match) {
    throw new Error('Invalid time string');
  }
  const number = parseFloat(match[1]);
  const unit = match[2] || 'ms';
  const multiplier = timeUnits[unit];
  if (multiplier === undefined) {
    throw new Error('Invalid time unit');
  }
  return number * multiplier;
}

function formatShort(milliseconds) {
  const absMilliseconds = Math.abs(milliseconds);
  for (let unit of ['y', 'd', 'h', 'm', 's', 'ms']) {
    const unitValue = timeUnits[unit];
    if (absMilliseconds >= unitValue) {
      const value = (milliseconds / unitValue).toFixed(0);
      return value + unit;
    }
  }
  return String(milliseconds) + 'ms';
}

function formatLong(milliseconds) {
  const absMilliseconds = Math.abs(milliseconds);
  for (let unit of ['y', 'd', 'h', 'm', 's', 'ms']) {
    const unitValue = timeUnits[unit];
    if (absMilliseconds >= unitValue) {
      const value = (milliseconds / unitValue).toFixed(0);
      const singular = value === '1';
      const unitLabel = { y: 'year', d: 'day', h: 'hour', m: 'minute', s: 'second', ms: 'millisecond' }[unit];
      return value + ' ' + unitLabel + (singular ? '' : 's');
    }
  }
  return String(milliseconds) + ' milliseconds';
}

module.exports = ms;
