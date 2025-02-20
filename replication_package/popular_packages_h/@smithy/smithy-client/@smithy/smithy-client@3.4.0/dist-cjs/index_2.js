// Utility functions and constants initialization
const __defProp = Object.defineProperty;
const __getOwnPropDesc = Object.getOwnPropertyDescriptor;
const __getOwnPropNames = Object.getOwnPropertyNames;
const __hasOwnProp = Object.prototype.hasOwnProperty;
const __name = (target, value) => __defProp(target, "name", { value, configurable: true });

const SENSITIVE_STRING = "***SensitiveInformation***";
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function isSerializableHeaderValue(value) {
  return value != null;
}

// Core Client and Command logic
class Client {
  constructor(config) {
    this.config = config;
    this.middlewareStack = require("@smithy/middleware-stack").constructStack();
  }

  send(command, optionsOrCb, cb) {
    const options = typeof optionsOrCb !== "function" ? optionsOrCb : undefined;
    const callback = typeof optionsOrCb === "function" ? optionsOrCb : cb;
    const useHandlerCache = options === undefined && this.config.cacheMiddleware === true;
    let handler;

    if (useHandlerCache) {
      if (!this.handlers) this.handlers = new WeakMap();
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
      handler(command).then(result => callback(null, result.output), err => callback(err)).catch(() => {});
    } else {
      return handler(command).then(result => result.output);
    }
  }

  destroy() {
    this.config?.requestHandler?.destroy?.call(this.config.requestHandler);
    delete this.handlers;
  }
}

class Command {
  static classBuilder() {
    return new ClassBuilder();
  }

  resolveMiddlewareWithContext(clientStack, configuration, options, context) {
    for (const mw of context.middlewareFn.bind(this)(context.CommandCtor, clientStack, configuration, options)) {
      this.middlewareStack.use(mw);
    }

    const stack = clientStack.concat(this.middlewareStack);
    const { logger } = configuration;
    const handlerExecutionContext = {
      logger,
      ...context
    };

    const { requestHandler } = configuration;
    return stack.resolve(
      request => requestHandler.handle(request.request, options || {}),
      handlerExecutionContext
    );
  }
}

class ClassBuilder {
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
    return this;
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
    const closure = this;
    class CommandRef extends Command {
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
    }
    return CommandRef;
  }
}

// Exception and Error Handling
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
    if (exception[k] === undefined || exception[k] === "") {
      exception[k] = v;
    }
  });

  const message = exception.message || exception.Message || "UnknownError";
  exception.message = message;
  delete exception.Message;
  return exception;
}

function throwDefaultError({ output, parsedBody, exceptionCtor, errorCode }) {
  const $metadata = deserializeMetadata(output);
  const statusCode = $metadata.httpStatusCode ? `${$metadata.httpStatusCode}` : undefined;
  const response = new exceptionCtor({
    name: parsedBody?.code || parsedBody?.Code || errorCode || statusCode || "UnknownError",
    $fault: "client",
    $metadata
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
    requestId: output.headers["x-amzn-requestid"] ?? output.headers["x-amzn-request-id"] ?? output.headers["x-amz-request-id"],
    extendedRequestId: output.headers["x-amz-id-2"],
    cfId: output.headers["x-amz-cf-id"]
  };
}

// Date Utilities
function dateToUtcString(date) {
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
  return `${DAYS[dayOfWeek]}, ${dayOfMonthString} ${MONTHS[month]} ${date.getUTCFullYear()} ${hoursString}:${minutesString}:${secondsString} GMT`;
}

// Config Management
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

function emitWarningIfUnsupportedVersion(version) {}

// Additional Utility Functions
function extendedEncodeURIComponent(str) {
  return encodeURIComponent(str).replace(/[!'()*]/g, c => "%" + c.charCodeAt(0).toString(16).toUpperCase());
}

class NoOpLogger {
  trace() {}
  debug() {}
  info() {}
  warn() {}
  error() {}
}

function map(target, instructions) {
  for (const key of Object.keys(instructions)) {
    if (!Array.isArray(instructions[key])) {
      target[key] = instructions[key];
    } else {
      applyInstruction(target, null, instructions, key);
    }
  }
  return target;
}

function quoteHeader(part) {
  if (part.includes(",") || part.includes('"')) {
    part = `"${part.replace(/"/g, '\\"')}"`;
  }
  return part;
}

function resolvedPath(resolvedPath, input, memberName, labelValueProvider, uriLabel, isGreedyLabel) {
  if (input != null && input[memberName] !== undefined) {
    const labelValue = labelValueProvider();
    if (labelValue.length <= 0) {
      throw new Error("Empty value provided for input HTTP label: " + memberName + ".");
    }
    resolvedPath = resolvedPath.replace(
      uriLabel,
      isGreedyLabel ? labelValue.split("/").map(segment => extendedEncodeURIComponent(segment)).join("/") : extendedEncodeURIComponent(labelValue)
    );
  } else {
    throw new Error("No value provided for input HTTP label: " + memberName + ".");
  }
  return resolvedPath;
}

// Export the necessary modules and functions
module.exports = {
  Client,
  Command,
  ServiceException,
  SENSITIVE_STRING,
  dateToUtcString,
  extendedEncodeURIComponent,
  NoOpLogger,
  map,
  quoteHeader,
  resolvedPath,
  throwDefaultError,
  withBaseException,
  loadConfigsForDefaultMode,
  emitWarningIfUnsupportedVersion
};

