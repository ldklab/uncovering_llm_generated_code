(function (exports) {
  "use strict";

  const Op = Object.prototype;
  const hasOwn = Op.hasOwnProperty;

  const defineProperty = Object.defineProperty || function (obj, key, desc) {
    obj[key] = desc.value;
  };

  let undefined; 
  const $Symbol = typeof Symbol === "function" ? Symbol : {};

  const iteratorSymbol = $Symbol.iterator || "@@iterator";
  const asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
  const toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";

  function define(obj, key, value) {
    try {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } catch {
      obj[key] = value;
    }
    return obj[key];
  }

  function wrap(innerFn, outerFn, self, tryLocsList) {
    const protoGenerator = outerFn?.prototype instanceof Generator ? outerFn : Generator;
    const generator = Object.create(protoGenerator.prototype);
    const context = new Context(tryLocsList || []);
    defineProperty(generator, "_invoke", { value: makeInvokeMethod(innerFn, self, context) });
    return generator;
  }
  exports.wrap = wrap;

  function tryCatch(fn, obj, arg) {
    try {
      return { type: "normal", arg: fn.call(obj, arg) };
    } catch (err) {
      return { type: "throw", arg: err };
    }
  }

  const GenState = {
    SuspendedStart: "suspendedStart",
    SuspendedYield: "suspendedYield",
    Executing: "executing",
    Completed: "completed"
  };

  const ContinueSentinel = {};

  class Generator {}
  class GeneratorFunction {}
  class GeneratorFunctionPrototype {}

  const IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });

  const NativeIteratorPrototype = Object.getPrototypeOf?.(Object.getPrototypeOf(values([])));
  if (NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
    Object.assign(IteratorPrototype, NativeIteratorPrototype);
  }

  const Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  GeneratorFunction.prototype = GeneratorFunctionPrototype;
  defineProperty(Gp, "constructor", { value: GeneratorFunctionPrototype, configurable: true });
  defineProperty(GeneratorFunctionPrototype, "constructor", { value: GeneratorFunction, configurable: true });
  GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction");

  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(method => {
      define(prototype, method, function(arg) {
        return this._invoke(method, arg);
      });
    });
  }

  exports.isGeneratorFunction = genFun => {
    const ctor = typeof genFun === "function" && genFun.constructor;
    return ctor ? ctor === GeneratorFunction || (ctor.displayName || ctor.name) === "GeneratorFunction" : false;
  };

  exports.mark = genFun => {
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
    } else {
      genFun.__proto__ = GeneratorFunctionPrototype;
      define(genFun, toStringTagSymbol, "GeneratorFunction");
    }
    genFun.prototype = Object.create(Gp);
    return genFun;
  };

  exports.awrap = arg => ({ __await: arg });

  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      const record = tryCatch(generator[method], generator, arg);
      if (record.type === "throw") {
        reject(record.arg);
      } else {
        const result = record.arg;
        if (result.value && typeof result.value === "object" && hasOwn.call(result.value, "__await")) {
          PromiseImpl.resolve(result.value.__await).then(val => invoke("next", val, resolve, reject), err => invoke("throw", err, resolve, reject));
          return;
        }
        PromiseImpl.resolve(result.value).then(unwrapped => {
          result.value = unwrapped;
          resolve(result);
        }, error => invoke("throw", error, resolve, reject));
      }
    }

    let previousPromise;
    function enqueue(method, arg) {
      function callInvokeWithMethodAndArg() {
        return new PromiseImpl((resolve, reject) => invoke(method, arg, resolve, reject));
      }
      return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
    }
    defineProperty(this, "_invoke", { value: enqueue });
  }

  defineIteratorMethods(AsyncIterator.prototype);
  define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  });

  exports.AsyncIterator = AsyncIterator;

  exports.async = function(innerFn, outerFn, self, tryLocsList, PromiseImpl = Promise) {
    const iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
    return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(result => result.done ? result.value : iter.next());
  };

  function makeInvokeMethod(innerFn, self, context) {
    let state = GenState.SuspendedStart;
    return function invoke(method, arg) {
      if (state === GenState.Executing) throw new Error("Generator is already running");
      if (state === GenState.Completed) {
        if (method === "throw") throw arg;
        return doneResult();
      }
      context.method = method;
      context.arg = arg;
      while (true) {
        const delegate = context.delegate;
        if (delegate) {
          const delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }
        if (context.method === "next") {
          context.sent = context._sent = context.arg;
        } else if (context.method === "throw") {
          if (state === GenState.SuspendedStart) {
            state = GenState.Completed;
            throw context.arg;
          }
          context.dispatchException(context.arg);
        } else if (context.method === "return") {
          context.abrupt("return", context.arg);
        }
        state = GenState.Executing;
        const record = tryCatch(innerFn, self, context);
        if (record.type === "normal") {
          state = context.done ? GenState.Completed : GenState.SuspendedYield;
          if (record.arg === ContinueSentinel) continue;
          return { value: record.arg, done: context.done };
        } else if (record.type === "throw") {
          state = GenState.Completed;
          context.method = "throw";
          context.arg = record.arg;
        }
      }
    };
  }

  function maybeInvokeDelegate(delegate, context) {
    const method = delegate.iterator[context.method];
    if (!method) {
      context.delegate = null;
      if (context.method === "throw" && delegate.iterator["return"]) {
        context.method = "return";
        context.arg = undefined;
        maybeInvokeDelegate(delegate, context);
        if (context.method === "throw") return ContinueSentinel;
      }
      if (context.method !== "return") {
        context.method = "throw";
        context.arg = new TypeError(`The iterator does not provide a '${context.method}' method`);
      }
      return ContinueSentinel;
    }
    const record = tryCatch(method, delegate.iterator, context.arg);
    if (record.type === "throw") {
      context.method = "throw";
      context.arg = record.arg;
      context.delegate = null;
      return ContinueSentinel;
    }
    const info = record.arg;
    if (!info) {
      context.method = "throw";
      context.arg = new TypeError("iterator result is not an object");
      context.delegate = null;
      return ContinueSentinel;
    }
    if (info.done) {
      context[delegate.resultName] = info.value;
      context.next = delegate.nextLoc;
      context.method = "next";
      context.arg = undefined;
    } else {
      return info;
    }
    context.delegate = null;
    return ContinueSentinel;
  }

  defineIteratorMethods(Gp);

  define(Gp, toStringTagSymbol, "Generator");
  define(Gp, iteratorSymbol, function() { return this; });
  define(Gp, "toString", function() { return "[object Generator]"; });

  function pushTryEntry(locs) {
    const entry = { tryLoc: locs[0] };
    if (1 in locs) entry.catchLoc = locs[1];
    if (2 in locs) {
      entry.finallyLoc = locs[2];
      entry.afterLoc = locs[3];
    }
    this.tryEntries.push(entry);
  }

  function resetTryEntry(entry) {
    const record = entry.completion || {};
    record.type = "normal";
    delete record.arg;
    entry.completion = record;
  }

  function Context(tryLocsList) {
    this.tryEntries = [{ tryLoc: "root" }];
    tryLocsList.forEach(pushTryEntry, this);
    this.reset(true);
  }

  exports.keys = function(val) {
    const object = Object(val);
    const keys = [];
    for (let key in object) {
      keys.push(key);
    }
    keys.reverse();
    return function next() {
      while (keys.length) {
        const key = keys.pop();
        if (key in object) {
          next.value = key;
          next.done = false;
          return next;
        }
      }
      next.done = true;
      return next;
    };
  };

  function values(iterable) {
    if (iterable != null) {
      const iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) {
        return iteratorMethod.call(iterable);
      }
      if (typeof iterable.next === "function") return iterable;
      if (!isNaN(iterable.length)) {
        let i = -1;
        const next = function next() {
          while (++i < iterable.length) {
            if (hasOwn.call(iterable, i)) {
              next.value = iterable[i];
              next.done = false;
              return next;
            }
          }
          next.value = undefined;
          next.done = true;
          return next;
        };
        return next.next = next;
      }
    }
    throw new TypeError(`${typeof iterable} is not iterable`);
  }
  exports.values = values;

  function doneResult() {
    return { value: undefined, done: true };
  }

  Context.prototype = {
    constructor: Context,
    reset(skipTempReset) {
      this.prev = 0;
      this.next = 0;
      this.sent = this._sent = undefined;
      this.done = false;
      this.delegate = null;
      this.method = "next";
      this.arg = undefined;
      this.tryEntries.forEach(resetTryEntry);
      if (!skipTempReset) {
        for (const name in this) {
          if (name.charAt(0) === "t" && hasOwn.call(this, name) && !isNaN(+name.slice(1))) {
            this[name] = undefined;
          }
        }
      }
    },
    stop() {
      this.done = true;
      const rootEntry = this.tryEntries[0];
      const rootRecord = rootEntry.completion;
      if (rootRecord.type === "throw") throw rootRecord.arg;
      return this.rval;
    },
    dispatchException(exception) {
      if (this.done) throw exception;
      const context = this;
      function handle(loc, caught) {
        const record = { type: "throw", arg: exception };
        context.next = loc;
        if (caught) {
          context.method = "next";
          context.arg = undefined;
        }
        return !!caught;
      }
      for (let i = this.tryEntries.length - 1; i >= 0; --i) {
        const entry = this.tryEntries[i];
        const record = entry.completion;
        if (entry.tryLoc === "root") return handle("end");
        if (entry.tryLoc <= this.prev) {
          if (hasOwn.call(entry, "catchLoc") && this.prev < entry.catchLoc) {
            return handle(entry.catchLoc, true);
          } else if (this.prev < entry.finallyLoc) {
            return handle(entry.finallyLoc);
          }
        }
      }
    },
    abrupt(type, arg) {
      for (let i = this.tryEntries.length - 1; i >= 0; --i) {
        const entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          let finallyEntry = entry;
          if (finallyEntry && (type === "break" || type === "continue") && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc) {
            finallyEntry = null;
          }
          const record = finallyEntry ? finallyEntry.completion : {};
          record.type = type;
          record.arg = arg;
          if (finallyEntry) {
            this.method = "next";
            this.next = finallyEntry.finallyLoc;
            return ContinueSentinel;
          }
          return this.complete(record);
        }
      }
    },
    complete(record, afterLoc) {
      if (record.type === "throw") throw record.arg;
      if (record.type === "break" || record.type === "continue") {
        this.next = record.arg;
      } else if (record.type === "return") {
        this.rval = this.arg = record.arg;
        this.method = "return";
        this.next = "end";
      } else if (record.type === "normal" && afterLoc) {
        this.next = afterLoc;
      }
      return ContinueSentinel;
    },
    finish(finallyLoc) {
      for (let i = this.tryEntries.length - 1; i >= 0; --i) {
        const entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) {
          this.complete(entry.completion, entry.afterLoc);
          resetTryEntry(entry);
          return ContinueSentinel;
        }
      }
    },
    "catch"(tryLoc) {
      for (let i = this.tryEntries.length - 1; i >= 0; --i) {
        const entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          const record = entry.completion;
          if (record.type === "throw") {
            const thrown = record.arg;
            resetTryEntry(entry);
            return thrown;
          }
        }
      }
      throw new Error("illegal catch attempt");
    },
    delegateYield(iterable, resultName, nextLoc) {
      this.delegate = {
        iterator: values(iterable),
        resultName,
        nextLoc
      };
      if (this.method === "next") this.arg = undefined;
      return ContinueSentinel;
    }
  };

  return exports;

})((typeof module === "object" ? module.exports : {}));
try {
  regeneratorRuntime = runtime;
} catch {
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}
