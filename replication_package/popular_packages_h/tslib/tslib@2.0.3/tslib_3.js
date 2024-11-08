/*! *****************************************************************************
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
    const factory = (exporter) => {
        const extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && ((d, b) => { d.__proto__ = b; })) ||
            ((d, b) => { for (let p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; });

        const __extends = (d, b) => {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };

        const __assign = Object.assign || function (t) {
            for (let i = 1, n = arguments.length; i < n; i++) {
                let s = arguments[i];
                for (let p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };

        const __rest = (s, e) => {
            const t = {};
            for (let p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
                t[p] = s[p];
            if (s != null && typeof Object.getOwnPropertySymbols === "function")
                for (let i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                    if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                        t[p[i]] = s[p[i]];
                }
            return t;
        };

        const __decorate = (decorators, target, key, desc) => {
            let r = arguments.length < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
            for (let i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
            return c > 3 && r && Object.defineProperty(target, key, r), r;
        };

        const __param = (paramIndex, decorator) => {
            return function (target, key) { decorator(target, key, paramIndex); }
        };

        const __metadata = (metadataKey, metadataValue) => {
            if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
        };

        const __awaiter = (thisArg, _arguments, P, generator) => {
            const adopt = (value) => value instanceof P ? value : new P((resolve) => { resolve(value); });
            return new (P || (P = Promise))((resolve, reject) => {
                const step = (result) => { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
                const fulfilled = (value) => { try { step(generator.next(value)); } catch (e) { reject(e); } }
                const rejected = (value) => { try { step(generator.throw(value)); } catch (e) { reject(e); } }
                step((generator = generator.apply(thisArg, _arguments || [])).next());
            });
        };

        const __generator = (thisArg, body) => {
            let _, f, y, t, g;
            _ = { label: 0, sent: () => t[0] & 1 ? t[1] : t[1], trys: [], ops: [] };
            g = { next: verb(0), "throw": verb(1), "return": verb(2) };
            if (typeof Symbol === "function") g[Symbol.iterator] = () => this;
            return g;
            function verb(n) { return (v) => step([n, v]); }
            function step(op) {
                while (_) try {
                    if (f) throw new TypeError("Generator is already executing.");
                    if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || (t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
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
            for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
        };

        const __createBinding = Object.create ? ((o, m, k, k2) => {
            if (k2 === undefined) k2 = k;
            Object.defineProperty(o, k2, { enumerable: true, get: () => m[k] });
        }) : ((o, m, k, k2) => {
            if (k2 === undefined) k2 = k;
            o[k2] = m[k];
        });

        const __values = (o) => {
            const s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
            if (m) return m.call(o);
            if (o && typeof o.length === "number") return {
                next: () => {
                    if (o && i >= o.length) o = undefined;
                    return { value: o && o[i++], done: !o };
                }
            };
            throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
        };

        const __read = (o, n) => {
            const m = typeof Symbol === "function" && o[Symbol.iterator];
            if (!m) return o;
            const i = m.call(o), ar = [], r, e;
            try {
                while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
            }
            catch (error) { e = { error }; }
            finally {
                try {
                    if (r && !r.done && (m = i["return"])) m.call(i);
                }
                finally { if (e) throw e.error; }
            }
            return ar;
        };

        const __spread = (...args) => {
            let ar = [];
            for (let i = 0; i < args.length; i++)
                ar = ar.concat(__read(args[i]));
            return ar;
        };

        const __spreadArrays = (...args) => {
            let s = 0, r, k, a, j, jl;
            for (let i = 0; i < args.length; i++) s += args[i].length;
            for (r = Array(s), k = 0, i = 0; i < args.length; i++)
                for (a = args[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];
            return r;
        };

        const __await = (v) => {
            return this instanceof __await ? (this.v = v, this) : new __await(v);
        };

        const __asyncGenerator = (thisArg, _arguments, generator) => {
            if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
            const g = generator.apply(thisArg, _arguments || []), q = [];
            let i = {};
            verb("next"), verb("throw"), verb("return");
            i[Symbol.asyncIterator] = () => this;
            function verb(n) { if (g[n]) i[n] = (v) => new Promise((a, b) => { q.push([n, v, a, b]) > 1 || resume(n, v); }); }
            function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
            function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
            function fulfill(value) { resume("next", value); }
            function reject(value) { resume("throw", value); }
            function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
        };

        const __asyncDelegator = (o) => {
            const i = {};
            verb("next"), verb("throw", (e) => { throw e; }), verb("return");
            i[Symbol.iterator] = () => this;
            function verb(n, f) { i[n] = o[n] ? (v) => { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
        };

        const __asyncValues = (o) => {
            if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
            const m = o[Symbol.asyncIterator], i = {};
            return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = () => this, i);
            function verb(n) { i[n] = o[n] && (v) => new Promise((resolve, reject) => { return v = o[n](v), settle(resolve, reject, v.done, v.value); }); }
            function settle(resolve, reject, d, v) { Promise.resolve(v).then(v => resolve({ value: v, done: d }), reject); }
        };

        const __makeTemplateObject = (cooked, raw) => {
            if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
            return cooked;
        };

        const __setModuleDefault = Object.create ? (o, v) => {
            Object.defineProperty(o, "default", { enumerable: true, value: v });
        } : (o, v) => {
            o["default"] = v;
        };

        const __importStar = (mod) => {
            if (mod && mod.__esModule) return mod;
            const result = {};
            if (mod != null) for (let k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
            __setModuleDefault(result, mod);
            return result;
        };

        const __importDefault = (mod) => {
            return mod && mod.__esModule ? mod : { "default": mod };
        };

        const __classPrivateFieldGet = (receiver, privateMap) => {
            if (!privateMap.has(receiver)) {
                throw new TypeError("attempted to get private field on non-instance");
            }
            return privateMap.get(receiver);
        };

        const __classPrivateFieldSet = (receiver, privateMap, value) => {
            if (!privateMap.has(receiver)) {
                throw new TypeError("attempted to set private field on non-instance");
            }
            privateMap.set(receiver, value);
            return value;
        };

        exporter("__extends", __extends);
        exporter("__assign", __assign);
        exporter("__rest", __rest);
        exporter("__decorate", __decorate);
        exporter("__param", __param);
        exporter("__metadata", __metadata);
        exporter("__awaiter", __awaiter);
        exporter("__generator", __generator);
        exporter("__exportStar", __exportStar);
        exporter("__createBinding", __createBinding);
        exporter("__values", __values);
        exporter("__read", __read);
        exporter("__spread", __spread);
        exporter("__spreadArrays", __spreadArrays);
        exporter("__await", __await);
        exporter("__asyncGenerator", __asyncGenerator);
        exporter("__asyncDelegator", __asyncDelegator);
        exporter("__asyncValues", __asyncValues);
        exporter("__makeTemplateObject", __makeTemplateObject);
        exporter("__importStar", __importStar);
        exporter("__importDefault", __importDefault);
        exporter("__classPrivateFieldGet", __classPrivateFieldGet);
        exporter("__classPrivateFieldSet", __classPrivateFieldSet);
    };

    const createExporter = (exports, previous) => {
        if (exports !== root) {
            if (typeof Object.create === "function") {
                Object.defineProperty(exports, "__esModule", { value: true });
            } else {
                exports.__esModule = true;
            }
        }
        return (id, v) => exports[id] = previous ? previous(id, v) : v;
    };

    const root = typeof global === "object" ? global : typeof self === "object" ? self : typeof this === "object" ? this : {};
    if (typeof define === "function" && define.amd) {
        define("tslib", ["exports"], (exports) => factory(createExporter(root, createExporter(exports))));
    } else if (typeof module === "object" && module.exports) {
        factory(createExporter(root, createExporter(module.exports)));
    } else {
        factory(createExporter(root));
    }
})();
