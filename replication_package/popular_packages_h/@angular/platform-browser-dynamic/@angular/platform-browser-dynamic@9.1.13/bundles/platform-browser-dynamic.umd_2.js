(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports, require('@angular/compiler'), require('@angular/core'), require('@angular/common'), require('@angular/platform-browser'));
    } else if (typeof define === 'function' && define.amd) {
        define('@angular/platform-browser-dynamic', ['exports', '@angular/compiler', '@angular/core', '@angular/common', '@angular/platform-browser'], factory);
    } else {
        global = global || self;
        factory((global.ng = global.ng || {}, global.ng.platformBrowserDynamic = {}), global.ng.compiler, global.ng.core, global.ng.common, global.ng.platformBrowser);
    }
}(this, function (exports, compiler, core, common, platformBrowser) {
    'use strict';

    const extendStatics = (d, b) => {
        Object.setPrototypeOf ? Object.setPrototypeOf(d, b) :
        ({ __proto__: [] } instanceof Array ? d.__proto__ = b : 
        Object.keys(b).forEach(key => {
            if (Object.prototype.hasOwnProperty.call(b, key)) d[key] = b[key];
        }));
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : __.prototype = b.prototype;
    }

    const __assign = Object.assign || function __assign(t) {
        for (let i = 1, s; i < arguments.length; i++) {
            s = arguments[i];
            for (let p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };

    function __rest(s, e) {
        const t = {};
        for (const p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function") {
            for (const p of Object.getOwnPropertySymbols(s)) {
                if (e.indexOf(p) < 0 && Object.prototype.propertyIsEnumerable.call(s, p)) t[p] = s[p];
            }
        }
        return t;
    }

    function __decorate(decorators, target, key, desc) {
        let c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
        else for (let i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }

    function __awaiter(thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    function __generator(thisArg, body) {
        let f, y, t, g;
        const _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] };

        return g = {
            next: verb(0),
            "throw": verb(1),
            "return": verb(2)
        },
        typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }),
        g;

        function verb(n) { return function (v) { return step([n, v]); }; }
        function step(op) {
            if (f) throw new TypeError("Generator is already executing.");
            while (_) {
                try {
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
        }
    }

    function __values(o) {
        const s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
        if (m) return m.call(o);
        if (o && typeof o.length === "number") return {
            next: function () {
                if (o && i >= o.length) o = void 0;
                return { value: o && o[i++], done: !o };
            }
        };
        throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
    }

    function __read(o, n) {
        const m = typeof Symbol === "function" && o[Symbol.iterator];
        if (!m) return o;
        const i = m.call(o), r = [], e = undefined;
        try {
            while ((n === void 0 || n-- > 0) && !(r = i.next()).done) r.push(r.value);
        }
        catch (error) { e = { error: error }; }
        finally {
            try {
                if (r && !r.done && (m = i["return"])) m.call(i);
            } finally { if (e) throw e.error; }
        }
        return r;
    }

    function __spread(...args) {
        return [].concat(...args);
    }

    function __spreadArrays(...args) {
        return [].concat(...args);
    }

    function __await(v) {
        return this instanceof __await ? (this.v = v, this) : new __await(v);
    }

    function __asyncGenerator(thisArg, _arguments, generator) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        const g = generator.apply(thisArg, _arguments || []), q = [];
        let i, p;
        return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;

        function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
        function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
        function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
        function fulfill(value) { resume("next", value); }
        function reject(value) { resume("throw", value); }
        function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
    }

    function __asyncDelegator(o) {
        let i, p;
        return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;

        function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
    }

    function __asyncValues(o) {
        if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
        const m = o[Symbol.asyncIterator], i = {};
        return m ? m.call(o) : (o = __values(o), verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);

        function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
        function settle(resolve, reject, d, v) { Promise.resolve(v).then(result => resolve({ value: result, done: d }), reject); }
    }

    function __makeTemplateObject(cooked, raw) {
        if (Object.defineProperty) { Object.defineProperty(cooked, "raw", { value: raw }); } else { cooked.raw = raw; }
        return cooked;
    }

    function __importStar(mod) {
        if (mod && mod.__esModule) return mod;
        const result = {};
        if (mod != null) for (const k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
        result.default = mod;
        return result;
    }

    function __importDefault(mod) {
        return (mod && mod.__esModule) ? mod : { default: mod };
    }

    function __classPrivateFieldGet(receiver, privateMap) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("Attempted to get private field on non-instance");
        }
        return privateMap.get(receiver);
    }

    function __classPrivateFieldSet(receiver, privateMap, value) {
        if (!privateMap.has(receiver)) {
            throw new TypeError("Attempted to set private field on non-instance");
        }
        privateMap.set(receiver, value);
        return value;
    }

    // Constants and additional utility functions
    const MODULE_SUFFIX = '';
    const builtinExternalReferences = createBuiltinExternalReferencesMap();

    class JitReflector {
        constructor() {
            this.reflectionCapabilities = new core.ɵReflectionCapabilities();
        }
        componentModuleUrl(type, cmpMetadata) {
            const moduleId = cmpMetadata.moduleId;
            if (typeof moduleId === 'string') {
                const scheme = compiler.getUrlScheme(moduleId);
                return scheme ? moduleId : "package:" + moduleId + MODULE_SUFFIX;
            } else if (moduleId != null) {
                throw compiler.syntaxError(`moduleId should be a string in "${core.ɵstringify(type)}". See https://goo.gl/wIDDiL for more information.\nIf you're using Webpack you should inline the template and the styles, see https://goo.gl/X2J8zc.`);
            }
            return "./" + core.ɵstringify(type);
        }
        parameters(typeOrFunc) {
            return this.reflectionCapabilities.parameters(typeOrFunc);
        }
        tryAnnotations(typeOrFunc) {
            return this.annotations(typeOrFunc);
        }
        annotations(typeOrFunc) {
            return this.reflectionCapabilities.annotations(typeOrFunc);
        }
        shallowAnnotations(typeOrFunc) {
            throw new Error('Not supported in JIT mode');
        }
        propMetadata(typeOrFunc) {
            return this.reflectionCapabilities.propMetadata(typeOrFunc);
        }
        hasLifecycleHook(type, lcProperty) {
            return this.reflectionCapabilities.hasLifecycleHook(type, lcProperty);
        }
        guards(type) {
            return this.reflectionCapabilities.guards(type);
        }
        resolveExternalReference(ref) {
            return builtinExternalReferences.get(ref) || ref.runtime;
        }
    }

    function createBuiltinExternalReferencesMap() {
        const map = new Map();
        map.set(compiler.Identifiers.ANALYZE_FOR_ENTRY_COMPONENTS, core.ANALYZE_FOR_ENTRY_COMPONENTS);
        map.set(compiler.Identifiers.ElementRef, core.ElementRef);
        map.set(compiler.Identifiers.NgModuleRef, core.NgModuleRef);
        map.set(compiler.Identifiers.ViewContainerRef, core.ViewContainerRef);
        map.set(compiler.Identifiers.ChangeDetectorRef, core.ChangeDetectorRef);
        map.set(compiler.Identifiers.Renderer2, core.Renderer2);
        map.set(compiler.Identifiers.QueryList, core.QueryList);
        map.set(compiler.Identifiers.TemplateRef, core.TemplateRef);
        map.set(compiler.Identifiers.CodegenComponentFactoryResolver, core.ɵCodegenComponentFactoryResolver);
        map.set(compiler.Identifiers.ComponentFactoryResolver, core.ComponentFactoryResolver);
        map.set(compiler.Identifiers.ComponentFactory, core.ComponentFactory);
        map.set(compiler.Identifiers.ComponentRef, core.ComponentRef);
        map.set(compiler.Identifiers.NgModuleFactory, core.NgModuleFactory);
        map.set(compiler.Identifiers.createModuleFactory, core.ɵcmf);
        map.set(compiler.Identifiers.moduleDef, core.ɵmod);
        map.set(compiler.Identifiers.moduleProviderDef, core.ɵmpd);
        map.set(compiler.Identifiers.RegisterModuleFactoryFn, core.ɵregisterModuleFactory);
        map.set(compiler.Identifiers.Injector, core.Injector);
        map.set(compiler.Identifiers.ViewEncapsulation, core.ViewEncapsulation);
        map.set(compiler.Identifiers.ChangeDetectionStrategy, core.ChangeDetectionStrategy);
        map.set(compiler.Identifiers.SecurityContext, core.SecurityContext);
        map.set(compiler.Identifiers.LOCALE_ID, core.LOCALE_ID);
        map.set(compiler.Identifiers.TRANSLATIONS_FORMAT, core.TRANSLATIONS_FORMAT);
        map.set(compiler.Identifiers.inlineInterpolate, core.ɵinlineInterpolate);
        map.set(compiler.Identifiers.interpolate, core.ɵinterpolate);
        map.set(compiler.Identifiers.EMPTY_ARRAY, core.ɵEMPTY_ARRAY);
        map.set(compiler.Identifiers.EMPTY_MAP, core.ɵEMPTY_MAP);
        map.set(compiler.Identifiers.viewDef, core.ɵvid);
        map.set(compiler.Identifiers.elementDef, core.ɵeld);
        map.set(compiler.Identifiers.anchorDef, core.ɵand);
        map.set(compiler.Identifiers.textDef, core.ɵted);
        map.set(compiler.Identifiers.directiveDef, core.ɵdid);
        map.set(compiler.Identifiers.providerDef, core.ɵprd);
        map.set(compiler.Identifiers.queryDef, core.ɵqud);
        map.set(compiler.Identifiers.pureArrayDef, core.ɵpad);
        map.set(compiler.Identifiers.pureObjectDef, core.ɵpod);
        map.set(compiler.Identifiers.purePipeDef, core.ɵppd);
        map.set(compiler.Identifiers.pipeDef, core.ɵpid);
        map.set(compiler.Identifiers.nodeValue, core.ɵnov);
        map.set(compiler.Identifiers.ngContentDef, core.ɵncd);
        map.set(compiler.Identifiers.unwrapValue, core.ɵunv);
        map.set(compiler.Identifiers.createRendererType2, core.ɵcrt);
        map.set(compiler.Identifiers.createComponentFactory, core.ɵccf);
        return map;
    }

    const ERROR_COLLECTOR_TOKEN = new core.InjectionToken('ErrorCollector');
    const DEFAULT_PACKAGE_URL_PROVIDER = { provide: core.PACKAGE_ROOT_URL, useValue: '/' };
    const _NO_RESOURCE_LOADER = {
        get: function (url) {
            throw new Error(`No ResourceLoader implementation has been provided. Can't read the url "${url}"`);
        }
    };
    const baseHtmlParser = new core.InjectionToken('HtmlParser');

    class CompilerImpl {
        constructor(injector, _metadataResolver, templateParser, styleCompiler, viewCompiler, ngModuleCompiler, summaryResolver, compileReflector, jitEvaluator, compilerConfig, console) {
            this._metadataResolver = _metadataResolver;
            this._delegate = new compiler.JitCompiler(_metadataResolver, templateParser, styleCompiler, viewCompiler, ngModuleCompiler, summaryResolver, compileReflector, jitEvaluator, compilerConfig, console, this.getExtraNgModuleProviders.bind(this));
            this.injector = injector;
        }
        getExtraNgModuleProviders() {
            return [this._metadataResolver.getProviderMetadata(new compiler.ProviderMeta(core.Compiler, { useValue: this }))];
        }
        compileModuleSync(moduleType) {
            return this._delegate.compileModuleSync(moduleType);
        }
        compileModuleAsync(moduleType) {
            return this._delegate.compileModuleAsync(moduleType);
        }
        compileModuleAndAllComponentsSync(moduleType) {
            const result = this._delegate.compileModuleAndAllComponentsSync(moduleType);
            return {
                ngModuleFactory: result.ngModuleFactory,
                componentFactories: result.componentFactories,
            };
        }
        compileModuleAndAllComponentsAsync(moduleType) {
            return this._delegate.compileModuleAndAllComponentsAsync(moduleType).then(result => ({
                ngModuleFactory: result.ngModuleFactory,
                componentFactories: result.componentFactories,
            }));
        }
        loadAotSummaries(summaries) {
            this._delegate.loadAotSummaries(summaries);
        }
        hasAotSummary(ref) {
            return this._delegate.hasAotSummary(ref);
        }
        getComponentFactory(component) {
            return this._delegate.getComponentFactory(component);
        }
        clearCache() {
            this._delegate.clearCache();
        }
        clearCacheFor(type) {
            this._delegate.clearCacheFor(type);
        }
        getModuleId(moduleType) {
            const meta = this._metadataResolver.getNgModuleMetadata(moduleType);
            return meta && meta.id || undefined;
        }
    }
    
    const COMPILER_PROVIDERS__PRE_R3__ = [
        { provide: compiler.CompileReflector, useValue: new JitReflector() },
        { provide: compiler.ResourceLoader, useValue: _NO_RESOURCE_LOADER },
        { provide: compiler.JitSummaryResolver, deps: [] },
        { provide: compiler.SummaryResolver, useExisting: compiler.JitSummaryResolver },
        { provide: core.ɵConsole, deps: [] },
        { provide: compiler.Lexer, deps: [] },
        { provide: compiler.Parser, deps: [compiler.Lexer] },
        {
            provide: baseHtmlParser,
            useClass: compiler.HtmlParser,
            deps: [],
        },
        {
            provide: compiler.I18NHtmlParser,
            useFactory: function (parser, translations, format, config, console) {
                translations = translations || '';
                const missingTranslation = translations ? config.missingTranslation : core.MissingTranslationStrategy.Ignore;
                return new compiler.I18NHtmlParser(parser, translations, format, missingTranslation, console);
            },
            deps: [
                baseHtmlParser,
                [new core.Optional(), new core.Inject(core.TRANSLATIONS)],
                [new core.Optional(), new core.Inject(core.TRANSLATIONS_FORMAT)],
                [compiler.CompilerConfig],
                [core.ɵConsole]
            ]
        },
        { provide: compiler.HtmlParser, useExisting: compiler.I18NHtmlParser },
        { provide: compiler.TemplateParser, deps: [compiler.CompilerConfig, compiler.CompileReflector, compiler.Parser, compiler.ElementSchemaRegistry, compiler.I18NHtmlParser, core.ɵConsole] },
        { provide: compiler.JitEvaluator, useClass: compiler.JitEvaluator, deps: [] },
        { provide: compiler.DirectiveNormalizer, deps: [compiler.ResourceLoader, compiler.UrlResolver, compiler.HtmlParser, compiler.CompilerConfig] },
        { provide: compiler.CompileMetadataResolver, deps: [compiler.CompilerConfig, compiler.HtmlParser, compiler.NgModuleResolver, compiler.DirectiveResolver, compiler.PipeResolver, compiler.SummaryResolver, compiler.ElementSchemaRegistry, compiler.DirectiveNormalizer, core.ɵConsole, [core.Optional, compiler.StaticSymbolCache], compiler.CompileReflector, [core.Optional, ERROR_COLLECTOR_TOKEN]] },
        DEFAULT_PACKAGE_URL_PROVIDER,
        { provide: compiler.StyleCompiler, deps: [compiler.UrlResolver] },
        { provide: compiler.ViewCompiler, deps: [compiler.CompileReflector] },
        { provide: compiler.NgModuleCompiler, deps: [compiler.CompileReflector] },
        { provide: compiler.CompilerConfig, useValue: new compiler.CompilerConfig() },
        {
            provide: core.Compiler,
            useClass: CompilerImpl,
            deps: [core.Injector, compiler.CompileMetadataResolver, compiler.TemplateParser, compiler.StyleCompiler, compiler.ViewCompiler, compiler.NgModuleCompiler, compiler.SummaryResolver, compiler.CompileReflector, compiler.JitEvaluator, compiler.CompilerConfig, core.ɵConsole]
        },
        { provide: compiler.DomElementSchemaRegistry, deps: [] },
        { provide: compiler.ElementSchemaRegistry, useExisting: compiler.DomElementSchemaRegistry },
        { provide: compiler.UrlResolver, deps: [core.PACKAGE_ROOT_URL] },
        { provide: compiler.DirectiveResolver, deps: [compiler.CompileReflector] },
        { provide: compiler.PipeResolver, deps: [compiler.CompileReflector] },
        { provide: compiler.NgModuleResolver, deps: [compiler.CompileReflector] },
    ];

    const COMPILER_PROVIDERS__POST_R3__ = [{ provide: core.Compiler, useFactory: () => new core.Compiler() }];
    const COMPILER_PROVIDERS = COMPILER_PROVIDERS__PRE_R3__;

    class JitCompilerFactory {
        constructor(defaultOptions) {
            const compilerOptions = {
                useJit: true,
                defaultEncapsulation: core.ViewEncapsulation.Emulated,
                missingTranslation: core.MissingTranslationStrategy.Warning,
            };
            this._defaultOptions = [compilerOptions, ...defaultOptions];
        }
        createCompiler(options = []) {
            const opts = _mergeOptions(this._defaultOptions.concat(options));
            const injector = core.Injector.create([
                COMPILER_PROVIDERS, {
                    provide: compiler.CompilerConfig,
                    useFactory: function () {
                        return new compiler.CompilerConfig({
                            useJit: opts.useJit,
                            jitDevMode: core.isDevMode(),
                            defaultEncapsulation: opts.defaultEncapsulation,
                            missingTranslation: opts.missingTranslation,
                            preserveWhitespaces: opts.preserveWhitespaces,
                        });
                    },
                    deps: []
                },
                opts.providers
            ]);
            return injector.get(core.Compiler);
        }
    }

    function _mergeOptions(optionsArr) {
        return {
            useJit: _lastDefined(optionsArr.map(options => options.useJit)),
            defaultEncapsulation: _lastDefined(optionsArr.map(options => options.defaultEncapsulation)),
            providers: _mergeArrays(optionsArr.map(options => options.providers)),
            missingTranslation: _lastDefined(optionsArr.map(options => options.missingTranslation)),
            preserveWhitespaces: _lastDefined(optionsArr.map(options => options.preserveWhitespaces)),
        };
    }

    function _lastDefined(args) {
        for (let i = args.length - 1; i >= 0; i--) {
            if (args[i] !== undefined) {
                return args[i];
            }
        }
        return undefined;
    }

    function _mergeArrays(parts) {
        const result = [];
        parts.forEach(part => part && result.push(...part));
        return result;
    }

    const platformCoreDynamic = core.createPlatformFactory(core.platformCore, 'coreDynamic', [
        { provide: core.COMPILER_OPTIONS, useValue: {}, multi: true },
        { provide: core.CompilerFactory, useClass: JitCompilerFactory, deps: [core.COMPILER_OPTIONS] },
    ]);

    class ResourceLoaderImpl extends compiler.ResourceLoader {
        get(url) {
            return new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('GET', url, true);
                xhr.responseType = 'text';
                xhr.onload = function () {
                    const response = xhr.response || xhr.responseText;
                    let status = xhr.status === 1223 ? 204 : xhr.status;
                    if (status === 0) {
                        status = response ? 200 : 0;
                    }
                    if (200 <= status && status <= 300) {
                        resolve(response);
                    } else {
                        reject(`Failed to load ${url}`);
                    }
                };
                xhr.onerror = function () {
                    reject(`Failed to load ${url}`);
                };
                xhr.send();
            });
        }
    }

    const INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS = [
        platformBrowser.ɵINTERNAL_BROWSER_PLATFORM_PROVIDERS,
        { provide: core.COMPILER_OPTIONS, useValue: { providers: [{ provide: compiler.ResourceLoader, useClass: ResourceLoaderImpl, deps: []}] }, multi: true },
        { provide: core.PLATFORM_ID, useValue: common.ɵPLATFORM_BROWSER_ID },
    ];

    class CachedResourceLoader extends compiler.ResourceLoader {
        constructor() {
            super();
            this._cache = core.ɵglobal.$templateCache;
            if (!this._cache) {
                throw new Error('CachedResourceLoader: Template cache was not found in $templateCache.');
            }
        }
        get(url) {
            if (this._cache.hasOwnProperty(url)) {
                return Promise.resolve(this._cache[url]);
            } else {
                return Promise.reject(`CachedResourceLoader: Did not find cached template for ${url}`);
            }
        }
    }

    const VERSION = new core.Version('9.1.13');

    const RESOURCE_CACHE_PROVIDER = [{ provide: compiler.ResourceLoader, useClass: CachedResourceLoader, deps: [] }];

    const platformBrowserDynamic = core.createPlatformFactory(platformCoreDynamic, 'browserDynamic', INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS);

    exports.JitCompilerFactory = JitCompilerFactory;
    exports.RESOURCE_CACHE_PROVIDER = RESOURCE_CACHE_PROVIDER;
    exports.VERSION = VERSION;
    exports.platformBrowserDynamic = platformBrowserDynamic;
    exports.ɵCOMPILER_PROVIDERS__POST_R3__ = COMPILER_PROVIDERS__POST_R3__;
    exports.ɵCompilerImpl = CompilerImpl;
    exports.ɵINTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS = INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS;
    exports.ɵResourceLoaderImpl = ResourceLoaderImpl;
    exports.ɵangular_packages_platform_browser_dynamic_platform_browser_dynamic_a = CachedResourceLoader;
    exports.ɵplatformCoreDynamic = platformCoreDynamic;

    Object.defineProperty(exports, '__esModule', { value: true });
}));
//# sourceMappingURL=platform-browser-dynamic.umd.js.map
