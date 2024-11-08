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
  str = String(str).trim();
  const match = /^(-?\d*\.?\d+)\s*(ms|s|m|h|d|y)?$/.exec(str);
  if (!match) throw new Error('Invalid time string');

  const number = parseFloat(match[1]);
  const unit = match[2] || 'ms';
  const multiplier = timeUnits[unit];

  if (multiplier === undefined) throw new Error('Invalid time unit');

  return number * multiplier;
}

function formatShort(milliseconds) {
  return formatMilliseconds(milliseconds, false);
}

function formatLong(milliseconds) {
  return formatMilliseconds(milliseconds, true);
}

function formatMilliseconds(milliseconds, longFormat) {
  const absMilliseconds = Math.abs(milliseconds);
  
  for (let unitKey of Object.keys(timeUnits)) {
    const unitValue = timeUnits[unitKey];
    if (absMilliseconds >= unitValue) {
      const value = (milliseconds / unitValue).toFixed(0);
      if (longFormat) {
        const unitNames = {
          y: 'year', d: 'day', h: 'hour', m: 'minute', s: 'second', ms: 'millisecond'
        };
        const singular = value === '1';
        return `${value} ${unitNames[unitKey]}${singular ? '' : 's'}`;
      } else {
        return `${value}${unitKey}`;
      }
    }
  }
  
  const defaultUnit = longFormat ? ' milliseconds' : 'ms';
  return `${milliseconds}${defaultUnit}`;
}

module.exports = ms;
