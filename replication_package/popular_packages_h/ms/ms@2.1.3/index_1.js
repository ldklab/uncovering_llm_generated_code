const SECOND_IN_MS = 1000;
const MINUTE_IN_MS = SECOND_IN_MS * 60;
const HOUR_IN_MS = MINUTE_IN_MS * 60;
const DAY_IN_MS = HOUR_IN_MS * 24;
const WEEK_IN_MS = DAY_IN_MS * 7;
const YEAR_IN_MS = DAY_IN_MS * 365.25;

module.exports = function(val, options = {}) {
  if (typeof val === 'string' && val.trim()) {
    return parseDurationString(val);
  } else if (typeof val === 'number' && isFinite(val)) {
    return options.long ? formatLong(val) : formatShort(val);
  }
  throw new Error(`val is not a non-empty string or a valid number. val=${JSON.stringify(val)}`);
};

function parseDurationString(str) {
  str = str.trim();
  if (str.length > 100) return;

  const match = /^(-?(?:\d+)?\.?\d+)\s*(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(str);
  if (!match) return;

  const n = parseFloat(match[1]);
  const unit = (match[2] || 'ms').toLowerCase();

  switch (unit) {
    case 'years': case 'year': case 'yrs': case 'yr': case 'y':
      return n * YEAR_IN_MS;
    case 'weeks': case 'week': case 'w':
      return n * WEEK_IN_MS;
    case 'days': case 'day': case 'd':
      return n * DAY_IN_MS;
    case 'hours': case 'hour': case 'hrs': case 'hr': case 'h':
      return n * HOUR_IN_MS;
    case 'minutes': case 'minute': case 'mins': case 'min': case 'm':
      return n * MINUTE_IN_MS;
    case 'seconds': case 'second': case 'secs': case 'sec': case 's':
      return n * SECOND_IN_MS;
    case 'milliseconds': case 'millisecond': case 'msecs': case 'msec': case 'ms':
      return n;
    default:
      return undefined;
  }
}

function formatShort(ms) {
  const absMs = Math.abs(ms);
  if (absMs >= DAY_IN_MS) {
    return `${Math.round(ms / DAY_IN_MS)}d`;
  }
  if (absMs >= HOUR_IN_MS) {
    return `${Math.round(ms / HOUR_IN_MS)}h`;
  }
  if (absMs >= MINUTE_IN_MS) {
    return `${Math.round(ms / MINUTE_IN_MS)}m`;
  }
  if (absMs >= SECOND_IN_MS) {
    return `${Math.round(ms / SECOND_IN_MS)}s`;
  }
  return `${ms}ms`;
}

function formatLong(ms) {
  const absMs = Math.abs(ms);
  if (absMs >= DAY_IN_MS) {
    return formatPlural(ms, absMs, DAY_IN_MS, 'day');
  }
  if (absMs >= HOUR_IN_MS) {
    return formatPlural(ms, absMs, HOUR_IN_MS, 'hour');
  }
  if (absMs >= MINUTE_IN_MS) {
    return formatPlural(ms, absMs, MINUTE_IN_MS, 'minute');
  }
  if (absMs >= SECOND_IN_MS) {
    return formatPlural(ms, absMs, SECOND_IN_MS, 'second');
  }
  return `${ms} ms`;
}

function formatPlural(ms, absMs, unit, label) {
  const pluralSuffix = absMs >= unit * 1.5 ? 's' : '';
  return `${Math.round(ms / unit)} ${label}${pluralSuffix}`;
}
