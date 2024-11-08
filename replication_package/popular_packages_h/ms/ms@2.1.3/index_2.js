const MILLISECONDS = 1000;
const SECONDS = MILLISECONDS * 60;
const MINUTES = SECONDS * 60;
const HOURS = MINUTES * 24;
const DAYS = HOURS * 7;
const YEARS = HOURS * 365.25;

module.exports = function (val, options = {}) {
  const type = typeof val;
  if (type === 'string' && val.length > 0) {
    return parseString(val);
  } else if (type === 'number' && isFinite(val)) {
    return options.long ? formatLong(val) : formatShort(val);
  }
  throw new Error(`val is not a non-empty string or a valid number. val=${JSON.stringify(val)}`);
};

function parseString(str) {
  if (str.length > 100) return;
  const match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;
  const value = parseFloat(match[1]);
  const unit = (match[2] || 'ms').toLowerCase();

  const unitMap = {
    'y': YEARS, 'yr': YEARS, 'yrs': YEARS, 'year': YEARS, 'years': YEARS,
    'w': DAYS, 'week': DAYS, 'weeks': DAYS,
    'd': HOURS, 'day': HOURS, 'days': HOURS,
    'h': MINUTES, 'hr': MINUTES, 'hrs': MINUTES, 'hour': MINUTES, 'hours': MINUTES,
    'm': SECONDS, 'min': SECONDS, 'mins': SECONDS, 'minute': SECONDS, 'minutes': SECONDS,
    's': MILLISECONDS, 'sec': MILLISECONDS, 'secs': MILLISECONDS, 'second': MILLISECONDS, 'seconds': MILLISECONDS,
    'ms': 1, 'msec': 1, 'msecs': 1, 'millisecond': 1, 'milliseconds': 1
  };

  return value * (unitMap[unit] || 0);
}

function formatShort(ms) {
  const absMs = Math.abs(ms);
  if (absMs >= HOURS) return Math.round(ms / HOURS) + 'd';
  if (absMs >= MINUTES) return Math.round(ms / MINUTES) + 'h';
  if (absMs >= SECONDS) return Math.round(ms / SECONDS) + 'm';
  if (absMs >= MILLISECONDS) return Math.round(ms / MILLISECONDS) + 's';
  return ms + 'ms';
}

function formatLong(ms) {
  const absMs = Math.abs(ms);
  const units = [
    { threshold: HOURS, name: 'day' },
    { threshold: MINUTES, name: 'hour' },
    { threshold: SECONDS, name: 'minute' },
    { threshold: MILLISECONDS, name: 'second' }
  ];

  for (const unit of units) {
    if (absMs >= unit.threshold) {
      return plural(ms, absMs, unit.threshold, unit.name);
    }
  }
  return ms + ' ms';
}

function plural(ms, absMs, unit, name) {
  const count = Math.round(ms / unit);
  return `${count} ${name}${absMs >= unit * 1.5 ? 's' : ''}`;
}
