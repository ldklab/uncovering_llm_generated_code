"use strict";

const GENSYNC_START = Symbol.for("gensync:v1:start");
const GENSYNC_SUSPEND = Symbol.for("gensync:v1:suspend");

const ERRORS = {
  EXPECTED_START: "GENSYNC_EXPECTED_START",
  EXPECTED_SUSPEND: "GENSYNC_EXPECTED_SUSPEND",
  OPTIONS_ERROR: "GENSYNC_OPTIONS_ERROR",
  RACE_NONEMPTY: "GENSYNC_RACE_NONEMPTY",
  ERRBACK_NO_CALLBACK: "GENSYNC_ERRBACK_NO_CALLBACK",
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
      if (items.length === 0) {
        Promise.resolve().then(() => resolve([]));
        return;
      }
      let count = 0;
      const results = items.map(() => undefined);
      items.forEach((item, i) => {
        evaluateAsync(item,
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
      const items = Array.from(args[0]);
      if (items.length === 0) throw makeError("Must race at least 1 item", ERRORS.RACE_NONEMPTY);
      return evaluateSync(items[0]);
    },
    async(args, resolve, reject) {
      const items = Array.from(args[0]);
      if (items.length === 0) throw makeError("Must race at least 1 item", ERRORS.RACE_NONEMPTY);
      items.forEach(item => evaluateAsync(item, resolve, reject));
    },
  })
});

function gensync(optsOrFn) {
  const genFn = typeof optsOrFn === "function" ? wrapGenerator(optsOrFn) : newGenerator(optsOrFn);
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
      if (typeof cb !== "function") throw makeError("Asynchronous function called without callback", ERRORS.ERRBACK_NO_CALLBACK);
      try {
        evaluateAsync(genFn.apply(this, args), val => cb(undefined, val), cb);
      } catch (err) {
        cb(err);
      }
    }
  };
}

function newGenerator({ name, arity, sync, async, errback }) {
  assertTypeof("string", "name", name, true);
  assertTypeof("number", "arity", arity, true);
  assertTypeof("function", "sync", sync);
  assertTypeof("function", "async", async, true);
  assertTypeof("function", "errback", errback, true);
  if (async && errback) throw makeError("Expected one of either opts.async or opts.errback, but got _both_.", ERRORS.OPTIONS_ERROR);

  name = determineName(name, { errback, async, sync });
  arity = typeof arity !== "number" ? sync.length : arity;

  return buildOperation({
    name,
    arity,
    sync(args) { return sync.apply(this, args); },
    async(args, resolve, reject) {
      if (async) {
        async.apply(this, args).then(resolve, reject);
      } else if (errback) {
        errback.call(this, ...args, (err, value) => (err == null ? resolve(value) : reject(err)));
      } else {
        resolve(sync.apply(this, args));
      }
    },
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
      async.call(this, args, value => handleCallback({ value }, resume), err => handleCallback({ err }, resume));
    } catch (err) {
      result = { err };
      resume();
    }

    yield GENSYNC_SUSPEND;

    if ('err' in result) throw result.err;
    return result.value;
  });
}

function evaluateSync(gen) {
  let res;
  for (let { value, done } = gen.next(); !done; { value, done } = gen.next()) {
    assertStart(value, gen);
    res = value;
  }
  return res;
}

function evaluateAsync(gen, resolve, reject) {
  (function step() {
    try {
      let res;
      for (let { value, done } = gen.next(); !done; { value, done } = gen.next()) {
        assertStart(value, gen);
        handleAsyncStep(gen, step);
        return;
      }
      resolve(res);
    } catch (err) {
      reject(err);
    }
  })();
}

function handleAsyncStep(gen, step) {
  let sync = true, didSyncResume = false;
  while (!sync || !didSyncResume) {
    const out = gen.next(() => {
      if (sync) didSyncResume = true;
      else step();
    });
    sync = false;
    assertSuspend(out, gen);
    if (!didSyncResume) return;
  }
}

function assertStart(value, gen) {
  if (value === GENSYNC_START) return;
  throwError(gen, makeError(`Got unexpected yielded value in gensync generator: ${JSON.stringify(value)}. Did you perhaps mean to use 'yield*' instead of 'yield'?`, ERRORS.EXPECTED_START));
}

function assertSuspend({ value, done }, gen) {
  if (!done && value === GENSYNC_SUSPEND) return;
  throwError(gen, makeError(done ? "Unexpected generator completion." : `Expected GENSYNC_SUSPEND, got ${JSON.stringify(value)}.`, ERRORS.EXPECTED_SUSPEND));
}

function throwError(gen, err) {
  if (gen.throw) gen.throw(err);
  throw err;
}

function assertTypeof(type, name, value, allowUndefined) {
  if (typeof value === type || (allowUndefined && value === undefined)) return;
  throw makeError(`Expected opts.${name} to be ${type}, got ${typeof value}.`, ERRORS.OPTIONS_ERROR);
}

function makeError(msg, code) {
  return Object.assign(new Error(msg), { code });
}

function determineName(name, { errback, async, sync }) {
  if (typeof name !== "string") {
    name = (errback && errback.name !== "errback" && errback.name)
      || (async && async.name.replace(/Async$/, ""))
      || (sync && sync.name.replace(/Sync$/, ""));
  }
  return name;
}

function setFunctionMetadata(name, arity, fn) {
  if (typeof name === "string") {
    const nameDesc = Object.getOwnPropertyDescriptor(fn, "name");
    if (!nameDesc || nameDesc.configurable) {
      Object.defineProperty(fn, "name", { ...nameDesc, configurable: true, value: name });
    }
  }
  if (typeof arity === "number") {
    const lengthDesc = Object.getOwnPropertyDescriptor(fn, "length");
    if (!lengthDesc || lengthDesc.configurable) {
      Object.defineProperty(fn, "length", { ...lengthDesc, configurable: true, value: arity });
    }
  }
  return fn;
}
