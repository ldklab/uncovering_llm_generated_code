'use strict';
const os = require('os');
const stdSerializers = require('pino-std-serializers');
const redaction = require('./lib/redaction');
const time = require('./lib/time');
const proto = require('./lib/proto');
const symbols = require('./lib/symbols');
const { 
  assertDefaultLevelFound, mappings, genLsCache 
} = require('./lib/levels');
const { 
  createArgsNormalizer, asChindings, final, stringify, 
  buildSafeSonicBoom, buildFormatters, noop 
} = require('./lib/tools');
const { version } = require('./lib/meta');
const {
  chindingsSym, redactFmtSym, serializersSym, timeSym,
  timeSliceIndexSym, streamSym, stringifySym, 
  stringifiersSym, setLevelSym, endSym, formatOptsSym, 
  messageKeySym, nestedKeySym, mixinSym, 
  useOnlyCustomLevelsSym, formattersSym, hooksSym
} = symbols;
const { epochTime, nullTime } = time;
const { pid } = process;
const hostname = os.hostname();
const defaultErrorSerializer = stdSerializers.err;

const defaultOptions = {
  level: 'info',
  messageKey: 'msg',
  nestedKey: null,
  enabled: true,
  prettyPrint: false,
  base: { pid, hostname },
  serializers: { err: defaultErrorSerializer },
  formatters: {
    bindings: (bindings) => bindings,
    level: (label, number) => ({ level: number })
  },
  hooks: { logMethod: undefined },
  timestamp: epochTime,
  name: undefined,
  redact: null,
  customLevels: null,
  levelKey: undefined,
  useOnlyCustomLevels: false
};

const normalize = createArgsNormalizer(defaultOptions);
const serializers = { ...stdSerializers };

function pino(...args) {
  const instance = {};
  const { opts, stream } = normalize(instance, ...args);
  const { 
    redact, crlf, serializers, timestamp, messageKey,
    nestedKey, base, name, level, customLevels,
    useLevelLabels, changeLevelName, levelKey, mixin,
    useOnlyCustomLevels, formatters, hooks
  } = opts;

  const allFormatters = buildFormatters(
    formatters.level, formatters.bindings, formatters.log
  );

  handleDeprecatedOptions(
    useLevelLabels, changeLevelName, levelKey, allFormatters
  );

  if (serializers[Symbol.for('pino.*')]) {
    process.emitWarning(
      'The pino.* serializer is deprecated, use the formatters.log options instead', 
      'Warning', 'PINODEP003'
    );
    allFormatters.log = serializers[Symbol.for('pino.*')];
  }

  ensureDefaultFormatters(allFormatters);

  const stringifiers = redact ? redaction(redact, stringify) : {};
  const formatOpts = redact
    ? { stringify: stringifiers[redactFmtSym] }
    : { stringify };
  const end = '}' + (crlf ? '\r\n' : '\n');
  const coreChindings = asChindings.bind(null, {
    [chindingsSym]: '',
    [serializersSym]: serializers,
    [stringifiersSym]: stringifiers,
    [stringifySym]: stringify,
    [formattersSym]: allFormatters
  });
  const chindings = base === null ? '' : 
    (name === undefined ? coreChindings(base) : coreChindings({ ...base, name }));
  const time = (timestamp instanceof Function) ? timestamp : 
    (timestamp ? epochTime : nullTime);
  const timeSliceIndex = time().indexOf(':') + 1;

  ensureRequiredOptions(useOnlyCustomLevels, customLevels, mixin);

  const levels = mappings(customLevels, useOnlyCustomLevels);
  assignInstanceProperties(
    instance, levels, useOnlyCustomLevels, stream, time,
    timeSliceIndex, stringify, stringifiers, end, formatOpts,
    messageKey, nestedKey, serializers, mixin, chindings, 
    allFormatters, hooks
  );

  Object.setPrototypeOf(instance, proto());
  genLsCache(instance);
  instance[setLevelSym](level);

  return instance;
}

function handleDeprecatedOptions(
  useLevelLabels, changeLevelName, levelKey, allFormatters
) {
  if (useLevelLabels && !(changeLevelName || levelKey)) {
    process.emitWarning(
      'useLevelLabels is deprecated, use the formatters.level option instead', 
      'Warning', 'PINODEP001'
    );
    allFormatters.level = labelsFormatter;
  } else if ((changeLevelName || levelKey) && !useLevelLabels) {
    process.emitWarning(
      'changeLevelName and levelKey are deprecated, use the formatters.level option instead', 
      'Warning', 'PINODEP002'
    );
    allFormatters.level = levelNameFormatter(changeLevelName || levelKey);
  } else if ((changeLevelName || levelKey) && useLevelLabels) {
    process.emitWarning(
      'useLevelLabels is deprecated, use the formatters.level option instead', 
      'Warning', 'PINODEP001'
    );
    process.emitWarning(
      'changeLevelName and levelKey are deprecated, use the formatters.level option instead', 
      'Warning', 'PINODEP002'
    );
    allFormatters.level = levelNameLabelFormatter(changeLevelName || levelKey);
  }
}

function ensureDefaultFormatters(allFormatters) {
  if (!allFormatters.bindings) {
    allFormatters.bindings = defaultOptions.formatters.bindings;
  }
  if (!allFormatters.level) {
    allFormatters.level = defaultOptions.formatters.level;
  }
}

function ensureRequiredOptions(useOnlyCustomLevels, customLevels, mixin) {
  if (useOnlyCustomLevels && !customLevels) {
    throw Error('customLevels is required if useOnlyCustomLevels is set true');
  }
  if (mixin && typeof mixin !== 'function') {
    throw Error(`Unknown mixin type "${typeof mixin}" - expected "function"`);
  }
}

function assignInstanceProperties(
  instance, levels, useOnlyCustomLevels, stream, time, 
  timeSliceIndex, stringify, stringifiers, end, formatOpts,
  messageKey, nestedKey, serializers, mixin, chindings, 
  formatters, hooks
) {
  Object.assign(instance, {
    levels,
    [useOnlyCustomLevelsSym]: useOnlyCustomLevels,
    [streamSym]: stream,
    [timeSym]: time,
    [timeSliceIndexSym]: timeSliceIndex,
    [stringifySym]: stringify,
    [stringifiersSym]: stringifiers,
    [endSym]: end,
    [formatOptsSym]: formatOpts,
    [messageKeySym]: messageKey,
    [nestedKeySym]: nestedKey,
    [serializersSym]: serializers,
    [mixinSym]: mixin,
    [chindingsSym]: chindings,
    [formattersSym]: formatters,
    [hooksSym]: hooks,
    silent: noop
  });
}

function labelsFormatter(label, number) {
  return { level: label };
}

function levelNameFormatter(name) {
  return (label, number) => ({ [name]: number });
}

function levelNameLabelFormatter(name) {
  return (label, number) => ({ [name]: label });
}

module.exports = pino;

module.exports.extreme = (dest = process.stdout.fd) => {
  process.emitWarning(
    'The pino.extreme() option is deprecated and will be removed in v7. Use pino.destination({ sync: false }) instead.',
    { code: 'extreme_deprecation' }
  );
  return buildSafeSonicBoom({ dest, minLength: 4096, sync: false });
};

module.exports.destination = (dest = process.stdout.fd) => {
  if (typeof dest === 'object') {
    dest.dest = dest.dest || process.stdout.fd;
    return buildSafeSonicBoom(dest);
  } else {
    return buildSafeSonicBoom({ dest, minLength: 0, sync: true });
  }
};

module.exports.final = final;
module.exports.levels = mappings();
module.exports.stdSerializers = serializers;
module.exports.stdTimeFunctions = { ...time };
module.exports.symbols = symbols;
module.exports.version = version;

module.exports.default = pino;
module.exports.pino = pino;
