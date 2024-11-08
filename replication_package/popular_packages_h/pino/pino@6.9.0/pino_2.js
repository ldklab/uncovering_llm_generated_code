'use strict'

const os = require('os')
const stdSerializers = require('pino-std-serializers')
const redaction = require('./lib/redaction')
const time = require('./lib/time')
const proto = require('./lib/proto')
const symbols = require('./lib/symbols')
const { assertDefaultLevelFound, mappings, genLsCache } = require('./lib/levels')
const {
  createArgsNormalizer,
  asChindings,
  final,
  stringify,
  buildSafeSonicBoom,
  buildFormatters,
  noop
} = require('./lib/tools')
const { version } = require('./lib/meta')
const {
  chindingsSym,
  redactFmtSym,
  serializersSym,
  timeSym,
  timeSliceIndexSym,
  streamSym,
  stringifySym,
  stringifiersSym,
  setLevelSym,
  endSym,
  formatOptsSym,
  messageKeySym,
  nestedKeySym,
  mixinSym,
  useOnlyCustomLevelsSym,
  formattersSym,
  hooksSym
} = symbols
const { epochTime, nullTime } = time
const { pid } = process
const hostname = os.hostname()

const defaultOptions = {
  level: 'info',
  messageKey: 'msg',
  nestedKey: null,
  enabled: true,
  prettyPrint: false,
  base: { pid, hostname },
  serializers: { err: stdSerializers.err },
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
}

const normalize = createArgsNormalizer(defaultOptions)
const serializers = { ...stdSerializers }

function pino(...args) {
  const instance = {}
  const { opts, stream } = normalize(instance, ...args)
  const allFormatters = configureFormatters(opts)
  
  const stringifiers = opts.redact ? redaction(opts.redact, stringify) : {}
  const formatOpts = { stringify: opts.redact ? stringifiers[redactFmtSym] : stringify }
  const end = `}${opts.crlf ? '\r\n' : '\n'}`

  const chindings = createChindings(opts, instance, allFormatters)
  const time = setupTimeFunction(opts.timestamp)
  const timeSliceIndex = time().indexOf(':') + 1

  validateConfigs(opts)

  const levels = mappings(opts.customLevels, opts.useOnlyCustomLevels)

  Object.assign(instance, {
    levels,
    [useOnlyCustomLevelsSym]: opts.useOnlyCustomLevels,
    [streamSym]: stream,
    [timeSym]: time,
    [timeSliceIndexSym]: timeSliceIndex,
    [stringifySym]: stringify,
    [stringifiersSym]: stringifiers,
    [endSym]: end,
    [formatOptsSym]: formatOpts,
    [messageKeySym]: opts.messageKey,
    [nestedKeySym]: opts.nestedKey,
    [serializersSym]: opts.serializers,
    [mixinSym]: opts.mixin,
    [chindingsSym]: chindings,
    [formattersSym]: allFormatters,
    [hooksSym]: opts.hooks,
    silent: noop
  })

  Object.setPrototypeOf(instance, proto())
  genLsCache(instance)
  instance[setLevelSym](opts.level)

  return instance
}

function configureFormatters({ useLevelLabels, changeLevelName, levelKey, formatters, serializers }) {
  const allFormatters = buildFormatters(formatters.level, formatters.bindings, formatters.log)

  warnDeprecated(useLevelLabels, changeLevelName, levelKey)

  if (serializers[Symbol.for('pino.*')]) {
    warnSerializerDeprecation()
    allFormatters.log = serializers[Symbol.for('pino.*')]
  }

  allFormatters.bindings ||= defaultOptions.formatters.bindings
  allFormatters.level ||= defaultOptions.formatters.level

  return allFormatters
}

function warnDeprecated(useLevelLabels, changeLevelName, levelKey) {
  if (useLevelLabels && !(changeLevelName || levelKey)) {
    emitLevelLabelWarning('PINODEP001')
  } else if ((changeLevelName || levelKey) && !useLevelLabels) {
    emitLevelLabelWarning('PINODEP002')
  } else if ((changeLevelName || levelKey) && useLevelLabels) {
    emitLevelLabelWarning('PINODEP001')
    emitLevelLabelWarning('PINODEP002')
  }
}

function emitLevelLabelWarning(code) {
  process.emitWarning('Switch to the formatters.level option instead', 'Warning', code)
}

function warnSerializerDeprecation() {
  process.emitWarning('The pino.* serializer is deprecated, use the formatters.log options instead', 'Warning', 'PINODEP003')
}

function createChindings(opts, instance, allFormatters) {
  return opts.base === null ? '' :
    asChindings.bind(null, {
      [chindingsSym]: '',
      [serializersSym]: opts.serializers,
      [stringifiersSym]: instance.stringifiers,
      [stringifySym]: instance.stringify,
      [formattersSym]: allFormatters
    })(
      opts.name === undefined
        ? opts.base
        : { ...opts.base, name: opts.name }
    )
}

function setupTimeFunction(timestamp) {
  return (timestamp instanceof Function) ? timestamp : (timestamp ? epochTime : nullTime)
}

function validateConfigs(opts) {
  if (opts.useOnlyCustomLevels && !opts.customLevels) throw Error('customLevels is required if useOnlyCustomLevels is true')
  if (opts.mixin && typeof opts.mixin !== 'function') throw Error(`Expected mixin to be of type "function", got "${typeof opts.mixin}"`)
  assertDefaultLevelFound(opts.level, opts.customLevels, opts.useOnlyCustomLevels)
}

// Exported functions
module.exports = pino

module.exports.extreme = (dest = process.stdout.fd) => {
  emitExtremeWarning()
  return buildSafeSonicBoom({ dest, minLength: 4096, sync: false })
}

function emitExtremeWarning() {
  process.emitWarning(
    'The pino.extreme() option is deprecated and will be removed in v7. Use pino.destination({ sync: false }) instead.',
    { code: 'extreme_deprecation' }
  )
}

module.exports.destination = (dest = process.stdout.fd) => 
  (typeof dest === 'object')
    ? buildSafeSonicBoom({ ...dest, dest: dest.dest || process.stdout.fd })
    : buildSafeSonicBoom({ dest, minLength: 0, sync: true })

module.exports.final = final
module.exports.levels = mappings()
module.exports.stdSerializers = serializers
module.exports.stdTimeFunctions = { ...time }
module.exports.symbols = symbols
module.exports.version = version

module.exports.default = pino
module.exports.pino = pino
