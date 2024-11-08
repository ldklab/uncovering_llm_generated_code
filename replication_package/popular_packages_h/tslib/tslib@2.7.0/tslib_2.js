/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

(() => {
  const globalObject = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};

  const factoryFunction = (exporter) => {
    const extendStatics = Object.setPrototypeOf || (({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) || function (d, b) {
      for (let p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
    });

    function createExporter(exports, previous) {
      if (exports !== globalObject) {
        if (typeof Object.create === "function") {
          Object.defineProperty(exports, "__esModule", { value: true });
        } else {
          exports.__esModule = true;
        }
      }
      return function (id, v) { return exports[id] = previous ? previous(id, v) : v; };
    }

    const __extends = (d, b) => {
      if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
      extendStatics(d, b);
      function __() { this.constructor = d; }
      d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };

    const __assign = Object.assign || function (t) {
      for (let s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (let p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
      }
      return t;
    };

    const __rest = (s, e) => {
      const t = {};
      for (let p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
      if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (let i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
          if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
            t[p[i]] = s[p[i]];
        }
      return t;
    };

    const __decorate = (decorators, target, key, desc) => {
      let c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
      if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
      else for (let i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
      return c > 3 && r && Object.defineProperty(target, key, r), r;
    };

    const __param = (paramIndex, decorator) => {
      return (target, key) => { decorator(target, key, paramIndex); }
    };

    const __esDecorate = (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) => {
      const accept = (f) => { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; };
      const kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
      const target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
      const descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
      let _, done = false;
      for (let i = decorators.length - 1; i >= 0; i--) {
        const context = {};
        for (let p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (let p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = (f) => { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        const result = decorators[i](kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
          if (result === void 0) continue;
          if (result === null || typeof result !== "object") throw new TypeError("Object expected");
          if (_ = accept(result.get)) descriptor.get = _;
          if (_ = accept(result.set)) descriptor.set = _;
          if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
          if (kind === "field") initializers.unshift(_);
          else descriptor[key] = _;
        }
      }
      if (target) Object.defineProperty(target, contextIn.name, descriptor);
      done = true;
    };

    const __runInitializers = (thisArg, initializers, value) => {
      const useValue = arguments.length > 2;
      for (let i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
      }
      return useValue ? value : void 0;
    };

    const __propKey = (x) => {
      return typeof x === "symbol" ? x : "".concat(x);
    };

    const __setFunctionName = (f, name, prefix) => {
      if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
      return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
    };

    const __metadata = (metadataKey, metadataValue) => {
      if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    };

    const __awaiter = (thisArg, _arguments, P, generator) => {
      function adopt(value) { return value instanceof P ? value : new P((resolve) => { resolve(value); }); }
      return new (P || (P = Promise))((resolve, reject) => {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };

    const __generator = (thisArg, body) => {
      const _ = { label: 0, sent: () => { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
      return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
      function verb(n) { return function (v) { return step([n, v]); }; }
      function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
          if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
          if (y = 0, t) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0: case 1: t = op; break;
            case 4: _.label++; return { value: op[1], done: false };
            case 5: _.label++; y = op[1]; op = [0]; continue;
            case 7: op = _.ops.pop(); _.trys.pop(); continue;
            default:
              if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
              if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
              if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
              if (t[2]) _.ops.pop();
              _.trys.pop(); continue;
          }
          op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
      }
    };

    const __exportStar = (m, o) => {
      for (let p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
    };

    const __createBinding = Object.create ? ((o, m, k, k2) => {
      if (k2 === undefined) k2 = k;
      const desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: () => m[k] };
      }
      Object.defineProperty(o, k2, desc);
    }) : ((o, m, k, k2) => {
      if (k2 === undefined) k2 = k;
      o[k2] = m[k];
    });

    const __values = (o) => {
      const s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
      if (m) return m.call(o);
      if (o && typeof o.length === "number") return {
        next: function () {
          if (o && i >= o.length) o = void 0;
          return { value: o && o[i++], done: !o };
        }
      };
      throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };

    const __read = (o, n) => {
      const m = typeof Symbol === "function" && o[Symbol.iterator];
      if (!m) return o;
      const i = m.call(o), r, ar = [], e;
      try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
      }
      catch (error) { e = { error: error }; }
      finally {
        try {
          if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
      }
      return ar;
    };

    const __spread = () => {
      const ar = [];
      for (let i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
      return ar;
    };

    const __spreadArrays = () => {
      let s = 0;
      for (let i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
      const r = Array(s);
      let k = 0;
      for (let i = 0; i < il; i++) {
        const a = arguments[i];
        for (let j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];
      }
      return r;
    };

    const __spreadArray = (to, from, pack) => {
      if (pack || arguments.length === 2) for (let i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
      return to.concat(ar || Array.prototype.slice.call(from));
    };

    const __await = (v) => {
      return this instanceof __await ? (this.v = v, this) : new __await(v);
    };

    const __asyncGenerator = (thisArg, _arguments, generator) => {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      const g = generator.apply(thisArg, _arguments || []), i, q = [];
      return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function () { return this; }, i;
      function awaitReturn(f) { return function (v) { return Promise.resolve(v).then(f, reject); }; }
      function verb(n, f) { if (g[n]) { i[n] = function (v) { return new Promise((a, b) => { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; if (f) i[n] = f(i[n]); } }
      function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
      function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
      function fulfill(value) { resume("next", value); }
      function reject(value) { resume("throw", value); }
      function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    };

    const __asyncDelegator = (o) => {
      const i = {}, p;
      verb("next"), verb("throw", (e) => { throw e; }), verb("return"), i[Symbol.iterator] = () => { return this; }, i;
      function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: false } : f ? f(v) : v; } : f; }
    };

    const __asyncValues = (o) => {
      if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
      let m = o[Symbol.asyncIterator], i;
      return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
      function verb(n) { i[n] = o[n] && function (v) { return new Promise((resolve, reject) => { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
      function settle(resolve, reject, d, v) { Promise.resolve(v).then((v) => { resolve({ value: v, done: d }); }, reject); }
    };

    const __makeTemplateObject = (cooked, raw) => {
      if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
      return cooked;
    };

    const __setModuleDefault = Object.create ? ((o, v) => {
      Object.defineProperty(o, "default", { enumerable: true, value: v });
    }) : (o, v) => {
      o["default"] = v;
    };

    const __importStar = (mod) => {
      if (mod && mod.__esModule) return mod;
      const result = {};
      if (mod != null) for (const k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
      __setModuleDefault(result, mod);
      return result;
    };

    const __importDefault = (mod) => {
      return (mod && mod.__esModule) ? mod : { "default": mod };
    };

    const __classPrivateFieldGet = (receiver, state, kind, f) => {
      if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
      if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
      return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
    };

    const __classPrivateFieldSet = (receiver, state, value, kind, f) => {
      if (kind === "m") throw new TypeError("Private method is not writable");
      if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
      if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
      return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
    };

    const __classPrivateFieldIn = (state, receiver) => {
      if (receiver === null || (typeof receiver !== "object" && typeof receiver !== "function")) throw new TypeError("Cannot use 'in' operator on non-object");
      return typeof state === "function" ? receiver === state : state.has(receiver);
    };

    const __addDisposableResource = (env, value, async) => {
      if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        let dispose, inner;
        if (async) {
          if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
          dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
          if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
          dispose = value[Symbol.dispose];
          if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
        env.stack.push({ value: value, dispose: dispose, async: async });
      }
      else if (async) {
        env.stack.push({ async: true });
      }
      return value;
    };

    const _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
      const e = new Error(message);
      return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
    };

    const __disposeResources = (env) => {
      function fail(e) {
        env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
        env.hasError = true;
      }
      let r, s = 0;
      function next() {
        while (r = env.stack.pop()) {
          try {
            if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
            if (r.dispose) {
              const result = r.dispose.call(r.value);
              if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) { fail(e); return next(); });
            }
            else s |= 1;
          }
          catch (e) {
            fail(e);
          }
        }
        if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
        if (env.hasError) throw env.error;
      }
      return next();
    };

    exporter("__extends", __extends);
    exporter("__assign", __assign);
    exporter("__rest", __rest);
    exporter("__decorate", __decorate);
    exporter("__param", __param);
    exporter("__esDecorate", __esDecorate);
    exporter("__runInitializers", __runInitializers);
    exporter("__propKey", __propKey);
    exporter("__setFunctionName", __setFunctionName);
    exporter("__metadata", __metadata);
    exporter("__awaiter", __awaiter);
    exporter("__generator", __generator);
    exporter("__exportStar", __exportStar);
    exporter("__createBinding", __createBinding);
    exporter("__values", __values);
    exporter("__read", __read);
    exporter("__spread", __spread);
    exporter("__spreadArrays", __spreadArrays);
    exporter("__spreadArray", __spreadArray);
    exporter("__await", __await);
    exporter("__asyncGenerator", __asyncGenerator);
    exporter("__asyncDelegator", __asyncDelegator);
    exporter("__asyncValues", __asyncValues);
    exporter("__makeTemplateObject", __makeTemplateObject);
    exporter("__importStar", __importStar);
    exporter("__importDefault", __importDefault);
    exporter("__classPrivateFieldGet", __classPrivateFieldGet);
    exporter("__classPrivateFieldSet", __classPrivateFieldSet);
    exporter("__classPrivateFieldIn", __classPrivateFieldIn);
    exporter("__addDisposableResource", __addDisposableResource);
    exporter("__disposeResources", __disposeResources);
  };

  if (typeof define === "function" && define.amd) {
    define("tslib", ["exports"], (exports) => factoryFunction(createExporter(globalObject, createExporter(exports))));
  } else if (typeof module === "object" && typeof module.exports === "object") {
    factoryFunction(createExporter(globalObject, createExporter(module.exports)));
  } else {
    factoryFunction(createExporter(globalObject));
  }
})();
