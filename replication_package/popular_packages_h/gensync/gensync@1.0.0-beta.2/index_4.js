"use strict";

const GENSYNC_START = Symbol.for("gensync:v1:start");
const GENSYNC_SUSPEND = Symbol.for("gensync:v1:suspend");

const ERROR_CODES = {
  EXPECTED_START: "GENSYNC_EXPECTED_START",
  EXPECTED_SUSPEND: "GENSYNC_EXPECTED_SUSPEND",
  OPTIONS_ERROR: "GENSYNC_OPTIONS_ERROR",
  RACE_NONEMPTY: "GENSYNC_RACE_NONEMPTY",
  ERRBACK_NO_CALLBACK: "GENSYNC_ERRBACK_NO_CALLBACK"
};

module.exports = Object.assign(gensync, {
  all: buildOperation({
    name: "all",
    arity: 1,
    sync(args) {
      return Array.from(args[0]).map(evaluateSync);
    },
    async(args, resolve, reject) {
      const items = Array.from(args[0]);
      if (!items.length) return Promise.resolve().then(() => resolve([]));

      let count = 0, results = items.map(() => undefined);
      items.forEach((item, i) => evaluateAsync(item, val => {
        results[i] = val;
        if (++count === results.length) resolve(results);
      }, reject));
    }
  }),
  race: buildOperation({
    name: "race",
    arity: 1,
    sync(args) {
      const items = Array.from(args[0]);
      if (!items.length) throw makeError("Must race at least 1 item", ERROR_CODES.RACE_NONEMPTY);
      return evaluateSync(items[0]);
    },
    async(args, resolve, reject) {
      const items = Array.from(args[0]);
      if (!items.length) throw makeError("Must race at least 1 item", ERROR_CODES.RACE_NONEMPTY);
      items.forEach(item => evaluateAsync(item, resolve, reject));
    }
  })
});

function gensync(optsOrFn) {
  const genFn = typeof optsOrFn === "function"
    ? wrapGenerator(optsOrFn)
    : newGenerator(optsOrFn);
  return Object.assign(genFn, makeFunctionAPI(genFn));
}

function makeFunctionAPI(genFn) {
  return {
    sync(...args) {
      return evaluateSync(genFn.apply(this, args));
    },
    async(...args) {
      return new Promise((resolve, reject) => {
        evaluateAsync(genFn.apply(this, args), resolve, reject);
      });
    },
    errback(...args) {
      const cb = args.pop();
      if (typeof cb !== "function") throw makeError("Asynchronous function called without callback", ERROR_CODES.ERRBACK_NO_CALLBACK);

      let gen;
      try {
        gen = genFn.apply(this, args);
      } catch (err) {
        cb(err);
        return;
      }

      evaluateAsync(gen, val => cb(undefined, val), err => cb(err));
    }
  };
}

function assertTypeof(type, name, value, allowUndefined) {
  if (typeof value !== type && (!allowUndefined || typeof value !== "undefined")) {
    throw makeError(`Expected opts.${name} to be ${allowUndefined ? 'either ' : ''}a ${type}${allowUndefined ? ', or undefined' : ''}.`, ERROR_CODES.OPTIONS_ERROR);
  }
}

function makeError(msg, code) {
  return Object.assign(new Error(msg), { code });
}

function newGenerator({ name, arity, sync, async, errback }) {
  assertTypeof("function", "sync", sync);
  assertTypeof("function", "async", async, true);
  assertTypeof("function", "errback", errback, true);
  if (async && errback) throw makeError("Expected one of either opts.async or opts.errback, but got both.", ERROR_CODES.OPTIONS_ERROR);

  if (typeof name !== "string") {
    name = [errback, async, sync].find(fn => fn && fn.name).name.replace(/(?:Async|Sync)$/, "");
  }

  arity = arity || sync.length;

  return buildOperation({
    name, arity,
    sync(args) {
      return sync.apply(this, args);
    },
    async(args, resolve, reject) {
      if (async) async.apply(this, args).then(resolve, reject);
      else if (errback) errback.call(this, ...args, (err, value) => err == null ? resolve(value) : reject(err));
      else resolve(sync.apply(this, args));
    }
  });
}

function wrapGenerator(genFn) {
  return setFunctionMetadata(genFn.name, genFn.length, function(...args) {
    return genFn.apply(this, args);
  });
}

function buildOperation({ name, arity, sync, async }) {
  return setFunctionMetadata(name, arity, function*(...args) {
    const resume = yield GENSYNC_START;
    if (!resume) return sync.call(this, args);

    let result;
    try {
      async.call(this, args, value => {
        if (!result) {
          result = { value };
          resume();
        }
      }, err => {
        if (!result) {
          result = { err };
          resume();
        }
      });
    } catch (err) {
      result = { err };
      resume();
    }

    yield GENSYNC_SUSPEND;
    if (result.hasOwnProperty("err")) throw result.err;
    return result.value;
  });
}

function evaluateSync(gen) {
  let value;
  while (!({ value } = gen.next()).done) assertStart(value, gen);
  return value;
}

function evaluateAsync(gen, resolve, reject) {
  (function step() {
    try {
      let value;
      while (!({ value } = gen.next()).done) {
        assertStart(value, gen);
        const didSyncResume = gen.next(() => step()).value === GENSYNC_SUSPEND;
        if (!didSyncResume) return;
      }
      resolve(value);
    } catch (err) {
      reject(err);
    }
  })();
}

function assertStart(value, gen) {
  if (value !== GENSYNC_START) throwError(gen, makeError(`Unexpected yielded value: ${JSON.stringify(value)}. Use 'yield*' instead of 'yield'?`, ERROR_CODES.EXPECTED_START));
}

function assertSuspend({ value, done }, gen) {
  if (!done && value === GENSYNC_SUSPEND) return;
  throwError(gen, makeError(done ? "Unexpected generator completion." : `Expected GENSYNC_SUSPEND, got ${JSON.stringify(value)}.`, ERROR_CODES.EXPECTED_SUSPEND));
}

function throwError(gen, err) {
  if (gen.throw) gen.throw(err);
  throw err;
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
