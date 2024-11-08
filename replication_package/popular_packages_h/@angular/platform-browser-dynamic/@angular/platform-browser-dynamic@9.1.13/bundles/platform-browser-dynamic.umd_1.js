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

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    var builtinExternalReferences = createBuiltinExternalReferencesMap();

    var JitReflector = /** @class */ (function () {
        function JitReflector() {
            this.reflectionCapabilities = new core.ɵReflectionCapabilities();
        }

        JitReflector.prototype.componentModuleUrl = function (type, cmpMetadata) {
            var moduleId = cmpMetadata.moduleId;
            if (typeof moduleId === 'string') {
                var scheme = compiler.getUrlScheme(moduleId);
                return scheme ? moduleId : "package:" + moduleId + MODULE_SUFFIX;
            } else if (moduleId !== null && moduleId !== void 0) {
                throw compiler.syntaxError("moduleId should be a string in \"" + core.ɵstringify(type) + "\".");
            }
            return "./" + core.ɵstringify(type);
        };

        JitReflector.prototype.parameters = function (typeOrFunc) {
            return this.reflectionCapabilities.parameters(typeOrFunc);
        };

        JitReflector.prototype.tryAnnotations = function (typeOrFunc) {
            return this.annotations(typeOrFunc);
        };

        JitReflector.prototype.annotations = function (typeOrFunc) {
            return this.reflectionCapabilities.annotations(typeOrFunc);
        };

        JitReflector.prototype.propMetadata = function (typeOrFunc) {
            return this.reflectionCapabilities.propMetadata(typeOrFunc);
        };

        JitReflector.prototype.hasLifecycleHook = function (type, lcProperty) {
            return this.reflectionCapabilities.hasLifecycleHook(type, lcProperty);
        };

        JitReflector.prototype.guards = function (type) {
            return this.reflectionCapabilities.guards(type);
        };

        JitReflector.prototype.resolveExternalReference = function (ref) {
            return builtinExternalReferences.get(ref) || ref.runtime;
        };

        return JitReflector;
    }());

    function createBuiltinExternalReferencesMap() {
        var map = new Map();
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

    var ERROR_COLLECTOR_TOKEN = new core.InjectionToken('ErrorCollector');
    var DEFAULT_PACKAGE_URL_PROVIDER = {
        provide: core.PACKAGE_ROOT_URL,
        useValue: '/'
    };

    var _NO_RESOURCE_LOADER = {
        get: function (url) {
            throw new Error("No ResourceLoader implementation has been provided. Can't read the url \"" + url + "\"");
        }
    };

    var CompilerImpl = /** @class */ (function () {
        function CompilerImpl(injector, _metadataResolver, templateParser, styleCompiler, viewCompiler, ngModuleCompiler, summaryResolver, compileReflector, jitEvaluator, compilerConfig, console) {
            this._metadataResolver = _metadataResolver;
            this._delegate = new compiler.JitCompiler(_metadataResolver, templateParser, styleCompiler, viewCompiler, ngModuleCompiler, summaryResolver, compileReflector, jitEvaluator, compilerConfig, console, this.getExtraNgModuleProviders.bind(this));
            this.injector = injector;
        }

        CompilerImpl.prototype.getExtraNgModuleProviders = function () {
            return [this._metadataResolver.getProviderMetadata(new compiler.ProviderMeta(core.Compiler, { useValue: this }))];
        };

        CompilerImpl.prototype.compileModuleSync = function (moduleType) {
            return this._delegate.compileModuleSync(moduleType);
        };

        CompilerImpl.prototype.compileModuleAsync = function (moduleType) {
            return this._delegate.compileModuleAsync(moduleType);
        };

        CompilerImpl.prototype.compileModuleAndAllComponentsSync = function (moduleType) {
            var result = this._delegate.compileModuleAndAllComponentsSync(moduleType);
            return {
                ngModuleFactory: result.ngModuleFactory,
                componentFactories: result.componentFactories,
            };
        };

        CompilerImpl.prototype.compileModuleAndAllComponentsAsync = function (moduleType) {
            return this._delegate.compileModuleAndAllComponentsAsync(moduleType)
                .then(function (result) { return ({
                ngModuleFactory: result.ngModuleFactory,
                componentFactories: result.componentFactories,
            }); });
        };

        CompilerImpl.prototype.loadAotSummaries = function (summaries) {
            this._delegate.loadAotSummaries(summaries);
        };

        CompilerImpl.prototype.hasAotSummary = function (ref) {
            return this._delegate.hasAotSummary(ref);
        };

        CompilerImpl.prototype.getComponentFactory = function (component) {
            return this._delegate.getComponentFactory(component);
        };

        CompilerImpl.prototype.clearCache = function () {
            this._delegate.clearCache();
        };

        CompilerImpl.prototype.clearCacheFor = function (type) {
            this._delegate.clearCacheFor(type);
        };

        CompilerImpl.prototype.getModuleId = function (moduleType) {
            var meta = this._metadataResolver.getNgModuleMetadata(moduleType);
            return meta && meta.id || undefined;
        };

        return CompilerImpl;
    }());

    var ɵ0 = new JitReflector(), ɵ1 = _NO_RESOURCE_LOADER;

    var COMPILER_PROVIDERS__PRE_R3__ = [
        { provide: compiler.CompileReflector, useValue: ɵ0 },
        { provide: compiler.ResourceLoader, useValue: ɵ1 },
        { provide: compiler.JitSummaryResolver, deps: [] },
        { provide: compiler.SummaryResolver, useExisting: compiler.JitSummaryResolver },
        { provide: core.ɵConsole, deps: [] },
        { provide: compiler.Lexer, deps: [] },
        { provide: compiler.Parser, deps: [compiler.Lexer] },
        {
            provide: core.Compiler,
            useClass: CompilerImpl,
            deps: [
                core.Injector, compiler.CompileMetadataResolver, compiler.TemplateParser, compiler.StyleCompiler, compiler.ViewCompiler,
                compiler.NgModuleCompiler, compiler.SummaryResolver, compiler.CompileReflector, compiler.JitEvaluator, compiler.CompilerConfig, core.ɵConsole
            ]
        },
        { provide: compiler.DomElementSchemaRegistry, deps: [] },
        { provide: compiler.ElementSchemaRegistry, useExisting: compiler.DomElementSchemaRegistry },
        { provide: compiler.UrlResolver, deps: [core.PACKAGE_ROOT_URL] },
        { provide: compiler.DirectiveResolver, deps: [compiler.CompileReflector] },
        { provide: compiler.PipeResolver, deps: [compiler.CompileReflector] },
        { provide: compiler.NgModuleResolver, deps: [compiler.CompileReflector] },
    ];
    var COMPILER_PROVIDERS = COMPILER_PROVIDERS__PRE_R3__;

    var JitCompilerFactory = /** @class */ (function () {
        function JitCompilerFactory(defaultOptions) {
            var compilerOptions = {
                useJit: true,
                defaultEncapsulation: core.ViewEncapsulation.Emulated,
                missingTranslation: core.MissingTranslationStrategy.Warning,
            };
            this._defaultOptions = [compilerOptions].concat(defaultOptions);
        }

        JitCompilerFactory.prototype.createCompiler = function (options) {
            if (options === void 0) { options = []; }
            var opts = _mergeOptions(this._defaultOptions.concat(options));
            var injector = core.Injector.create([
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
        };

        return JitCompilerFactory;
    }());

    function _mergeOptions(optionsArr) {
        return {
            useJit: _lastDefined(optionsArr.map(function (options) { return options.useJit; })),
            defaultEncapsulation: _lastDefined(optionsArr.map(function (options) { return options.defaultEncapsulation; })),
            providers: _mergeArrays(optionsArr.map(function (options) { return options.providers; })),
            missingTranslation: _lastDefined(optionsArr.map(function (options) { return options.missingTranslation; })),
            preserveWhitespaces: _lastDefined(optionsArr.map(function (options) { return options.preserveWhitespaces; })),
        };
    }

    function _lastDefined(args) {
        for (var i = args.length - 1; i >= 0; i--) {
            if (args[i] !== undefined) {
                return args[i];
            }
        }
        return undefined;
    }

    function _mergeArrays(parts) {
        var result = [];
        parts.forEach(function (part) { return part && result.push.apply(result, part); });
        return result;
    }

    var platformCoreDynamic = core.createPlatformFactory(core.platformCore, 'coreDynamic', [
        { provide: core.COMPILER_OPTIONS, useValue: {}, multi: true },
        { provide: core.CompilerFactory, useClass: JitCompilerFactory, deps: [core.COMPILER_OPTIONS] },
    ]);

    var ResourceLoaderImpl = /** @class */ (function (_super) {
        __extends(ResourceLoaderImpl, _super);
        function ResourceLoaderImpl() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        ResourceLoaderImpl.prototype.get = function (url) {
            var resolve, reject;
            var promise = new Promise(function (res, rej) {
                resolve = res;
                reject = rej;
            });
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'text';
            xhr.onload = function () {
                var response = xhr.response || xhr.responseText;
                var status = xhr.status === 1223 ? 204 : xhr.status;
                if (status === 0) {
                    status = response ? 200 : 0;
                }
                if (200 <= status && status <= 300) {
                    resolve(response);
                } else {
                    reject("Failed to load " + url);
                }
            };
            xhr.onerror = function () {
                reject("Failed to load " + url);
            };
            xhr.send();
            return promise;
        };
        ResourceLoaderImpl = __decorate([
            core.Injectable()
        ], ResourceLoaderImpl);
        return ResourceLoaderImpl;
    }(compiler.ResourceLoader));

    var INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS = [
        platformBrowser.ɵINTERNAL_BROWSER_PLATFORM_PROVIDERS,
        {
            provide: core.COMPILER_OPTIONS,
            useValue: { providers: [{ provide: compiler.ResourceLoader, useClass: ResourceLoaderImpl, deps: [] }] },
            multi: true
        },
        { provide: core.PLATFORM_ID, useValue: common.ɵPLATFORM_BROWSER_ID },
    ];

    var CachedResourceLoader = /** @class */ (function (_super) {
        __extends(CachedResourceLoader, _super);
        function CachedResourceLoader() {
            var _this = _super.call(this) || this;
            _this._cache = core.ɵglobal.$templateCache;
            if (_this._cache == null) {
                throw new Error('CachedResourceLoader: Template cache was not found in $templateCache.');
            }
            return _this;
        }
        CachedResourceLoader.prototype.get = function (url) {
            if (this._cache.hasOwnProperty(url)) {
                return Promise.resolve(this._cache[url]);
            } else {
                return Promise.reject('CachedResourceLoader: Did not find cached template for ' + url);
            }
        };
        return CachedResourceLoader;
    }(compiler.ResourceLoader));

    var VERSION = new core.Version('9.1.13');

    var RESOURCE_CACHE_PROVIDER = [{ provide: compiler.ResourceLoader, useClass: CachedResourceLoader, deps: [] }];

    var platformBrowserDynamic = core.createPlatformFactory(platformCoreDynamic, 'browserDynamic', INTERNAL_BROWSER_DYNAMIC_PLATFORM_PROVIDERS);


    exports.JitCompilerFactory = JitCompilerFactory;
    exports.RESOURCE_CACHE_PROVIDER = RESOURCE_CACHE_PROVIDER;
    exports.VERSION = VERSION;
    exports.platformBrowserDynamic = platformBrowserDynamic;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=platform-browser-dynamic.umd.js.map
