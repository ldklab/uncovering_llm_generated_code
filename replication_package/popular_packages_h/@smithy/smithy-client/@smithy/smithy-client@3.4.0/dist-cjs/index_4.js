const { defineProperty: __defProp, getOwnPropertyDescriptor: __getOwnPropDesc, getOwnPropertyNames: __getOwnPropNames, prototype: { hasOwnProperty: __hasOwnProp } } = Object;
const __name = (target, value) => __defProp(target, "name", { value, configurable: true });

function __export(target, all) {
  for (const name in all) {
    __defProp(target, name, { get: all[name], enumerable: true });
  }
}

function __copyProps(to, from, except, desc) {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (const key of __getOwnPropNames(from)) {
      if (!__hasOwnProp.call(to, key) && key !== except) {
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
    }
  }
  return to;
}

function __toCommonJS(mod) {
  return __copyProps(__defProp({}, "__esModule", { value: true }), mod);
}

// src/index.ts
const src_exports = {};
__export(src_exports, {
  Client: () => Client,
  Command: () => Command,
  LazyJsonString: () => LazyJsonString,
  NoOpLogger: () => NoOpLogger,
  SENSITIVE_STRING: () => SENSITIVE_STRING,
  ServiceException: () => ServiceException,
  StringWrapper: () => StringWrapper,
  _json: () => _json,
  collectBody: () => collectBody,
  convertMap: () => convertMap,
  createAggregatedClient: () => createAggregatedClient,
  dateToUtcString: () => dateToUtcString,
  decorateServiceException: () => decorateServiceException,
  emitWarningIfUnsupportedVersion: () => emitWarningIfUnsupportedVersion,
  expectBoolean: () => expectBoolean,
  expectByte: () => expectByte,
  expectFloat32: () => expectFloat32,
  expectInt: () => expectInt,
  expectInt32: () => expectInt32,
  expectLong: () => expectLong,
  expectNonNull: () => expectNonNull,
  expectNumber: () => expectNumber,
  expectObject: () => expectObject,
  expectShort: () => expectShort,
  expectString: () => expectString,
  expectUnion: () => expectUnion,
  extendedEncodeURIComponent: () => extendedEncodeURIComponent,
  getArrayIfSingleItem: () => getArrayIfSingleItem,
  getDefaultClientConfiguration: () => getDefaultClientConfiguration,
  getDefaultExtensionConfiguration: () => getDefaultExtensionConfiguration,
  getValueFromTextNode: () => getValueFromTextNode,
  handleFloat: () => handleFloat,
  isSerializableHeaderValue: () => isSerializableHeaderValue,
  limitedParseDouble: () => limitedParseDouble,
  limitedParseFloat: () => limitedParseFloat,
  limitedParseFloat32: () => limitedParseFloat32,
  loadConfigsForDefaultMode: () => loadConfigsForDefaultMode,
  logger: () => logger,
  map: () => map,
  parseBoolean: () => parseBoolean,
  parseEpochTimestamp: () => parseEpochTimestamp,
  parseRfc3339DateTime: () => parseRfc3339DateTime,
  parseRfc3339DateTimeWithOffset: () => parseRfc3339DateTimeWithOffset,
  parseRfc7231DateTime: () => parseRfc7231DateTime,
  quoteHeader: () => quoteHeader,
  resolveDefaultRuntimeConfig: () => resolveDefaultRuntimeConfig,
  resolvedPath: () => resolvedPath,
  serializeDateTime: () => serializeDateTime,
  serializeFloat: () => serializeFloat,
  splitEvery: () => splitEvery,
  splitHeader: () => splitHeader,
  strictParseByte: () => strictParseByte,
  strictParseDouble: () => strictParseDouble,
  strictParseFloat: () => strictParseFloat,
  strictParseFloat32: () => strictParseFloat32,
  strictParseInt: () => strictParseInt,
  strictParseInt32: () => strictParseInt32,
  strictParseLong: () => strictParseLong,
  strictParseShort: () => strictParseShort,
  take: () => take,
  throwDefaultError: () => throwDefaultError,
  withBaseException: () => withBaseException
});
module.exports = __toCommonJS(src_exports);

// src/client.ts
const import_middleware_stack = require("@smithy/middleware-stack");
class _Client {
  constructor(config) {
    this.config = config;
    this.middlewareStack = (0, import_middleware_stack.constructStack)();
  }
  send(command, optionsOrCb, cb) {
    const options = typeof optionsOrCb !== "function" ? optionsOrCb : undefined;
    const callback = typeof optionsOrCb === "function" ? optionsOrCb : cb;
    const useHandlerCache = options === undefined && this.config.cacheMiddleware === true;
    let handler;
    if (useHandlerCache) {
      if (!this.handlers) {
        this.handlers = new WeakMap();
      }
      const handlers = this.handlers;
      if (handlers.has(command.constructor)) {
        handler = handlers.get(command.constructor);
      } else {
        handler = command.resolveMiddleware(this.middlewareStack, this.config, options);
        handlers.set(command.constructor, handler);
      }
    } else {
      delete this.handlers;
      handler = command.resolveMiddleware(this.middlewareStack, this.config, options);
    }
    if (callback) {
      handler(command).then(
        (result) => callback(null, result.output),
        (err) => callback(err)
      ).catch(() => {});
    } else {
      return handler(command).then((result) => result.output);
    }
  }
  destroy() {
    var _a, _b, _c;
    (_c = (_b = (_a = this.config) == null ? void 0 : _a.requestHandler) == null ? void 0 : _b.destroy) == null ? void 0 : _c.call(_b);
    delete this.handlers;
  }
}
__name(_Client, "Client");
const Client = _Client;

// src/collect-stream-body.ts
const import_util_stream = require("@smithy/util-stream");
const collectBody = async (streamBody = new Uint8Array(), context) => {
  if (streamBody instanceof Uint8Array) {
    return import_util_stream.Uint8ArrayBlobAdapter.mutate(streamBody);
  }
  if (!streamBody) {
    return import_util_stream.Uint8ArrayBlobAdapter.mutate(new Uint8Array());
  }
  const fromContext = context.streamCollector(streamBody);
  return import_util_stream.Uint8ArrayBlobAdapter.mutate(await fromContext);
};

// src/command.ts
const import_types = require("@smithy/types");
class _Command {
  constructor() {
    this.middlewareStack = (0, import_middleware_stack.constructStack)();
  }
  static classBuilder() {
    return new ClassBuilder();
  }
  resolveMiddlewareWithContext(clientStack, configuration, options, {
    middlewareFn,
    clientName,
    commandName,
    inputFilterSensitiveLog,
    outputFilterSensitiveLog,
    smithyContext,
    additionalContext,
    CommandCtor
  }) {
    for (const mw of middlewareFn.bind(this)(CommandCtor, clientStack, configuration, options)) {
      this.middlewareStack.use(mw);
    }
    const stack = clientStack.concat(this.middlewareStack);
    const { logger: logger2 } = configuration;
    const handlerExecutionContext = {
      logger: logger2,
      clientName,
      commandName,
      inputFilterSensitiveLog,
      outputFilterSensitiveLog,
      [import_types.SMITHY_CONTEXT_KEY]: {
        commandInstance: this,
        ...smithyContext
      },
      ...additionalContext
    };
    const { requestHandler } = configuration;
    return stack.resolve(
      (request) => requestHandler.handle(request.request, options || {}),
      handlerExecutionContext
    );
  }
}
__name(_Command, "Command");
const Command = _Command;

class _ClassBuilder {
  constructor() {
    this._init = () => {};
    this._ep = {};
    this._middlewareFn = () => [];
    this._commandName = "";
    this._clientName = "";
    this._additionalContext = {};
    this._smithyContext = {};
    this._inputFilterSensitiveLog = (_) => _;
    this._outputFilterSensitiveLog = (_) => _;
    this._serializer = null;
    this._deserializer = null;
  }
  init(cb) {
    this._init = cb;
  }
  ep(endpointParameterInstructions) {
    this._ep = endpointParameterInstructions;
    return this;
  }
  m(middlewareSupplier) {
    this._middlewareFn = middlewareSupplier;
    return this;
  }
  s(service, operation, smithyContext = {}) {
    this._smithyContext = {
      service,
      operation,
      ...smithyContext
    };
    return this;
  }
  c(additionalContext = {}) {
    this._additionalContext = additionalContext;
    return this;
  }
  n(clientName, commandName) {
    this._clientName = clientName;
    this._commandName = commandName;
    return this;
  }
  f(inputFilter = (_) => _, outputFilter = (_) => _) {
    this._inputFilterSensitiveLog = inputFilter;
    this._outputFilterSensitiveLog = outputFilter;
    return this;
  }
  ser(serializer) {
    this._serializer = serializer;
    return this;
  }
  de(deserializer) {
    this._deserializer = deserializer;
    return this;
  }
  build() {
    var _a;
    const closure = this;
    let CommandRef;
    return CommandRef = (_a = class extends Command {
      constructor(...[input]) {
        super();
        this.serialize = closure._serializer;
        this.deserialize = closure._deserializer;
        this.input = input ?? {};
        closure._init(this);
      }
      static getEndpointParameterInstructions() {
        return closure._ep;
      }
      resolveMiddleware(stack, configuration, options) {
        return this.resolveMiddlewareWithContext(stack, configuration, options, {
          CommandCtor: CommandRef,
          middlewareFn: closure._middlewareFn,
          clientName: closure._clientName,
          commandName: closure._commandName,
          inputFilterSensitiveLog: closure._inputFilterSensitiveLog,
          outputFilterSensitiveLog: closure._outputFilterSensitiveLog,
          smithyContext: closure._smithyContext,
          additionalContext: closure._additionalContext
        });
      }
    }, __name(_a, "CommandRef"), _a);
  }
}
__name(_ClassBuilder, "ClassBuilder");
const ClassBuilder = _ClassBuilder;

// src/constants.ts
const SENSITIVE_STRING = "***SensitiveInformation***";

// src/create-aggregated-client.ts
const createAggregatedClient = (commands, Client2) => {
  for (const command of Object.keys(commands)) {
    const CommandCtor = commands[command];
    const methodImpl = async function(args, optionsOrCb, cb) {
      const command2 = new CommandCtor(args);
      if (typeof optionsOrCb === "function") {
        this.send(command2, optionsOrCb);
      } else if (typeof cb === "function") {
        if (typeof optionsOrCb !== "object")
          throw new Error(`Expected http options but got ${typeof optionsOrCb}`);
        this.send(command2, optionsOrCb || {}, cb);
      } else {
        return this.send(command2, optionsOrCb);
      }
    };
    const methodName = (command[0].toLowerCase() + command.slice(1)).replace(/Command$/, "");
    Client2.prototype[methodName] = methodImpl;
  }
};

// src/parse-utils.ts
const parseBoolean = (value) => {
  switch (value) {
    case "true":
      return true;
    case "false":
      return false;
    default:
      throw new Error(`Unable to parse boolean value "${value}"`);
  }
};
const expectBoolean = (value) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === "number") {
    if (value === 0 || value === 1) {
      logger.warn(stackTraceWarning(`Expected boolean, got ${typeof value}: ${value}`));
    }
    if (value === 0) {
      return false;
    }
    if (value === 1) {
      return true;
    }
  }
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower === "false" || lower === "true") {
      logger.warn(stackTraceWarning(`Expected boolean, got ${typeof value}: ${value}`));
    }
    if (lower === "false") {
      return false;
    }
    if (lower === "true") {
      return true;
    }
  }
  if (typeof value === "boolean") {
    return value;
  }
  throw new TypeError(`Expected boolean, got ${typeof value}: ${value}`);
};
const expectNumber = (value) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    if (!Number.isNaN(parsed)) {
      if (String(parsed) !== String(value)) {
        logger.warn(stackTraceWarning(`Expected number but observed string: ${value}`));
      }
      return parsed;
    }
  }
  if (typeof value === "number") {
    return value;
  }
  throw new TypeError(`Expected number, got ${typeof value}: ${value}`);
};
const MAX_FLOAT = Math.ceil(2 ** 127 * (2 - 2 ** -23));
const expectFloat32 = (value) => {
  const expected = expectNumber(value);
  if (expected !== undefined && !Number.isNaN(expected) && expected !== Infinity && expected !== -Infinity) {
    if (Math.abs(expected) > MAX_FLOAT) {
      throw new TypeError(`Expected 32-bit float, got ${value}`);
    }
  }
  return expected;
};
const expectLong = (value) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (Number.isInteger(value) && !Number.isNaN(value)) {
    return value;
  }
  throw new TypeError(`Expected integer, got ${typeof value}: ${value}`);
};
const expectInt = expectLong;
const expectInt32 = (value) => expectSizedInt(value, 32);
const expectShort = (value) => expectSizedInt(value, 16);
const expectByte = (value) => expectSizedInt(value, 8);
const expectSizedInt = (value, size) => {
  const expected = expectLong(value);
  if (expected !== undefined && castInt(expected, size) !== expected) {
    throw new TypeError(`Expected ${size}-bit integer, got ${value}`);
  }
  return expected;
};
const castInt = (value, size) => {
  switch (size) {
    case 32:
      return Int32Array.of(value)[0];
    case 16:
      return Int16Array.of(value)[0];
    case 8:
      return Int8Array.of(value)[0];
  }
};
const expectNonNull = (value, location) => {
  if (value === null || value === undefined) {
    if (location) {
      throw new TypeError(`Expected a non-null value for ${location}`);
    }
    throw new TypeError("Expected a non-null value");
  }
  return value;
};
const expectObject = (value) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return value;
  }
  const receivedType = Array.isArray(value) ? "array" : typeof value;
  throw new TypeError(`Expected object, got ${receivedType}: ${value}`);
};
const expectString = (value) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === "string") {
    return value;
  }
  if (["boolean", "number", "bigint"].includes(typeof value)) {
    logger.warn(stackTraceWarning(`Expected string, got ${typeof value}: ${value}`));
    return String(value);
  }
  throw new TypeError(`Expected string, got ${typeof value}: ${value}`);
};
const expectUnion = (value) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  const asObject = expectObject(value);
  const setKeys = Object.entries(asObject).filter(([, v]) => v != null).map(([k]) => k);
  if (setKeys.length === 0) {
    throw new TypeError(`Unions must have exactly one non-null member. None were found.`);
  }
  if (setKeys.length > 1) {
    throw new TypeError(`Unions must have exactly one non-null member. Keys ${setKeys} were not null.`);
  }
  return asObject;
};
const strictParseDouble = (value) => {
  if (typeof value == "string") {
    return expectNumber(parseNumber(value));
  }
  return expectNumber(value);
};
const strictParseFloat = strictParseDouble;
const strictParseFloat32 = (value) => {
  if (typeof value == "string") {
    return expectFloat32(parseNumber(value));
  }
  return expectFloat32(value);
};
const NUMBER_REGEX = /(-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)|(-?Infinity)|(NaN)/g;
const parseNumber = (value) => {
  const matches = value.match(NUMBER_REGEX);
  if (matches === null || matches[0].length !== value.length) {
    throw new TypeError(`Expected real number, got implicit NaN`);
  }
  return parseFloat(value);
};
const limitedParseDouble = (value) => {
  if (typeof value == "string") {
    return parseFloatString(value);
  }
  return expectNumber(value);
};
const handleFloat = limitedParseDouble;
const limitedParseFloat = limitedParseDouble;
const limitedParseFloat32 = (value) => {
  if (typeof value == "string") {
    return parseFloatString(value);
  }
  return expectFloat32(value);
};
const parseFloatString = (value) => {
  switch (value) {
    case "NaN":
      return NaN;
    case "Infinity":
      return Infinity;
    case "-Infinity":
      return -Infinity;
    default:
      throw new Error(`Unable to parse float value: ${value}`);
  }
};
const strictParseLong = (value) => {
  if (typeof value === "string") {
    return expectLong(parseNumber(value));
  }
  return expectLong(value);
};
const strictParseInt = strictParseLong;
const strictParseInt32 = (value) => {
  if (typeof value === "string") {
    return expectInt32(parseNumber(value));
  }
  return expectInt32(value);
};
const strictParseShort = (value) => {
  if (typeof value === "string") {
    return expectShort(parseNumber(value));
  }
  return expectShort(value);
};
const strictParseByte = (value) => {
  if (typeof value === "string") {
    return expectByte(parseNumber(value));
  }
  return expectByte(value);
};
const stackTraceWarning = (message) => {
  return String(new TypeError(message).stack || message).split("\n").slice(0, 5).filter((s) => !s.includes("stackTraceWarning")).join("\n");
};
const logger = {
  warn: console.warn
};

// src/date-utils.ts
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
function dateToUtcString(date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const dayOfWeek = date.getUTCDay();
  const dayOfMonthInt = date.getUTCDate();
  const hoursInt = date.getUTCHours();
  const minutesInt = date.getUTCMinutes();
  const secondsInt = date.getUTCSeconds();
  const dayOfMonthString = dayOfMonthInt < 10 ? `0${dayOfMonthInt}` : `${dayOfMonthInt}`;
  const hoursString = hoursInt < 10 ? `0${hoursInt}` : `${hoursInt}`;
  const minutesString = minutesInt < 10 ? `0${minutesInt}` : `${minutesInt}`;
  const secondsString = secondsInt < 10 ? `0${secondsInt}` : `${secondsInt}`;
  return `${DAYS[dayOfWeek]}, ${dayOfMonthString} ${MONTHS[month]} ${year} ${hoursString}:${minutesString}:${secondsString} GMT`;
}
__name(dateToUtcString, "dateToUtcString");
const RFC3339 = /^(\d{4})-(\d{2})-(\d{2})[tT](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?[zZ]$/;
const parseRfc3339DateTime = (value) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new TypeError("RFC-3339 date-times must be expressed as strings");
  }
  const match = RFC3339.exec(value);
  if (!match) {
    throw new TypeError("Invalid RFC-3339 date-time value");
  }
  const [_, yearStr, monthStr, dayStr, hours, minutes, seconds, fractionalMilliseconds] = match;
  const year = strictParseShort(stripLeadingZeroes(yearStr));
  const month = parseDateValue(monthStr, "month", 1, 12);
  const day = parseDateValue(dayStr, "day", 1, 31);
  return buildDate(year, month, day, { hours, minutes, seconds, fractionalMilliseconds });
};
const RFC3339_WITH_OFFSET = /^(\d{4})-(\d{2})-(\d{2})[tT](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(([-+]\d{2}\:\d{2})|[zZ])$/;
const parseRfc3339DateTimeWithOffset = (value) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new TypeError("RFC-3339 date-times must be expressed as strings");
  }
  const match = RFC3339_WITH_OFFSET.exec(value);
  if (!match) {
    throw new TypeError("Invalid RFC-3339 date-time value");
  }
  const [_, yearStr, monthStr, dayStr, hours, minutes, seconds, fractionalMilliseconds, offsetStr] = match;
  const year = strictParseShort(stripLeadingZeroes(yearStr));
  const month = parseDateValue(monthStr, "month", 1, 12);
  const day = parseDateValue(dayStr, "day", 1, 31);
  const date = buildDate(year, month, day, { hours, minutes, seconds, fractionalMilliseconds });
  if (offsetStr.toUpperCase() != "Z") {
    date.setTime(date.getTime() - parseOffsetToMilliseconds(offsetStr));
  }
  return date;
};
const IMF_FIXDATE = /^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d{2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? GMT$/;
const RFC_850_DATE = /^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d{2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{2}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? GMT$/;
const ASC_TIME = /^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( [1-9]|\d{2}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? (\d{4})$/;
const parseRfc7231DateTime = (value) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value !== "string") {
    throw new TypeError("RFC-7231 date-times must be expressed as strings");
  }
  let match = IMF_FIXDATE.exec(value);
  if (match) {
    const [_, dayStr, monthStr, yearStr, hours, minutes, seconds, fractionalMilliseconds] = match;
    return buildDate(
      strictParseShort(stripLeadingZeroes(yearStr)),
      parseMonthByShortName(monthStr),
      parseDateValue(dayStr, "day", 1, 31),
      { hours, minutes, seconds, fractionalMilliseconds }
    );
  }
  match = RFC_850_DATE.exec(value);
  if (match) {
    const [_, dayStr, monthStr, yearStr, hours, minutes, seconds, fractionalMilliseconds] = match;
    return adjustRfc850Year(
      buildDate(parseTwoDigitYear(yearStr), parseMonthByShortName(monthStr), parseDateValue(dayStr, "day", 1, 31), {
        hours,
        minutes,
        seconds,
        fractionalMilliseconds
      })
    );
  }
  match = ASC_TIME.exec(value);
  if (match) {
    const [_, monthStr, dayStr, hours, minutes, seconds, fractionalMilliseconds, yearStr] = match;
    return buildDate(
      strictParseShort(stripLeadingZeroes(yearStr)),
      parseMonthByShortName(monthStr),
      parseDateValue(dayStr.trimLeft(), "day", 1, 31),
      { hours, minutes, seconds, fractionalMilliseconds }
    );
  }
  throw new TypeError("Invalid RFC-7231 date-time value");
};
const parseEpochTimestamp = (value) => {
  if (value === null || value === undefined) {
    return undefined;
  }
  let valueAsDouble;
  if (typeof value === "number") {
    valueAsDouble = value;
  } else if (typeof value === "string") {
    valueAsDouble = strictParseDouble(value);
  } else if (typeof value === "object" && value.tag === 1) {
    valueAsDouble = value.value;
  } else {
    throw new TypeError("Epoch timestamps must be expressed as floating point numbers or their string representation");
  }
  if (Number.isNaN(valueAsDouble) || valueAsDouble === Infinity || valueAsDouble === -Infinity) {
    throw new TypeError("Epoch timestamps must be valid, non-Infinite, non-NaN numerics");
  }
  return new Date(Math.round(valueAsDouble * 1000));
};
const buildDate = (year, month, day, time) => {
  const adjustedMonth = month - 1;
  validateDayOfMonth(year, adjustedMonth, day);
  return new Date(
    Date.UTC(
      year,
      adjustedMonth,
      day,
      parseDateValue(time.hours, "hour", 0, 23),
      parseDateValue(time.minutes, "minute", 0, 59),
      parseDateValue(time.seconds, "seconds", 0, 60),
      parseMilliseconds(time.fractionalMilliseconds)
    )
  );
};
const parseTwoDigitYear = (value) => {
  const thisYear = (new Date()).getUTCFullYear();
  const valueInThisCentury = Math.floor(thisYear / 100) * 100 + strictParseShort(stripLeadingZeroes(value));
  if (valueInThisCentury < thisYear) {
    return valueInThisCentury + 100;
  }
  return valueInThisCentury;
};
const FIFTY_YEARS_IN_MILLIS = 50 * 365 * 24 * 60 * 60 * 1000;
const adjustRfc850Year = (input) => {
  if (input.getTime() - (new Date()).getTime() > FIFTY_YEARS_IN_MILLIS) {
    return new Date(
      Date.UTC(
        input.getUTCFullYear() - 100,
        input.getUTCMonth(),
        input.getUTCDate(),
        input.getUTCHours(),
        input.getUTCMinutes(),
        input.getUTCSeconds(),
        input.getUTCMilliseconds()
      )
    );
  }
  return input;
};
const parseMonthByShortName = (value) => {
  const monthIdx = MONTHS.indexOf(value);
  if (monthIdx < 0) {
    throw new TypeError(`Invalid month: ${value}`);
  }
  return monthIdx + 1;
};
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
const validateDayOfMonth = (year, month, day) => {
  let maxDays = DAYS_IN_MONTH[month];
  if (month === 1 && isLeapYear(year)) {
    maxDays = 29;
  }
  if (day > maxDays) {
    throw new TypeError(`Invalid day for ${MONTHS[month]} in ${year}: ${day}`);
  }
};
const isLeapYear = (year) => {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
};
const parseDateValue = (value, type, lower, upper) => {
  const dateVal = strictParseByte(stripLeadingZeroes(value));
  if (dateVal < lower || dateVal > upper) {
    throw new TypeError(`${type} must be between ${lower} and ${upper}, inclusive`);
  }
  return dateVal;
};
const parseMilliseconds = (value) => {
  if (value === null || value === undefined) {
    return 0;
  }
  return strictParseFloat32("0." + value) * 1000;
};
const parseOffsetToMilliseconds = (value) => {
  const directionStr = value[0];
  let direction = 1;
  if (directionStr == "+") {
    direction = 1;
  } else if (directionStr == "-") {
    direction = -1;
  } else {
    throw new TypeError(`Offset direction, ${directionStr}, must be "+" or "-"`);
  }
  const hour = Number(value.substring(1, 3));
  const minute = Number(value.substring(4, 6));
  return direction * (hour * 60 + minute) * 60 * 1000;
};
const stripLeadingZeroes = (value) => {
  let idx = 0;
  while (idx < value.length - 1 && value.charAt(idx) === "0") {
    idx++;
  }
  if (idx === 0) {
    return value;
  }
  return value.slice(idx);
};

// src/exceptions.ts
class _ServiceException extends Error {
  constructor(options) {
    super(options.message);
    Object.setPrototypeOf(this, _ServiceException.prototype);
    this.name = options.name;
    this.$fault = options.$fault;
    this.$metadata = options.$metadata;
  }
}
__name(_ServiceException, "ServiceException");
const ServiceException = _ServiceException;
const decorateServiceException = (exception, additions = {}) => {
  Object.entries(additions).filter(([, v]) => v !== undefined).forEach(([k, v]) => {
    if (exception[k] == undefined || exception[k] === "") {
      exception[k] = v;
    }
  });
  const message = exception.message || exception.Message || "UnknownError";
  exception.message = message;
  delete exception.Message;
  return exception;
};

// src/default-error-handler.ts
const throwDefaultError = ({ output, parsedBody, exceptionCtor, errorCode }) => {
  const $metadata = deserializeMetadata(output);
  const statusCode = $metadata.httpStatusCode ? $metadata.httpStatusCode + "" : undefined;
  const response = new exceptionCtor({
    name: (parsedBody == null ? void 0 : parsedBody.code) || (parsedBody == null ? void 0 : parsedBody.Code) || errorCode || statusCode || "UnknownError",
    $fault: "client",
    $metadata
  });
  throw decorateServiceException(response, parsedBody);
};
const withBaseException = (ExceptionCtor) => {
  return ({ output, parsedBody, errorCode }) => {
    throwDefaultError({ output, parsedBody, exceptionCtor: ExceptionCtor, errorCode });
  };
};
const deserializeMetadata = (output) => ({
  httpStatusCode: output.statusCode,
  requestId: output.headers["x-amzn-requestid"] ?? output.headers["x-amzn-request-id"] ?? output.headers["x-amz-request-id"],
  extendedRequestId: output.headers["x-amz-id-2"],
  cfId: output.headers["x-amz-cf-id"]
});

// src/defaults-mode.ts
const loadConfigsForDefaultMode = (mode) => {
  switch (mode) {
    case "standard":
      return { retryMode: "standard", connectionTimeout: 3100 };
    case "in-region":
      return { retryMode: "standard", connectionTimeout: 1100 };
    case "cross-region":
      return { retryMode: "standard", connectionTimeout: 3100 };
    case "mobile":
      return { retryMode: "standard", connectionTimeout: 30000 };
    default:
      return {};
  }
};

// src/emitWarningIfUnsupportedVersion.ts
let warningEmitted = false;
const emitWarningIfUnsupportedVersion = (version) => {
  if (version && !warningEmitted && parseInt(version.substring(1, version.indexOf("."))) < 16) {
    warningEmitted = true;
  }
};

// src/extended-encode-uri-component.ts
function extendedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

// src/extensions/checksum.ts
const getChecksumConfiguration = (runtimeConfig) => {
  const checksumAlgorithms = [];
  for (const id in import_types.AlgorithmId) {
    const algorithmId = import_types.AlgorithmId[id];
    if (runtimeConfig[algorithmId] === undefined) {
      continue;
    }
    checksumAlgorithms.push({
      algorithmId: () => algorithmId,
      checksumConstructor: () => runtimeConfig[algorithmId]
    });
  }
  return {
    _checksumAlgorithms: checksumAlgorithms,
    addChecksumAlgorithm(algo) { this._checksumAlgorithms.push(algo) },
    checksumAlgorithms() { return this._checksumAlgorithms }
  };
};
const resolveChecksumRuntimeConfig = (clientConfig) => {
  const runtimeConfig = {};
  clientConfig.checksumAlgorithms().forEach((checksumAlgorithm) => {
    runtimeConfig[checksumAlgorithm.algorithmId()] = checksumAlgorithm.checksumConstructor();
  });
  return runtimeConfig;
};

// src/extensions/retry.ts
const getRetryConfiguration = (runtimeConfig) => {
  let _retryStrategy = runtimeConfig.retryStrategy;
  return {
    setRetryStrategy(retryStrategy) { _retryStrategy = retryStrategy },
    retryStrategy() { return _retryStrategy }
  };
};
const resolveRetryRuntimeConfig = (retryStrategyConfiguration) => {
  const runtimeConfig = {};
  runtimeConfig.retryStrategy = retryStrategyConfiguration.retryStrategy();
  return runtimeConfig;
};

// src/extensions/defaultExtensionConfiguration.ts
const getDefaultExtensionConfiguration = (runtimeConfig) => ({ ...getChecksumConfiguration(runtimeConfig), ...getRetryConfiguration(runtimeConfig) });
const getDefaultClientConfiguration = getDefaultExtensionConfiguration;
const resolveDefaultRuntimeConfig = (config) => ({ ...resolveChecksumRuntimeConfig(config), ...resolveRetryRuntimeConfig(config) });

// src/get-array-if-single-item.ts
const getArrayIfSingleItem = (mayBeArray) => Array.isArray(mayBeArray) ? mayBeArray : [mayBeArray];

// src/get-value-from-text-node.ts
const getValueFromTextNode = (obj) => {
  const textNodeName = "#text";
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key][textNodeName] !== undefined) {
      obj[key] = obj[key][textNodeName];
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      obj[key] = getValueFromTextNode(obj[key]);
    }
  }
  return obj;
};

// src/is-serializable-header-value.ts
const isSerializableHeaderValue = (value) => value != null;

// src/lazy-json.ts
function StringWrapper() {
  const Class = Object.getPrototypeOf(this).constructor;
  const Constructor = Function.bind.apply(String, [null, ...arguments]);
  const instance = new Constructor();
  Object.setPrototypeOf(instance, Class.prototype);
  return instance;
}
StringWrapper.prototype = Object.create(String.prototype, {
  constructor: {
    value: StringWrapper,
    enumerable: false,
    writable: true,
    configurable: true
  }
});
Object.setPrototypeOf(StringWrapper, String);

class _LazyJsonString extends StringWrapper {
  deserializeJSON() {
    return JSON.parse(super.toString());
  }
  toJSON() {
    return super.toString();
  }
  static fromObject(object) {
    if (object instanceof _LazyJsonString) {
      return object;
    } else if (object instanceof String || typeof object === "string") {
      return new _LazyJsonString(object);
    }
    return new _LazyJsonString(JSON.stringify(object));
  }
}
__name(_LazyJsonString, "LazyJsonString");
const LazyJsonString = _LazyJsonString;

// src/NoOpLogger.ts
class _NoOpLogger {
  trace() {}
  debug() {}
  info() {}
  warn() {}
  error() {}
}
__name(_NoOpLogger, "NoOpLogger");
const NoOpLogger = _NoOpLogger;

// src/object-mapping.ts
function map(arg0, arg1, arg2) {
  let target;
  let filter;
  let instructions;
  if (typeof arg1 === "undefined" && typeof arg2 === "undefined") {
    target = {};
    instructions = arg0;
  } else {
    target = arg0;
    if (typeof arg1 === "function") {
      filter = arg1;
      instructions = arg2;
      return mapWithFilter(target, filter, instructions);
    } else {
      instructions = arg1;
    }
  }
  for (const key of Object.keys(instructions)) {
    if (!Array.isArray(instructions[key])) {
      target[key] = instructions[key];
      continue;
    }
    applyInstruction(target, null, instructions, key);
  }
  return target;
}
const convertMap = (target) => {
  const output = {};
  for (const [k, v] of Object.entries(target || {})) {
    output[k] = [, v];
  }
  return output;
};
const take = (source, instructions) => {
  const out = {};
  for (const key in instructions) {
    applyInstruction(out, source, instructions, key);
  }
  return out;
};
const mapWithFilter = (target, filter, instructions) => {
  return map(
    target,
    Object.entries(instructions).reduce(
      (_instructions, [key, value]) => {
        if (Array.isArray(value)) {
          _instructions[key] = value;
        } else {
          if (typeof value === "function") {
            _instructions[key] = [filter, value()];
          } else {
            _instructions[key] = [filter, value];
          }
        }
        return _instructions;
      },
      {}
    )
  );
};
const applyInstruction = (target, source, instructions, targetKey) => {
  if (source !== null) {
    let instruction = instructions[targetKey];
    if (typeof instruction === "function") {
      instruction = [, instruction];
    }
    const [filter2 = nonNullish, valueFn = pass, sourceKey = targetKey] = instruction;
    if ((typeof filter2 === "function" && filter2(source[sourceKey])) || (typeof filter2 !== "function" && !!filter2)) {
      target[targetKey] = valueFn(source[sourceKey]);
    }
    return;
  }
  let [filter, value] = instructions[targetKey];
  if (typeof value === "function") {
    let _value;
    const defaultFilterPassed = filter === undefined && (_value = value()) != null;
    const customFilterPassed = (typeof filter === "function" && !!filter(undefined)) || (typeof filter !== "function" && !!filter);
    if (defaultFilterPassed) {
      target[targetKey] = _value;
    } else if (customFilterPassed) {
      target[targetKey] = value();
    }
  } else {
    const defaultFilterPassed = filter === undefined && value != null;
    const customFilterPassed = (typeof filter === "function" && !!filter(value)) || (typeof filter !== "function" && !!filter);
    if (defaultFilterPassed || customFilterPassed) {
      target[targetKey] = value;
    }
  }
};
const nonNullish = (_) => _ != null;
const pass = (_) => _;

// src/quote-header.ts
function quoteHeader(part) {
  if (part.includes(",") || part.includes('"')) {
    part = `"${part.replace(/"/g, '\\"')}"`;
  }
  return part;
}

// src/resolve-path.ts
const resolvedPath = (resolvedPath2, input, memberName, labelValueProvider, uriLabel, isGreedyLabel) => {
  if (input != null && input[memberName] !== undefined) {
    const labelValue = labelValueProvider();
    if (labelValue.length <= 0) {
      throw new Error("Empty value provided for input HTTP label: " + memberName + ".");
    }
    resolvedPath2 = resolvedPath2.replace(
      uriLabel,
      isGreedyLabel ? labelValue.split("/").map((segment) => extendedEncodeURIComponent(segment)).join("/") : extendedEncodeURIComponent(labelValue)
    );
  } else {
    throw new Error("No value provided for input HTTP label: " + memberName + ".");
  }
  return resolvedPath2;
};

// src/ser-utils.ts
const serializeFloat = (value) => {
  if (value !== value) {
    return "NaN";
  }
  switch (value) {
    case Infinity:
      return "Infinity";
    case -Infinity:
      return "-Infinity";
    default:
      return value;
  }
};
const serializeDateTime = (date) => date.toISOString().replace(".000Z", "Z");

// src/serde-json.ts
const _json = (obj) => {
  if (obj == null) {
    return {};
  }
  if (Array.isArray(obj)) {
    return obj.filter((_) => _ != null).map(_json);
  }
  if (typeof obj === "object") {
    const target = {};
    for (const key of Object.keys(obj)) {
      if (obj[key] == null) {
        continue;
      }
      target[key] = _json(obj[key]);
    }
    return target;
  }
  return obj;
};

// src/split-every.ts
function splitEvery(value, delimiter, numDelimiters) {
  if (numDelimiters <= 0 || !Number.isInteger(numDelimiters)) {
    throw new Error("Invalid number of delimiters (" + numDelimiters + ") for splitEvery.");
  }
  const segments = value.split(delimiter);
  if (numDelimiters === 1) {
    return segments;
  }
  const compoundSegments = [];
  let currentSegment = "";
  for (let i = 0; i < segments.length; i++) {
    if (currentSegment === "") {
      currentSegment = segments[i];
    } else {
      currentSegment += delimiter + segments[i];
    }
    if ((i + 1) % numDelimiters === 0) {
      compoundSegments.push(currentSegment);
      currentSegment = "";
    }
  }
  if (currentSegment !== "") {
    compoundSegments.push(currentSegment);
  }
  return compoundSegments;
}

// src/split-header.ts
const splitHeader = (value) => {
  const z = value.length;
  const values = [];
  let withinQuotes = false;
  let prevChar;
  let anchor = 0;
  for (let i = 0; i < z; ++i) {
    const char = value[i];
    switch (char) {
      case `"`:
        if (prevChar !== "\\") {
          withinQuotes = !withinQuotes;
        }
        break;
      case ",":
        if (!withinQuotes) {
          values.push(value.slice(anchor, i));
          anchor = i + 1;
        }
        break;
      default:
        break;
    }
    prevChar = char;
  }
  values.push(value.slice(anchor));
  return values.map((v) => {
    v = v.trim();
    const z2 = v.length;
    if (z2 < 2) {
      return v;
    }
    if (v[0] === `"` && v[z2 - 1] === `"`) {
      v = v.slice(1, z2 - 1);
    }
    return v.replace(/\\"/g, '"');
  });
};
