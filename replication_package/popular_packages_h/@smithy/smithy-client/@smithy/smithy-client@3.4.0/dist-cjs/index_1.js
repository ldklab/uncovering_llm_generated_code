var { defineProperty, getOwnPropertyDescriptor, getOwnPropertyNames, prototype: objPrototype } = Object;
var hasOwnProperty = objPrototype.hasOwnProperty;

function setFunctionName(target, value) {
  defineProperty(target, "name", { value, configurable: true });
}

function exportProperties(target, all) {
  for (var name in all) {
    defineProperty(target, name, { get: all[name], enumerable: true });
  }
}

function copyProps(to, from, except, desc) {
  if (from && (typeof from === "object" || typeof from === "function")) {
    for (let key of getOwnPropertyNames(from)) {
      if (!hasOwnProperty.call(to, key) && key !== except) {
        defineProperty(to, key, { get: () => from[key], enumerable: !(desc = getOwnPropertyDescriptor(from, key)) || desc.enumerable });
      }
    }
  }
  return to;
}

function toCommonJS(mod) {
  return copyProps(defineProperty({}, "__esModule", { value: true }), mod);
}

// Example module structure
var src_exports = {};
exportProperties(src_exports, {
  Client: () => Client,
  Command: () => Command,
  LazyJsonString: () => LazyJsonString,
  NoOpLogger: () => NoOpLogger,
  SENSITIVE_STRING: () => SENSITIVE_STRING,
  // Other exports...
});

module.exports = toCommonJS(src_exports);

// Client implementation
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
      handler(command).then(
        (result) => callback(null, result.output),
        (err) => callback(err)
      ).catch(() => {});
    } else {
      return handler(command).then(result => result.output);
    }
  }
  destroy() {
    this.config?.requestHandler?.destroy?.();
    delete this.handlers;
  }
}

setFunctionName(Client, "Client");

class Command {
  constructor() {
    this.middlewareStack = require("@smithy/middleware-stack").constructStack();
  }

  static classBuilder() {
    return new ClassBuilder();
  }

  resolveMiddlewareWithContext(clientStack, configuration, options, ctxDetails) {
    const { CommandCtor } = ctxDetails;
    for (const mw of ctxDetails.middlewareFn.bind(this)(CommandCtor, clientStack, configuration, options)) {
      this.middlewareStack.use(mw);
    }
    const stack = clientStack.concat(this.middlewareStack);
    const { logger } = configuration;
    const handlerExecutionContext = { ...ctxDetails, logger };
    const { requestHandler } = configuration;
    return stack.resolve(
      (request) => requestHandler.handle(request.request, options || {}),
      handlerExecutionContext
    );
  }
}

setFunctionName(Command, "Command");

// The rest classes and utility functions continue here similarly...

var SENSITIVE_STRING = "***SensitiveInformation***";

function createAggregatedClient(commands, Client2) {
  for (const command in commands) {
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
    setFunctionName(methodImpl, "methodImpl");
    const methodName = (command[0].toLowerCase() + command.slice(1)).replace(/Command$/, "");
    Client2.prototype[methodName] = methodImpl;
  }
}

// Exported utility functions, other classes, and logic can continue in this manner...
