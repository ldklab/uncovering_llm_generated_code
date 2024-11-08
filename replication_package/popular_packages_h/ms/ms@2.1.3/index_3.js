const MILLISECONDS_IN = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
  WEEK: 7 * 24 * 60 * 60 * 1000,
  YEAR: 365.25 * 24 * 60 * 60 * 1000
};

module.exports = function (val, options = {}) {
  const type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parse(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? formatLong(val) : formatShort(val);
  }
  throw new Error(`val is not a non-empty string or a valid number. val=${JSON.stringify(val)}`);
};

function parse(str) {
  if (str.length > 100) return;
  
  const match = /^(-?(?:\d+)?\.?\d+)\s*(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;

  const num = parseFloat(match[1]);
  const unit = (match[2] || 'ms').toLowerCase();

  switch (unit) {
    case 'year':
    case 'years':
    case 'yrs':
    case 'yr':
    case 'y':
      return num * MILLISECONDS_IN.YEAR;
    case 'week':
    case 'weeks':
    case 'w':
      return num * MILLISECONDS_IN.WEEK;
    case 'day':
    case 'days':
    case 'd':
      return num * MILLISECONDS_IN.DAY;
    case 'hour':
    case 'hours':
    case 'hrs':
    case 'hr':
    case 'h':
      return num * MILLISECONDS_IN.HOUR;
    case 'minute':
    case 'minutes':
    case 'mins':
    case 'min':
    case 'm':
      return num * MILLISECONDS_IN.MINUTE;
    case 'second':
    case 'seconds':
    case 'secs':
    case 'sec':
    case 's':
      return num * MILLISECONDS_IN.SECOND;
    case 'millisecond':
    case 'milliseconds':
    case 'msecs':
    case 'msec':
    case 'ms':
      return num;
    default:
      return;
  }
}

function formatShort(ms) {
  const absMs = Math.abs(ms);
  if (absMs >= MILLISECONDS_IN.DAY) {
    return Math.round(ms / MILLISECONDS_IN.DAY) + 'd';
  }
  if (absMs >= MILLISECONDS_IN.HOUR) {
    return Math.round(ms / MILLISECONDS_IN.HOUR) + 'h';
  }
  if (absMs >= MILLISECONDS_IN.MINUTE) {
    return Math.round(ms / MILLISECONDS_IN.MINUTE) + 'm';
  }
  if (absMs >= MILLISECONDS_IN.SECOND) {
    return Math.round(ms / MILLISECONDS_IN.SECOND) + 's';
  }
  return ms + 'ms';
}

function formatLong(ms) {
  const absMs = Math.abs(ms);
  if (absMs >= MILLISECONDS_IN.DAY) {
    return pluralize(ms, absMs, MILLISECONDS_IN.DAY, 'day');
  }
  if (absMs >= MILLISECONDS_IN.HOUR) {
    return pluralize(ms, absMs, MILLISECONDS_IN.HOUR, 'hour');
  }
  if (absMs >= MILLISECONDS_IN.MINUTE) {
    return pluralize(ms, absMs, MILLISECONDS_IN.MINUTE, 'minute');
  }
  if (absMs >= MILLISECONDS_IN.SECOND) {
    return pluralize(ms, absMs, MILLISECONDS_IN.SECOND, 'second');
  }
  return ms + ' ms';
}

function pluralize(ms, absMs, millisecondsInUnit, unitName) {
  const isPlural = absMs >= millisecondsInUnit * 1.5;
  return Math.round(ms / millisecondsInUnit) + ' ' + unitName + (isPlural ? 's' : '');
}
