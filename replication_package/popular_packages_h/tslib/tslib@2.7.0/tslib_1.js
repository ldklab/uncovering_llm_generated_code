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
/* global global, define, Symbol, Reflect, Promise, SuppressedError, Iterator */
let __extends, __assign, __rest, __decorate, __param, __esDecorate, __runInitializers, __propKey;
let __setFunctionName, __metadata, __awaiter, __generator, __exportStar, __values, __read, __spread;
let __spreadArrays, __spreadArray, __await, __asyncGenerator, __asyncDelegator, __asyncValues;
let __makeTemplateObject, __importStar, __importDefault, __classPrivateFieldGet, __classPrivateFieldSet;
let __classPrivateFieldIn, __createBinding, __addDisposableResource, __disposeResources;

(function (factory) {
    const root = typeof global === "object" ? global : typeof self === "object" ? self : {};
    if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], (exports) => factory(createExporter(root, createExporter(exports))));
    } else if (typeof module === "object" && typeof module.exports === "object") {
        factory(createExporter(root, createExporter(module.exports)));
    } else {
        factory(createExporter(root));
    }
    
    function createExporter(exports, previous) {
        if (exports !== root) {
            if (typeof Object.create === "function") {
                Object.defineProperty(exports, "__esModule", { value: true });
            } else {
                exports.__esModule = true;
            }
        }
        return (id, v) => exports[id] = previous ? previous(id, v) : v;
    }
})(function (exporter) {

    const extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && ((d, b) => d.__proto__ = b)) ||
        ((d, b) => {
            for (let p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
         });

    __extends = function (derived, base) {
        if (typeof base !== "function" && base !== null)
            throw new TypeError("Class extends value " + String(base) + " is not a constructor or null");
        
        extendStatics(derived, base);

        function __() { this.constructor = derived; }
        derived.prototype = base === null ? Object.create(base) : (__.prototype = base.prototype, new __());
    };

    __assign = Object.assign || function (target, ...sources) {
        sources.forEach(source => {
            for (let key in source) if (Object.prototype.hasOwnProperty.call(source, key)) target[key] = source[key];
        });
        return target;
    };

    __rest = function (source, exclude) {
        const target = {};
        for (let key in source) if (Object.prototype.hasOwnProperty.call(source, key) && exclude.indexOf(key) < 0) target[key] = source[key];
        
        if (source && typeof Object.getOwnPropertySymbols === "function") {
            Object.getOwnPropertySymbols(source).forEach(sym => {
                if (exclude.indexOf(sym) < 0 && Object.prototype.propertyIsEnumerable.call(source, sym)) target[sym] = source[sym];
            });
        }
        return target;
    };

    __decorate = function (decorators, target, key, desc) {
        let c = arguments.length;
        let r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
        let d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") {
            r = Reflect.decorate(decorators, target, key, desc);
        } else {
            for (let i = decorators.length - 1; i >= 0; i--) {
                if (d = decorators[i]) {
                    r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
                }
            }
        }
        if (c > 3 && r && Object.defineProperty(target, key, r)) return r;
    };

    __param = function (paramIndex, decorator) {
        return (target, key) => decorator(target, key, paramIndex);
    };

    __esDecorate = function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
        function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
        let kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
        const target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
        const descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
        let _, done = false;

        for (let i = decorators.length - 1; i >= 0; i--) {
            const context = {};
            for (let p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
            for (let p in contextIn.access) context.access[p] = contextIn.access[p];
            context.addInitializer = f => { 
                if (done) throw new TypeError("Cannot add initializers after decoration has completed"); 
                extraInitializers.push(accept(f || null)); 
            };

            const result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
            if (kind === "accessor") {
                if (result === void 0) continue;
                if (result === null || typeof result !== "object") throw new TypeError("Object expected");
                descriptor.get = accept(result.get);
                descriptor.set = accept(result.set);
                descriptor.init = accept(result.init);
            } else if ((accept(result))) {
                if (kind === "field") initializers.unshift(accept(result));
                else descriptor[key] = accept(result);
            }
        }

        if (target) Object.defineProperty(target, contextIn.name, descriptor);
        done = true;
    };

    __runInitializers = function (thisArg, initializers, value) {
        const useValue = arguments.length > 2;
        initializers.forEach(initializer => {
            value = useValue ? initializer.call(thisArg, value) : initializer.call(thisArg);
        });
        return useValue ? value : void 0;
    };

    __propKey = function (x) {
        return typeof x === "symbol" ? x : "".concat(x);
    };

    __setFunctionName = function (f, name, prefix) {
        if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
        return Object.defineProperty(f, "name", { configurable: true, value: prefix ? "".concat(prefix, " ", name) : name });
    };

    __metadata = function (metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    };

    __awaiter = function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P((resolve) => resolve(value)); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };

    __generator = function (thisArg, body) {
        const _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] };
        let f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
        const verb = n => v => step([n, v]);
        const step = op => {
            if (f) throw new TypeError("Generator is already executing.");
            g && (g = 0, op[0] && (_ = 0)), _;
            try {
                if (y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
                t && (op = [op[0] & 2, t.value]);
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
        };
        return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    };

    __exportStar = function(module, exports) {
        for (let prop in module) if (prop !== "default" && !Object.prototype.hasOwnProperty.call(exports, prop)) __createBinding(exports, module, prop);
    };

    __createBinding = Object.create ? ((exports, module, key, alias) => {
        if (alias === undefined) alias = key;
        const desc = Object.getOwnPropertyDescriptor(module, key);
        if (!desc || ("get" in desc ? !module.__esModule : desc.writable || desc.configurable)) {
            Object.defineProperty(exports, alias, { enumerable: true, get: () => module[key] });
        }
    }) : ((exports, module, key, alias) => {
        if (alias === undefined) alias = key;
        exports[alias] = module[key];
    });

    __values = function (object) {
        const SymbolIterator = typeof Symbol === "function" && Symbol.iterator;
        const iterator = SymbolIterator && object[SymbolIterator];
        let index = 0;
        if (iterator) return iterator.call(object);
        if (object && typeof object.length === "number") return {
            next: function () {
                if (object && index >= object.length) object = void 0;
                return { value: object && object[index++], done: !object };
            }
        };
        throw new TypeError(SymbolIterator ? "Object is not iterable." : "Symbol.iterator is not defined.");
    };

    __read = function (object, limit) {
        const SymbolIterator = typeof Symbol === "function" && object[Symbol.iterator];
        if (!SymbolIterator) return object;
        const iterator = SymbolIterator.call(object), result = [], error = {};
        try {
            while ((limit === void 0 || limit-- > 0) && !(result = iterator.next()).done) result.push(result.value);
        }
        catch (err) { error.error = err; }
        finally {
            try {
                if (result && !result.done && (SymbolIterator = iterator["return"])) SymbolIterator.call(iterator);
            }
            finally { if (error.error) throw error.error; }
        }
        return result;
    };

    /** @deprecated */
    __spread = function () {
        let result = [];
        for (let i = 0; i < arguments.length; i++)
            result = result.concat(__read(arguments[i]));
        return result;
    };

    /** @deprecated */
    __spreadArrays = function () {
        let totalLength = 0;
        for (let i = 0; i < arguments.length; i++) totalLength += arguments[i].length;
        const result = Array(totalLength);
        let index = 0;
        for (let i = 0; i < arguments.length; i++) {
            const array = arguments[i];
            for (let j = 0; j < array.length; j++, index++) {
                result[index] = array[j];
            }
        }
        return result;
    };

    __spreadArray = function (to, from, packed) {
        if (packed || arguments.length === 2) {
            let i = 0, length = from.length, arrayCopy;
            while (i < length) {
                if (arrayCopy || !(i in from)) {
                    if (!arrayCopy) arrayCopy = Array.prototype.slice.call(from, 0, i);
                    arrayCopy[i] = from[i];
                }
                i++;
            }
            return to.concat(arrayCopy || Array.prototype.slice.call(from));
        }
        return to.concat(from);
    };

    __await = function (value) {
        return this instanceof __await ? (this.v = value, this) : new __await(value);
    };

    __asyncGenerator = function (thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        let generatorObject = generator.apply(thisArg, _arguments || []);
        let iterator, queue = [];

        function awaitResolve(method) {
            return function (value) {
                return Promise.resolve(value).then(method, reject);
            };
        }

        function reject(value) {
            resume("throw", value);
        }

        function verb(helperMethod, method) {
            if (generatorObject[helperMethod]) {
                iterator[helperMethod] = function (value) {
                    return new Promise((resolve, reject) => {
                        queue.push([helperMethod, value, resolve, reject]) > 1 || resume(helperMethod, value);
                    });
                };
                if (method) iterator[helperMethod] = method(iterator[helperMethod]);
            }
        }

        function resume(helperMethod, value) {
            try {
                step(generatorObject[helperMethod](value));
            } catch (e) {
                settle(queue[0][3], e);
            }
        }

        function step(promiseResult) {
            promiseResult.value instanceof __await ? Promise.resolve(promiseResult.value.v).then(fulfill, reject) : settle(queue[0][2], promiseResult);
        }

        function fulfill(value) {
            resume("next", value);
        }

        function settle(resolveFn, reason) { 
            if (resolveFn(reason), queue.shift(), queue.length) resume(queue[0][0], queue[0][1]); 
        }

        const iteratorPrototype = {
            next: verb("next"),
            "throw": verb("throw"),
            "return": verb("return", awaitResolve),
            [Symbol.asyncIterator]: function () { return this; }
        };
        const AsyncIteratorPolyfill = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype);

        return (iterator = Object.create(AsyncIteratorPolyfill, iteratorPrototype)), iterator;
    };

    __asyncDelegator = function (iteratorObject) {
        let awaiting, pending;
        const iterator = {};

        function promiseMethodHelper(method, handler) {
            iterator[method] = iteratorObject[method] ? function (value) {
                return (pending = !pending) ? { value: __await(iteratorObject[method](value)), done: false } : handler ? handler(value) : value;
            } : handler;
        }

        promiseMethodHelper("next");
        promiseMethodHelper("throw", (e) => { throw e; });
        promiseMethodHelper("return");

        iterator[Symbol.iterator] = function () { return this; };

        return iterator;
    };

    __asyncValues = function (object) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        const asyncIterator = object[Symbol.asyncIterator];
        let iterator;
        return asyncIterator ? asyncIterator.call(object) : ((iterator = (typeof __values === "function" ? __values(object) : object[Symbol.iterator]())), {
            async resolveMethod(resolve, reject, done, value) { Promise.resolve(value).then((v) => resolve({ value: v, done }), reject); },
            [Symbol.asyncIterator]: function () { return this; },
            next: (v) => new Promise((resolve, reject) => resolveMethod(resolve, reject, iterator.next(v))),
            "throw": function (v) { if (typeof iterator["throw"] === "function") return new Promise((resolve, reject) => resolveMethod(resolve, reject, done, iterator["throw"](v))); },
            "return": function (v) { if (typeof iterator["return"] === "function") return new Promise((resolve, reject) => resolveMethod(resolve, reject, done, iterator["return"](v))); }
        });
    };

    __makeTemplateObject = function (cooked, raw) {
        if (Object.defineProperty) {
            Object.defineProperty(cooked, "raw", { value: raw });
        } else {
            cooked.raw = raw;
        }
        return cooked;
    };

    const __setModuleDefault = Object.create ? ((object, value) => {
        Object.defineProperty(object, "default", { enumerable: true, value: value });
    }) : function (object, value) {
        object["default"] = value;
    };

    __importStar = function (module) {
        if (module && module.__esModule) return module;
        const result = {};
        if (module != null) for (const prop in module) if (prop !== "default" && module.hasOwnProperty(prop)) __createBinding(result, module, prop);
        __setModuleDefault(result, module);
        return result;
    };

    __importDefault = function (module) {
        return (module && module.__esModule) ? module : { "default": module };
    };

    __classPrivateFieldGet = function (object, state, kind, helperMethod) {
        if (kind === "a" && !helperMethod) throw new TypeError("Private accessor was defined without a getter");
        if (typeof state === "function" ? object !== state || !helperMethod : !state.has(object))
            throw new TypeError("Cannot read private member from an object whose class did not declare it");
        return kind === "m" ? helperMethod : kind === "a" ? helperMethod.call(object) : helperMethod ? helperMethod.value : state.get(object);
    };

    __classPrivateFieldSet = function (object, state, value, kind, helperMethod) {
        if (kind === "m") throw new TypeError("Private method is not writable");
        if (kind === "a" && !helperMethod) throw new TypeError("Private accessor was defined without a setter");
        if (typeof state === "function" ? object !== state || !helperMethod : !state.has(object))
            throw new TypeError("Cannot write private member to an object whose class did not declare it");
        return (kind === "a" ? helperMethod.call(object, value) : helperMethod ? helperMethod.value = value : state.set(object, value)), value;
    };

    __classPrivateFieldIn = function (state, object) {
        if (object === null || (typeof object !== "object" && typeof object !== "function"))
            throw new TypeError("Cannot use 'in' operator on non-object");
        return typeof state === "function" ? object === state : state.has(object);
    };

    __addDisposableResource = function (env, value, isAsync) {
        if (value !== null && value !== void 0) {
            if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
            let disposeMethod, inner;
            if (isAsync) {
                if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
                disposeMethod = value[Symbol.asyncDispose];
            } 
            if (disposeMethod === void 0) {
                if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
                disposeMethod = value[Symbol.dispose];
                if (isAsync) inner = disposeMethod;
            }
            if (typeof disposeMethod !== "function") throw new TypeError("Object not disposable.");
            if (inner) disposeMethod = function() { try { inner.call(this); } catch (e) { return Promise.reject(e); } };
            env.stack.push({ value: value, dispose: disposeMethod, async: isAsync });
        } else if (isAsync) {
            env.stack.push({ async: true });
        }
        return value;
    };

    const SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
        const e = new Error(message);
        e.name = "SuppressedError";
        e.error = error;
        e.suppressed = suppressed;
        return e;
    };

    __disposeResources = function (env) {
        let attemptToDisposeResource, skipped = 0;

        function errorEncountered(err) {
            env.error = env.hasError ? new SuppressedError(err, env.error, "An error was suppressed during disposal.") : err;
            env.hasError = true;
        }

        function iterateThroughResources() {
            while (attemptToDisposeResource = env.stack.pop()) {
                try {
                    const disposeMethod = attemptToDisposeResource.dispose;
                    const isAsync = attemptToDisposeResource.async;
                    const resourceVal = attemptToDisposeResource.value;

                    if (!isAsync && skipped === 1) return (skipped = 0, env.stack.push(attemptToDisposeResource), Promise.resolve().then(iterateThroughResources));
                    if (disposeMethod) {
                        const result = disposeMethod.call(resourceVal);
                        if (isAsync) return (skipped |= 2, Promise.resolve(result).then(iterateThroughResources, e => { errorEncountered(e); return iterateThroughResources(); }));
                    } else skipped |= 1;
                } catch (e) {
                    errorEncountered(e);
                }
            }
            if (skipped === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
            if (env.hasError) throw env.error;
        }
        return iterateThroughResources();
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

});
