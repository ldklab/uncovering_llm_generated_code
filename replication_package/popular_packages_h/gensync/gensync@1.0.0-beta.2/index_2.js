"use strict";

// Using global symbol registry for cross-library compatibility
const GENSYNC_START = Symbol.for("gensync:v1:start");
const GENSYNC_SUSPEND = Symbol.for("gensync:v1:suspend");

const ERROR_MESSAGES = {
  START: "GENSYNC_EXPECTED_START",
  SUSPEND: "GENSYNC_EXPECTED_SUSPEND",
  OPTIONS: "GENSYNC_OPTIONS_ERROR",
  RACE_NONEMPTY: "GENSYNC_RACE_NONEMPTY",
  NO_CALLBACK: "GENSYNC_ERRBACK_NO_CALLBACK",
};

module.exports = Object.assign(gensyncFactory, {
  all: createOperation(buildAllOperationConfig()),
  race: createOperation(buildRaceOperationConfig()),
});

function gensyncFactory(optsOrFn) {
  const genFn = typeof optsOrFn === "function" ? wrapGenFunc(optsOrFn) : createGenerator(optsOrFn);
  return Object.assign(genFn, createAPI(genFn));
}

function createAPI(genFn) {
  return {
    sync: function(...args) {
      return executeSync(genFn.apply(this, args));
    },
    async: function(...args) {
      return new Promise((resolve, reject) => executeAsync(genFn.apply(this, args), resolve, reject));
    },
    errback: function(...args) {
      const callback = args.pop();
      checkIfFunction("function", callback);

      let generator;
      try {
        generator = genFn.apply(this, args);
      } catch (error) {
        callback(error);
        return;
      }

      executeAsync(generator, value => callback(undefined, value), err => callback(err));
    },
  };
}

function createGenerator({ name, arity, sync, async, errback }) {
  validateOptions(name, arity, sync, async, errback);

  name = determineFuncName(name, sync, async, errback);
  arity = arity || sync.length;

  return createOperation({ name, arity, sync, async });
}

function wrapGenFunc(fn) {
  return setFuncMetadata(fn.name, fn.length, function(...args) {
    return fn.apply(this, args);
  });
}

function createOperation({ name, arity, sync, async }) {
  return setFuncMetadata(name, arity, function*(...args) {
    const resume = yield GENSYNC_START;
    if (!resume) return sync.call(this, args);

    let result;
    async.call(this, args, value => handleAsync(value, result, resume), err => handleAsyncError(err, result, resume));

    yield GENSYNC_SUSPEND;

    if (result.err) throw result.err;
    return result.value;
  });
}

function executeSync(gen) {
  let { value } = gen.next();
  while (!value.done) {
    ensureStart(value.value, gen);
    value = gen.next().value;
  }
  return value;
}

function executeAsync(gen, resolve, reject) {
  function step() {
    try {
      let { value } = gen.next();
      while (!value.done) {
        ensureStart(value.value, gen);
        
        let sync = true;
        let resumed = false;
        gen.next(() => {
          if (sync) resumed = true;
          else step();
        });
        sync = false;

        ensureSuspend(value, gen);

        if (!resumed) return;
      }
      resolve(value);
    } catch (err) {
      reject(err);
    }
  }
  step();
}

function ensureStart(value, gen) {
  if (value === GENSYNC_START) return;
  throw createError(`Unexpected yield value: ${JSON.stringify(value)}`, ERROR_MESSAGES.START, gen);
}

function ensureSuspend({ value, done }, gen) {
  if (!done && value === GENSYNC_SUSPEND) return;
  const errorMsg = done ? "Unexpected completion" : `Expected SUSPEND, got ${JSON.stringify(value)}`;
  throw createError(errorMsg, ERROR_MESSAGES.SUSPEND, gen);
}

function createError(msg, code, gen) {
  const error = new Error(msg);
  Object.assign(error, { code });
  if (gen.throw) gen.throw(error);
  throw error;
}

function setFuncMetadata(name, arity, func) {
  defineIfConfigurable(func, "name", name);
  defineIfConfigurable(func, "length", arity);
  return func;
}

function defineIfConfigurable(obj, propName, value) {
  const descriptor = Object.getOwnPropertyDescriptor(obj, propName);
  if (!descriptor || descriptor.configurable) {
    Object.defineProperty(obj, propName, { configurable: true, value });
  }
}

function validateOptions(name, arity, sync, async, errback) {
  checkIfType("string", name, true);
  checkIfType("number", arity, true);
  checkIfType("function", sync);
  checkIfType("function", async, true);
  checkIfType("function", errback, true);

  if (async && errback) {
    throw createError("Provide either async or errback handler, not both", ERROR_MESSAGES.OPTIONS);
  }
}

function checkIfType(expectedType, value, allowUndefined) {
  if (typeof value !== expectedType && (!allowUndefined || typeof value !== "undefined")) {
    const message = `Expected type: ${expectedType}.`;
    throw createError(message, ERROR_MESSAGES.OPTIONS);
  }
}

function determineFuncName(name, sync, async, errback) {
  if (typeof name !== "string") {
    const func = errback || async || sync;
    name = func && func.name !== (errback ? "errback" : async ? "async" : "sync") ? func.name : undefined;
  }
  return name;
}

function handleAsync(value, result, resume) {
  if (!result) {
    result = { value };
    resume();
  }
}

function handleAsyncError(err, result, resume) {
  if (!result) {
    result = { err };
    resume();
  }
}

function buildAllOperationConfig() {
  return {
    name: "all",
    arity: 1,
    sync: function(args) {
      return Array.from(args[0]).map(item => executeSync(item));
    },
    async: function(args, resolve, reject) {
      const items = Array.from(args[0]);
      if (items.length === 0) {
        return Promise.resolve().then(() => resolve([]));
      }

      let count = 0;
      const results = Array(items.length);
      items.forEach((item, i) => {
        executeAsync(item, value => {
          results[i] = value;
          if (++count === results.length) resolve(results);
        }, reject);
      });
    },
  };
}

function buildRaceOperationConfig() {
  return {
    name: "race",
    arity: 1,
    sync: function(args) {
      if (Array.from(args[0]).length === 0) throw createError("At least one item is required", ERROR_MESSAGES.RACE_NONEMPTY);
      return executeSync(Array.from(args[0])[0]);
    },
    async: function(args, resolve, reject) {
      const items = Array.from(args[0]);
      if (items.length === 0) throw createError("At least one item is required", ERROR_MESSAGES.RACE_NONEMPTY);

      items.forEach(item => executeAsync(item, resolve, reject));
    },
  };
}
