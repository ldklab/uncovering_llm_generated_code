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
    return options.long ? formatMilliseconds(input, true) : formatMilliseconds(input, false);
  }
  throw new Error('Invalid input type');
}

function parseString(str) {
  const match = /^(-?\d*\.?\d+)\s*(ms|s|m|h|d|y)?$/.exec(str.trim());
  if (!match) throw new Error('Invalid time string');

  const number = parseFloat(match[1]);
  const unit = match[2] || 'ms';

  const multiplier = timeUnits[unit];
  if (!multiplier) throw new Error('Invalid time unit');

  return number * multiplier;
}

function formatMilliseconds(milliseconds, longFormat) {
  const absMilliseconds = Math.abs(milliseconds);
  const units = ['y', 'd', 'h', 'm', 's', 'ms'];

  for (let unit of units) {
    const unitValue = timeUnits[unit];
    if (absMilliseconds >= unitValue) {
      const value = (milliseconds / unitValue).toFixed(0);
      if (longFormat) {
        const unitLabel = { y: 'year', d: 'day', h: 'hour', m: 'minute', s: 'second', ms: 'millisecond' };
        return value + ' ' + unitLabel[unit] + (value === '1' ? '' : 's');
      }
      return value + unit;
    }
  }
  return String(milliseconds) + (longFormat ? ' milliseconds' : 'ms');
}

module.exports = ms;
