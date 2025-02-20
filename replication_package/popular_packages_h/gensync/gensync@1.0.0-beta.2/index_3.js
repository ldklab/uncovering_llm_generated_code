"use strict";

// Global symbols for operation coordination
const GENSYNC_START = Symbol.for("gensync:v1:start");
const GENSYNC_SUSPEND = Symbol.for("gensync:v1:suspend");

// Error codes
const GENSYNC_EXPECTED_START = "GENSYNC_EXPECTED_START";
const GENSYNC_EXPECTED_SUSPEND = "GENSYNC_EXPECTED_SUSPEND";
const GENSYNC_OPTIONS_ERROR = "GENSYNC_OPTIONS_ERROR";
const GENSYNC_RACE_NONEMPTY = "GENSYNC_RACE_NONEMPTY";
const GENSYNC_ERRBACK_NO_CALLBACK = "GENSYNC_ERRBACK_NO_CALLBACK";

module.exports = Object.assign(
  function gensync(optsOrFn) {
    const genFn = typeof optsOrFn === "function" ? wrapGenerator(optsOrFn) : newGenerator(optsOrFn);
    return Object.assign(genFn, makeFunctionAPI(genFn));
  },
  {
    all: buildOperation({
      name: "all",
      arity: 1,
      sync(args) {
        return Array.from(args[0]).map(evaluateSync);
      },
      async(args, resolve, reject) {
        const items = Array.from(args[0]);
        if (items.length === 0) return Promise.resolve().then(() => resolve([]));

        let count = 0;
        const results = Array(items.length).fill(undefined);
        items.forEach((item, i) => {
          evaluateAsync(
            item,
            val => {
              results[i] = val;
              if (++count === results.length) resolve(results);
            },
            reject
          );
        });
      },
    }),
    race: buildOperation({
      name: "race",
      arity: 1,
      sync(args) {
        if (args[0].length === 0) throw makeError("Must race at least 1 item", GENSYNC_RACE_NONEMPTY);
        return evaluateSync(args[0][0]);
      },
      async(args, resolve, reject) {
        if (args[0].length === 0) throw makeError("Must race at least 1 item", GENSYNC_RACE_NONEMPTY);
        args[0].forEach(item => evaluateAsync(item, resolve, reject));
      },
    }),
  }
);

// Standard API implementation for generators
function makeFunctionAPI(genFn) {
  return {
    sync(...args) {
      return evaluateSync(genFn.apply(this, args));
    },
    async(...args) {
      return new Promise((resolve, reject) => evaluateAsync(genFn.apply(this, args), resolve, reject));
    },
    errback(...args) {
      const cb = args.pop();
      if (typeof cb !== "function") throw makeError("Asynchronous function called without callback", GENSYNC_ERRBACK_NO_CALLBACK);
      try {
        evaluateAsync(genFn.apply(this, args), val => cb(undefined, val), cb);
      } catch (err) {
        cb(err);
      }
    },
  };
}

// Type assertions and error creation
function assertTypeof(type, name, value, allowUndefined) {
  if (typeof value !== type && (!allowUndefined || typeof value !== "undefined")) {
    throw makeError(`Expected opts.${name} to be ${allowUndefined ? `either a ${type}, or undefined.` : `a ${type}.`}`, GENSYNC_OPTIONS_ERROR);
  }
}

function makeError(msg, code) {
  return Object.assign(new Error(msg), { code });
}

// New generator creation function
function newGenerator({ name, arity, sync, async, errback }) {
  assertTypeof("string", "name", name, true);
  assertTypeof("number", "arity", arity, true);
  assertTypeof("function", "sync", sync);
  assertTypeof("function", "async", async, true);
  assertTypeof("function", "errback", errback, true);

  if (async && errback) throw makeError("Expected one of either opts.async or opts.errback, but got _both_.", GENSYNC_OPTIONS_ERROR);

  if (typeof name !== "string") {
    name = [errback, async, sync].find(fn => fn && fn.name)?.name?.replace(/Sync$|Async$/, "") || name;
  }

  if (typeof arity !== "number") {
    arity = sync.length;
  }

  return buildOperation({
    name,
    arity,
    sync(args) {
      return sync.apply(this, args);
    },
    async(args, resolve, reject) {
      if (async) {
        async.apply(this, args).then(resolve, reject);
      } else if (errback) {
        errback.call(this, ...args, (err, value) => err == null ? resolve(value) : reject(err));
      } else {
        resolve(sync.apply(this, args));
      }
    },
  });
}

// Generator wrapping function
function wrapGenerator(genFn) {
  return setFunctionMetadata(genFn.name, genFn.length, function(...args) {
    return genFn.apply(this, args);
  });
}

// Operation builder for sync/async executions
function buildOperation({ name, arity, sync, async }) {
  return setFunctionMetadata(name, arity, function*(...args) {
    const resume = yield GENSYNC_START;
    if (!resume) return sync.call(this, args);

    let result;
    try {
      async.call(
        this,
        args,
        value => {
          if (!result) result = { value };
          resume();
        },
        err => {
          if (!result) result = { err };
          resume();
        }
      );
    } catch (err) {
      result = { err };
      resume();
    }

    yield GENSYNC_SUSPEND;

    if (result.err) throw result.err;
    return result.value;
  });
}

// Evaluator functions for handling generator states
function evaluateSync(gen) {
  let value, result;
  while (!(result = gen.next()).done) {
    assertStart(result.value, gen);
  }
  return result.value;
}

function evaluateAsync(gen, resolve, reject) {
  (function step() {
    try {
      let value, result;
      while (!(result = gen.next()).done) {
        assertStart(result.value, gen);

        let sync = true;
        const out = gen.next(() => sync ? (sync = false) : step());
        sync = false;

        assertSuspend(out, gen);

        if (!sync) return;
      }
      resolve(result.value);
    } catch (err) {
      reject(err);
    }
  })();
}

// Assertions and error handling for generator state
function assertStart(value, gen) {
  if (value !== GENSYNC_START) throwError(gen, makeError(`Got unexpected yielded value in gensync generator: ${JSON.stringify(value)}. Did you perhaps mean to use 'yield*' instead of 'yield'?`, GENSYNC_EXPECTED_START));
}

function assertSuspend({ value, done }, gen) {
  if (done || value !== GENSYNC_SUSPEND) throwError(gen, makeError(done ? "Unexpected generator completion. If you get this, it is probably a gensync bug." : `Expected GENSYNC_SUSPEND, got ${JSON.stringify(value)}. If you get this, it is probably a gensync bug.`, GENSYNC_EXPECTED_SUSPEND));
}

function throwError(gen, err) {
  if (gen.throw) gen.throw(err);
  throw err;
}

// Utilities for metadata handling
function isIterable(value) {
  return !!value && (typeof value === "object" || typeof value === "function") && !value[Symbol.iterator];
}

function setFunctionMetadata(name, arity, fn) {
  if (typeof name === "string") {
    const nameDesc = Object.getOwnPropertyDescriptor(fn, "name");
    if (!nameDesc || nameDesc.configurable) {
      Object.defineProperty(fn, "name", { configurable: true, value: name });
    }
  }

  if (typeof arity === "number") {
    const lengthDesc = Object.getOwnPropertyDescriptor(fn, "length");
    if (!lengthDesc || lengthDesc.configurable) {
      Object.defineProperty(fn, "length", { configurable: true, value: arity });
    }
  }

  return fn;
}
