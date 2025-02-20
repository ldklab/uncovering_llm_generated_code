const ObjectUtils = {
  defineProperty: Object.defineProperty,
  getOwnPropertyNames: Object.getOwnPropertyNames,
  getOwnPropertyDescriptor: Object.getOwnPropertyDescriptor,
  hasOwnProperty: Object.prototype.hasOwnProperty,
};

function name(target, value) {
  ObjectUtils.defineProperty(target, "name", { value, configurable: true });
}

function exportFunctions(target, all) {
  for (let name in all) {
    ObjectUtils.defineProperty(target, name, { get: all[name], enumerable: true });
  }
}

function copyProperties(to, from, except) {
  if (from) {
    const keys = ObjectUtils.getOwnPropertyNames(from);
    for (let key of keys) {
      if (!ObjectUtils.hasOwnProperty.call(to, key) && key !== except) {
        const desc = ObjectUtils.getOwnPropertyDescriptor(from, key);
        ObjectUtils.defineProperty(to, key, {
          get: () => from[key],
          enumerable: !desc || desc.enumerable
        });
      }
    }
  }
  return to;
}

function toCommonJS(mod) {
  return copyProperties(Object.defineProperty({}, "__esModule", { value: true }), mod);
}

// Main module exports
const exports = {
  Client,
  Command,
  SENSITIVE_STRING: "***SensitiveInformation***",
  createAggregatedClient,
  // date and utility functions
  dateToUtcString,
  parseRfc3339DateTime,
  parseRfc7231DateTime,
  parseEpochTimestamp,
  emitWarningIfUnsupportedVersion,
  // error handling
  throwDefaultError,
  withBaseException,
  ServiceException,
  decorateServiceException,
  // configuration and handlers
  loadConfigsForDefaultMode,
  getDefaultExtensionConfiguration,
  getDefaultClientConfiguration,
  resolveDefaultRuntimeConfig,
  // serialization functions
  extendedEncodeURIComponent,
  map,
  convertMap,
  take,
  collectBody: import_util_stream.collectBody,
  getArrayIfSingleItem,
  getValueFromTextNode,
  isSerializableHeaderValue,
  StringWrapper,
  LazyJsonString,
  NoOpLogger,
  // number parsing functions
  parseBoolean,
  expectBoolean,
  expectNumber,
  expectFloat32,
  expectLong,
  expectInt,
  expectInt32,
  expectShort,
  expectByte,
  expectNonNull,
  expectObject,
  expectString,
  expectUnion,
  strictParseDouble,
  limitedParseDouble,
  serializeFloat,
  serializeDateTime,
  _json,
  splitEvery,
  splitHeader,
  resolvedPath,
  quoteHeader,
  handleFloat,
  limitedParseFloat,
  limitedParseFloat32,
  logger
};

module.exports = toCommonJS(exports);

// Client and Command class definitions
var Client = class {
  constructor(config) {
    this.config = config;
    this.middlewareStack = middlewareStack.constructStack();
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
      handler(command)
        .then(result => callback(null, result.output), err => callback(err))
        .catch(() => {});
    } else {
      return handler(command).then(result => result.output);
    }
  }

  destroy() {
    if (this.config?.requestHandler?.destroy) {
      this.config.requestHandler.destroy();
    }
    delete this.handlers;
  }
};
name(Client, "Client");

var Command = class {
  constructor() {
    this.middlewareStack = middlewareStack.constructStack();
  }

  static classBuilder() {
    return new ClassBuilder();
  }

  resolveMiddlewareWithContext(clientStack, configuration, options, contextParams) {
    for (const mw of contextParams.middlewareFn.bind(this)(contextParams.CommandCtor, clientStack, configuration, options)) {
      this.middlewareStack.use(mw);
    }
    const stack = clientStack.concat(this.middlewareStack);
    const handlerExecutionContext = {
      logger: configuration.logger,
      ...contextParams
    };
    return stack.resolve(
      request => configuration.requestHandler.handle(request.request, options || {}),
      handlerExecutionContext
    );
  }
};
name(Command, "Command");

class ClassBuilder {
  constructor() {
    this._init = () => {};
    this._ep = {};
    this._middlewareFn = () => [];
    this._commandName = "";
    this._clientName = "";
    this._additionalContext = {};
    this._smithyContext = {};
    this._inputFilterSensitiveLog = _ => _;
    this._outputFilterSensitiveLog = _ => _;
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
    this._smithyContext = { service, operation, ...smithyContext };
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

  f(inputFilter = _ => _, outputFilter = _ => _) {
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
    const closure = this;
    let CommandRef;
    return CommandRef = class extends Command {
      constructor(input) {
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
    };
  }
}
name(ClassBuilder, "ClassBuilder");

const SENSITIVE_STRING = "***SensitiveInformation***";

function createAggregatedClient(commands, ClientClass) {
  for (const command in commands) {
    const CommandCtor = commands[command];
    const methodImpl = async function(args, optionsOrCb, cb) {
      const commandInstance = new CommandCtor(args);
      if (typeof optionsOrCb === "function") {
        this.send(commandInstance, optionsOrCb);
      } else if (typeof cb === "function") {
        if (typeof optionsOrCb !== "object") {
          throw new Error(`Expected http options but got ${typeof optionsOrCb}`);
        }
        this.send(commandInstance, optionsOrCb || {}, cb);
      } else {
        return this.send(commandInstance, optionsOrCb);
      }
    };
    name(methodImpl, "methodImpl");
    const methodName = (command[0].toLowerCase() + command.slice(1)).replace(/Command$/, "");
    ClientClass.prototype[methodName] = methodImpl;
  }
}

function parseBoolean(value) {
  switch (value) {
    case "true":
      return true;
    case "false":
      return false;
    default:
      throw new Error(`Unable to parse boolean value "${value}"`);
  }
}
name(parseBoolean, "parseBoolean");

function expectBoolean(value) {
  if (value == null) return undefined;
  if (typeof value === "number") {
    if (value === 0 || value === 1) {
      logger.warn(stackTraceWarning(`Expected boolean, got ${typeof value}: ${value}`));
    }
    return value === 1;
  }
  if (typeof value === "string") {
    const lower = value.toLowerCase();
    if (lower === "true" || lower === "false") {
      logger.warn(stackTraceWarning(`Expected boolean, got ${typeof value}: ${value}`));
    }
    return lower === "true";
  }
  if (typeof value === "boolean") {
    return value;
  }
  throw new TypeError(`Expected boolean, got ${typeof value}: ${value}`);
}
name(expectBoolean, "expectBoolean");

function expectNumber(value) {
  if (value == null) return undefined;
  if (typeof value === "string") {
    const parsed = parseFloat(value);
    return !Number.isNaN(parsed) && String(parsed) === String(value) ? parsed : throwTypeError(value, "number");
  }
  if (typeof value === "number") return value;
  throwTypeError(value, "number");
}
name(expectNumber, "expectNumber");

const MAX_FLOAT = Math.ceil(2 ** 127 * (2 - 2 ** -23));

function expectFloat32(value) {
  const expected = expectNumber(value);
  if (!Number.isNaN(expected) && Math.abs(expected) > MAX_FLOAT) {
    throw new TypeError(`Expected 32-bit float, got ${value}`);
  }
  return expected;
}
name(expectFloat32, "expectFloat32");

function expectLong(value) {
  if (value == null) return undefined;
  if (Number.isInteger(value)) return value;
  throwTypeError(value, "integer");
}
name(expectLong, "expectLong");

const expectInt = expectLong;

function expectInt32(value) {
  return expectSizedInt(value, 32);
}
name(expectInt32, "expectInt32");

function expectShort(value) {
  return expectSizedInt(value, 16);
}
name(expectShort, "expectShort");

function expectByte(value) {
  return expectSizedInt(value, 8);
}
name(expectByte, "expectByte");

function expectSizedInt(value, size) {
  const expected = expectLong(value);
  if (castInt(expected, size) !== expected) {
    throw new TypeError(`Expected ${size}-bit integer, got ${value}`);
  }
  return expected;
}
name(expectSizedInt, "expectSizedInt");

function castInt(value, size) {
  switch (size) {
    case 32: return Int32Array.of(value)[0];
    case 16: return Int16Array.of(value)[0];
    case 8: return Int8Array.of(value)[0];
  }
}
name(castInt, "castInt");

function expectNonNull(value, location) {
  if (value == null) {
    throw new TypeError(`Expected a non-null value${location ? ` for ${location}` : ""}`);
  }
  return value;
}
name(expectNonNull, "expectNonNull");

function expectObject(value) {
  if (value == null) return undefined;
  if (typeof value === "object" && !Array.isArray(value)) return value;
  throw new TypeError(`Expected object, got ${Array.isArray(value) ? "array" : typeof value}: ${value}`);
}
name(expectObject, "expectObject");

function expectString(value) {
  if (value == null) return undefined;
  if (typeof value === "string") return value;
  if (["boolean", "number", "bigint"].includes(typeof value)) {
    logger.warn(stackTraceWarning(`Expected string, got ${typeof value}: ${value}`));
    return String(value);
  }
  throwTypeError(value, "string");
}
name(expectString, "expectString");

function expectUnion(value) {
  if (value == null) return undefined;
  const asObject = expectObject(value);
  const keys = Object.entries(asObject).filter(([, v]) => v != null).map(([k]) => k);
  
  if (keys.length !== 1) {
    throw new TypeError(`Unions must have exactly one non-null member, found ${keys.length} non-null members.`);
  }
  
  return asObject;
}
name(expectUnion, "expectUnion");

function strictParseDouble(value) {
  return expectNumber(typeof value === "string" ? parseNumber(value) : value);
}
name(strictParseDouble, "strictParseDouble");

const strictParseFloat = strictParseDouble;

function strictParseFloat32(value) {
  return expectFloat32(typeof value === "string" ? parseNumber(value) : value);
}
name(strictParseFloat32, "strictParseFloat32");

const NUMBER_REGEX = /(-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?)|(-?Infinity)|(NaN)/g;

function parseNumber(value) {
  if (!NUMBER_REGEX.exec(value) || RegExp.lastMatch.length !== value.length) {
    throw new TypeError(`Expected real number, got implicit NaN`);
  }
  return parseFloat(value);
}
name(parseNumber, "parseNumber");

function limitedParseDouble(value) {
  return expectNumber(parseFloat(String(value)));
}
name(limitedParseDouble, "limitedParseDouble");

function handleFloat(value) {
  return limitedParseDouble(value);
}
name(handleFloat, "handleFloat");

const limitedParseFloat = limitedParseDouble;

function limitedParseFloat32(value) {
  return expectFloat32(parseFloat(String(value)));
}
name(limitedParseFloat32, "limitedParseFloat32");

function strictParseLong(value) {
  return expectLong(typeof value === "string" ? parseNumber(value) : value);
}
name(strictParseLong, "strictParseLong");

const strictParseInt = strictParseLong;

function strictParseInt32(value) {
  return expectInt32(typeof value === "string" ? parseNumber(value) : value);
}
name(strictParseInt32, "strictParseInt32");

function strictParseShort(value) {
  return expectShort(typeof value === "string" ? parseNumber(value) : value);
}
name(strictParseShort, "strictParseShort");

function strictParseByte(value) {
  return expectByte(typeof value === "string" ? parseNumber(value) : value);
}
name(strictParseByte, "strictParseByte");

function stackTraceWarning(message) {
  return String(new TypeError(message).stack || message).split("\n").slice(0, 5).filter(line => !line.includes("stackTraceWarning")).join("\n");
}
name(stackTraceWarning, "stackTraceWarning");

const logger = { warn: console.warn };

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
name(dateToUtcString, "dateToUtcString");

const RFC3339 = /^(\d{4})-(\d{2})-(\d{2})[tT](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?[zZ]$/;

function parseRfc3339DateTime(value) {
  if (value == null) return undefined;
  if (typeof value !== "string") throwTypeError(value, "string");
  const match = RFC3339.exec(value);
  if (!match) throw new TypeError("Invalid RFC-3339 date-time value");
  
  const [_, yearStr, monthStr, dayStr, hours, minutes, seconds, fracMillis] = match;
  const year = parseInt(stripLeadingZeroes(yearStr));
  const month = parseDateValue(monthStr, "month", 1, 12);
  const day = parseDateValue(dayStr, "day", 1, 31);
  return buildDate(year, month, day, { hours, minutes, seconds, fracMillis });
}
name(parseRfc3339DateTime, "parseRfc3339DateTime");

const RFC3339_WITH_OFFSET = /^(\d{4})-(\d{2})-(\d{2})[tT](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?(([-+]\d{2}:\d{2})|[zZ])$/;

function parseRfc3339DateTimeWithOffset(value) {
  if (value == null) return undefined;
  if (typeof value !== "string") throwTypeError(value, "string");
  
  const match = RFC3339_WITH_OFFSET.exec(value);
  if (!match) throw new TypeError("Invalid RFC-3339 date-time value");
  
  const [_, yearStr, monthStr, dayStr, hours, minutes, seconds, fracMillis, offsetStr] = match;
  const year = parseInt(stripLeadingZeroes(yearStr));
  const month = parseDateValue(monthStr, "month", 1, 12);
  const day = parseDateValue(dayStr, "day", 1, 31);
  const date = buildDate(year, month, day, { hours, minutes, seconds, fracMillis });
  
  if (offsetStr.toUpperCase() !== "Z") {
    date.setTime(date.getTime() - parseOffsetToMilliseconds(offsetStr));
  }
  
  return date;
}
name(parseRfc3339DateTimeWithOffset, "parseRfc3339DateTimeWithOffset");

const IMF_FIXDATE = /^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun), (\d{2}) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) (\d{4}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? GMT$/;
const RFC_850_DATE = /^(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday), (\d{2})-(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-(\d{2}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? GMT$/;
const ASC_TIME = /^(?:Mon|Tue|Wed|Thu|Fri|Sat|Sun) (Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) ( \d|\d{2}) (\d{1,2}):(\d{2}):(\d{2})(?:\.(\d+))? (\d{4})$/;

function parseRfc7231DateTime(value) {
  if (value == null) return undefined;
  if (typeof value !== "string") throwTypeError(value, "string");

  let match = IMF_FIXDATE.exec(value);
  if (match) {
    const [_, dayStr, monthStr, yearStr, hours, minutes, seconds, fracMillis] = match;
    return buildDate(
      parseInt(stripLeadingZeroes(yearStr)),
      parseMonthByShortName(monthStr),
      parseDateValue(dayStr, "day", 1, 31),
      { hours, minutes, seconds, fracMillis }
    );
  }

  match = RFC_850_DATE.exec(value);
  if (match) {
    const [_, dayStr, monthStr, yearStr, hours, minutes, seconds, fracMillis] = match;
    return adjustRfc850Year(
      buildDate(parseTwoDigitYear(yearStr), parseMonthByShortName(monthStr), parseDateValue(dayStr, "day", 1, 31), {
        hours,
        minutes,
        seconds,
        fracMillis
      })
    );
  }

  match = ASC_TIME.exec(value);
  if (match) {
    const [_, monthStr, dayStr, hours, minutes, seconds, fracMillis, yearStr] = match;
    return buildDate(
      parseInt(stripLeadingZeroes(yearStr)),
      parseMonthByShortName(monthStr),
      parseDateValue(dayStr.trimLeft(), "day", 1, 31),
      { hours, minutes, seconds, fracMillis }
    );
  }

  throw new TypeError("Invalid RFC-7231 date-time value");
}
name(parseRfc7231DateTime, "parseRfc7231DateTime");

function parseEpochTimestamp(value) {
  if (value == null) return undefined;
  
  const valueAsDouble = typeof value === "string" ? strictParseDouble(value) : value;

  if (Number.isNaN(valueAsDouble) || !isFinite(valueAsDouble)) {
    throw new TypeError("Epoch timestamps must be valid, non-Infinite, non-NaN numerics");
  }
  
  return new Date(Math.round(valueAsDouble * 1000));
}
name(parseEpochTimestamp, "parseEpochTimestamp");

function buildDate(year, month, day, { hours, minutes, seconds, fracMillis }) {
  const adjustedMonth = month - 1;
  validateDayOfMonth(year, adjustedMonth, day);
  
  return new Date(
    Date.UTC(
      year,
      adjustedMonth,
      day,
      parseDateValue(hours, "hour", 0, 23),
      parseDateValue(minutes, "minute", 0, 59),
      parseDateValue(seconds, "seconds", 0, 60),
      parseMilliseconds(fracMillis)
    )
  );
}
name(buildDate, "buildDate");

function parseTwoDigitYear(value) {
  const thisYear = new Date().getUTCFullYear();
  const valueInThisCentury = Math.floor(thisYear / 100) * 100 + parseInt(stripLeadingZeroes(value));
  
  return valueInThisCentury < thisYear ? valueInThisCentury + 100 : valueInThisCentury;
}
name(parseTwoDigitYear, "parseTwoDigitYear");

const FIFTY_YEARS_IN_MILLIS = 50 * 365 * 24 * 60 * 60 * 1000;

function adjustRfc850Year(input) {
  if (input.getTime() - Date.now() > FIFTY_YEARS_IN_MILLIS) {
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
}
name(adjustRfc850Year, "adjustRfc850Year");

function parseMonthByShortName(value) {
  const monthIdx = MONTHS.indexOf(value);
  if (monthIdx < 0) throw new TypeError(`Invalid month: ${value}`);
  return monthIdx + 1;
}
name(parseMonthByShortName, "parseMonthByShortName");

const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function validateDayOfMonth(year, month, day) {
  let maxDays = DAYS_IN_MONTH[month];
  if (month === 1 && isLeapYear(year)) maxDays = 29;
  
  if (day > maxDays) {
    throw new TypeError(`Invalid day for ${MONTHS[month]} in ${year}: ${day}`);
  }
}
name(validateDayOfMonth, "validateDayOfMonth");

function isLeapYear(year) {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}
name(isLeapYear, "isLeapYear");

function parseDateValue(value, type, lower, upper) {
  const dateVal = strictParseByte(stripLeadingZeroes(value));
  if (dateVal < lower || dateVal > upper) {
    throw new TypeError(`${type} must be between ${lower} and ${upper}, inclusive`);
  }
  return dateVal;
}
name(parseDateValue, "parseDateValue");

function parseMilliseconds(value) {
  return value == null ? 0 : strictParseFloat32(`0.${value}`) * 1000;
}
name(parseMilliseconds, "parseMilliseconds");

function parseOffsetToMilliseconds(value) {
  const direction = value.startsWith("-") ? -1 : directionStr === "+" ? 1 : throwTypeError(value, "offset direction");
  const hour = Number(value.slice(1, 3));
  const minute = Number(value.slice(4, 6));
  
  return direction * (hour * 60 + minute) * 60000;
}
name(parseOffsetToMilliseconds, "parseOffsetToMilliseconds");

function stripLeadingZeroes(value) {
  let start = 0;
  while (start < value.length - 1 && value.charAt(start) === "0") {
    start++;
  }
  return value.slice(start);
}
name(stripLeadingZeroes, "stripLeadingZeroes");

// Exception Handling
class ServiceException extends Error {
  constructor(options) {
    super(options.message);
    Object.setPrototypeOf(this, ServiceException.prototype);
    this.name = options.name;
    this.$fault = options.$fault;
    this.$metadata = options.$metadata;
  }
}

function decorateServiceException(exception, additions = {}) {
  Object.entries(additions).filter(([, v]) => v !== undefined).forEach(([k, v]) => {
    if (!exception[k]) exception[k] = v;
  });
  
  exception.message ||= exception.Message || "UnknownError";
  delete exception.Message;
  return exception;
}

// Default Error Handler
function throwDefaultError({ output, parsedBody, exceptionCtor, errorCode }) {
  const $metadata = deserializeMetadata(output);
  const statusCode = $metadata.httpStatusCode ? `${$metadata.httpStatusCode}` : undefined;
  const response = new exceptionCtor({
    name: parsedBody?.code || parsedBody?.Code || errorCode || statusCode || "UnknownError",
    $fault: "client",
    $metadata,
  });

  throw decorateServiceException(response, parsedBody);
}

function withBaseException(ExceptionCtor) {
  return ({ output, parsedBody, errorCode }) => {
    throwDefaultError({ output, parsedBody, exceptionCtor: ExceptionCtor, errorCode });
  };
}

function deserializeMetadata(output) {
  return {
    httpStatusCode: output.statusCode,
    requestId: output.headers["x-amzn-requestid"] || output.headers["x-amzn-request-id"] || output.headers["x-amz-request-id"],
    extendedRequestId: output.headers["x-amz-id-2"],
    cfId: output.headers["x-amz-cf-id"],
  };
}

// Defaults Mode
function loadConfigsForDefaultMode(mode) {
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
}

// Emit Warning If Unsupported Version
let warningEmitted = false;

function emitWarningIfUnsupportedVersion(version) {
  if (!warningEmitted && version && parseInt(version.slice(1, version.indexOf("."))) < 16) {
    warningEmitted = true;
  }
}

// Extended Encode URI Component
function extendedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, (c) => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

// Extension Configuration
function getChecksumConfiguration(runtimeConfig) {
  const checksumAlgorithms = Object.entries(import_types.AlgorithmId)
    .filter(([_, id]) => runtimeConfig[id] !== undefined)
    .map(([_, id]) => ({
      algorithmId: () => id,
      checksumConstructor: () => runtimeConfig[id],
    }));

  return {
    _checksumAlgorithms: checksumAlgorithms,
    addChecksumAlgorithm(algo) {
      this._checksumAlgorithms.push(algo);
    },
    checksumAlgorithms() {
      return this._checksumAlgorithms;
    },
  };
}

function resolveChecksumRuntimeConfig(clientConfig) {
  const runtimeConfig = {};
  clientConfig.checksumAlgorithms().forEach((alg) => {
    runtimeConfig[alg.algorithmId()] = alg.checksumConstructor();
  });
  return runtimeConfig;
}

function getRetryConfiguration(runtimeConfig) {
  let _retryStrategy = runtimeConfig.retryStrategy;
  return {
    setRetryStrategy: (retryStrategy) => (_retryStrategy = retryStrategy),
    retryStrategy: () => _retryStrategy,
  };
}

function resolveRetryRuntimeConfig(retryStrategyConfiguration) {
  return { retryStrategy: retryStrategyConfiguration.retryStrategy() };
}

function getDefaultExtensionConfiguration(runtimeConfig) {
  return { ...getChecksumConfiguration(runtimeConfig), ...getRetryConfiguration(runtimeConfig) };
}

const getDefaultClientConfiguration = getDefaultExtensionConfiguration;

function resolveDefault	RuntimeConfig(config) {
  return { ...resolveChecksumRuntimeConfig(config), ...resolveRetryRuntimeConfig(config) };
}

// Other Utilities
function getArrayIfSingleItem(mayBeArray) {
  return Array.isArray(mayBeArray) ? mayBeArray : [mayBeArray];
}

function getValueFromTextNode(obj) {
  const textNodeName = "#text";
  for (const key in obj) {
    if (obj.hasOwnProperty(key) && obj[key][textNodeName] !== undefined) {
      obj[key] = obj[key][textNodeName];
    } else if (typeof obj[key] === "object" && obj[key] !== null) {
      obj[key] = getValueFromTextNode(obj[key]);
    }
  }
  return obj;
}

function isSerializableHeaderValue(value) {
  return value != null;
}

// Lazy JSON
function LazyJsonString(string) {
  if (!(this instanceof LazyJsonString)) {
    return new LazyJsonString(string);
  }
  StringWrapper.call(this, string);
}

LazyJsonString.prototype = Object.create(StringWrapper.prototype);
Object.defineProperty(LazyJsonString.prototype, "constructor", {
  value: LazyJsonString,
  enumerable: false,
  writable: true,
  configurable: true,
});

LazyJsonString.fromObject = function(object) {
  if (object instanceof LazyJsonString) return object;
  if (typeof object === "string" || object instanceof String) return new LazyJsonString(object);
  return new LazyJsonString(JSON.stringify(object));
};

// No Op Logger
class NoOpLogger {
  trace() {}
  debug() {}
  info() {}
  warn() {}
  error() {}
}

// Object Mapping Functions
function map(arg0, arg1, arg2) {
  let target;
  let filter;
  let instructions;
  if (arg1 === undefined && arg2 === undefined) {
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

function convertMap(target) {
  const output = {};
  for (const [k, v] of Object.entries(target || {})) {
    output[k] = [, v];
  }
  return output;
}

function take(source, instructions) {
  return Object.keys(instructions).reduce((out, key) => {
    applyInstruction(out, source, instructions, key);
    return out;
  }, {});
}

function mapWithFilter(target, filter, instructions) {
  const _instructions = Object.entries(instructions).reduce((acc, [key, value]) => {
    if (Array.isArray(value)) {
      acc[key] = value;
    } else {
      if (typeof value === "function") {
        acc[key] = [filter, value()];
      } else {
        acc[key] = [filter, value];
      }
    }
    return acc;
  }, {});

  return map(target, _instructions);
}

function applyInstruction(target, source, instructions, targetKey) {
  if (source) {
    let instruction = instructions[targetKey];
    if (typeof instruction === "function") {
      instruction = [, instruction];
    }
    const [filterFn = nonNullish, valueFn = pass, sourceKey = targetKey] = instruction;
    const value = source[sourceKey];
    if (filterFn(value) || filterFn === undefined) {
      target[targetKey] = valueFn(value);
    }
  } else {
    let [filter, value] = instructions[targetKey];
    const filterPassed = (filter === undefined && value != null) || (typeof filter === "function" ? filter(value) : filter);
    if (filterPassed) {
      target[targetKey] = typeof value === "function" ? value() : value;
    }
  }
}

function nonNullish(value) {
  return value != null;
}

function pass(value) {
  return value;
}

// Quote Header
function quoteHeader(part) {
  if (part.includes(",") || part.includes('"')) {
    part = `"${part.replace(/"/g, '\\"')}"`;
  }
  return part;
}

// Resolve Path
function resolvedPath(resolvedPathStr, input, memberName, labelValueProvider, uriLabel, isGreedyLabel) {
  if (input != null && input[memberName] !== undefined) {
    const labelValue = labelValueProvider();
    if (labelValue.length <= 0) {
      throw new Error(`Empty value provided for input HTTP label: ${memberName}.`);
    }
    resolvedPathStr = resolvedPathStr.replace(
      uriLabel,
      isGreedyLabel ? labelValue.split("/").map(extendedEncodeURIComponent).join("/") : extendedEncodeURIComponent(labelValue)
    );
  } else {
    throw new Error(`No value provided for input HTTP label: ${memberName}.`);
  }
  return resolvedPathStr;
}

// Serialization Utilities
function serializeFloat(value) {
  if (Number.isNaN(value)) return "NaN";
  if (!isFinite(value)) return String(value);
  return value;
}

function serializeDateTime(date) {
  return date.toISOString().replace(".000Z", "Z");
}

// Serde JSON
function _json(obj) {
  if (obj == null) {
    return {};
  }
  if (Array.isArray(obj)) {
    return obj.filter(v => v != null).map(_json);
  }
  if (typeof obj === "object") {
    return Object.keys(obj).reduce((output, key) => {
      if (obj[key] != null) {
        output[key] = _json(obj[key]);
      }
      return output;
    }, {});
  }
  return obj;
}

// Split Every
function splitEvery(value, delimiter, numDelimiters) {
  if (!Number.isInteger(numDelimiters) || numDelimiters <= 0) {
    throw new Error(`Invalid number of delimiters (${numDelimiters}) for splitEvery.`);
  }

  const segments = value.split(delimiter);
  if (numDelimiters === 1) return segments;

  const compoundSegments = [];
  let currentSegment = "";

  segments.forEach((segment, index) => {
    if (!currentSegment) {
      currentSegment = segment;
    } else {
      currentSegment += delimiter + segment;
    }

    if ((index + 1) % numDelimiters === 0) {
      compoundSegments.push(currentSegment);
      currentSegment = "";
    }
  });

  if (currentSegment) {
    compoundSegments.push(currentSegment);
  }

  return compoundSegments;
}

// Split Header
function splitHeader(value) {
  const length = value.length;
  const values = [];
  let withinQuotes = false;
  let prevChar;
  let anchor = 0;

  for (let i = 0; i < length; ++i) {
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
    }

    prevChar = char;
  }

  values.push(value.slice(anchor));
  return values.map(v => {
    if (v.startsWith(`"`) && v.endsWith(`"`)) {
      v = v.slice(1, -1);
    }
    return v.replace(/\\"/g, '"').trim();
  });
}
