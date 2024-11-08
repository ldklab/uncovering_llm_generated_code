const MS_PER_SECOND = 1000;
const MS_PER_MINUTE = MS_PER_SECOND * 60;
const MS_PER_HOUR = MS_PER_MINUTE * 60;
const MS_PER_DAY = MS_PER_HOUR * 24;
const MS_PER_WEEK = MS_PER_DAY * 7;
const MS_PER_YEAR = MS_PER_DAY * 365.25;

module.exports = function(val, options = {}) {
  const type = typeof val;
  if (type === 'string' && val.trim()) {
    return parseDuration(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? formatLong(val) : formatShort(val);
  }
  throw new Error(`val is not a non-empty string or a valid number. val=${JSON.stringify(val)}`);
};

function parseDuration(str) {
  if (str.length > 100) return;
  const match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  const n = parseFloat(match[1]);
  const unit = (match[2] || 'ms').toLowerCase();
  switch (unit) {
    case 'y':
    case 'yr':
    case 'yrs':
    case 'year':
    case 'years': return n * MS_PER_YEAR;
    case 'w':
    case 'week':
    case 'weeks': return n * MS_PER_WEEK;
    case 'd':
    case 'day':
    case 'days': return n * MS_PER_DAY;
    case 'h':
    case 'hr':
    case 'hrs':
    case 'hour':
    case 'hours': return n * MS_PER_HOUR;
    case 'm':
    case 'min':
    case 'mins':
    case 'minute':
    case 'minutes': return n * MS_PER_MINUTE;
    case 's':
    case 'sec':
    case 'secs':
    case 'second':
    case 'seconds': return n * MS_PER_SECOND;
    case 'ms':
    case 'msec':
    case 'msecs':
    case 'millisecond':
    case 'milliseconds': return n;
    default: return undefined;
  }
}

function formatShort(ms) {
  const absMs = Math.abs(ms);
  if (absMs >= MS_PER_DAY) return Math.round(ms / MS_PER_DAY) + 'd';
  if (absMs >= MS_PER_HOUR) return Math.round(ms / MS_PER_HOUR) + 'h';
  if (absMs >= MS_PER_MINUTE) return Math.round(ms / MS_PER_MINUTE) + 'm';
  if (absMs >= MS_PER_SECOND) return Math.round(ms / MS_PER_SECOND) + 's';
  return ms + 'ms';
}

function formatLong(ms) {
  const absMs = Math.abs(ms);
  if (absMs >= MS_PER_DAY) return pluralize(ms, absMs, MS_PER_DAY, 'day');
  if (absMs >= MS_PER_HOUR) return pluralize(ms, absMs, MS_PER_HOUR, 'hour');
  if (absMs >= MS_PER_MINUTE) return pluralize(ms, absMs, MS_PER_MINUTE, 'minute');
  if (absMs >= MS_PER_SECOND) return pluralize(ms, absMs, MS_PER_SECOND, 'second');
  return ms + ' ms';
}

function pluralize(ms, absMs, unit, name) {
  const isPlural = absMs >= unit * 1.5;
  return Math.round(ms / unit) + ' ' + name + (isPlural ? 's' : '');
}
