(function(global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        // CommonJS (Node.js) module
        factory(exports, require('@angular/compiler'), require('@angular/core'), require('@angular/common'), require('@angular/platform-browser'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD (Asynchronous Module Definition) module
        define('@angular/platform-browser-dynamic', ['exports', '@angular/compiler', '@angular/core', '@angular/common', '@angular/platform-browser'], factory);
    } else {
        // Global variable (non-module environments)
        var ng = global.ng = global.ng || {};
        factory(ng.platformBrowserDynamic = {}, ng.compiler, ng.core, ng.common, ng.platformBrowser);
    }
}(this, function(exports, compiler, core, common, platformBrowser) {
    'use strict';

    // Extend class helper function
    var extendStatics = Object.setPrototypeOf || function(d, b) {
        d.__proto__ = b;
        return d;
    };
    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b && b.prototype;
    }

    // Assign properties helper function
    var __assign = Object.assign || function(t) {
        for (var i = 1, s; i < arguments.length; i++) {
            s = arguments[i];
            for (var p in s) t[p] = s[p];
        }
        return t;
    };

    /**
     * JIT (Just-In-Time) Reflector class for Angular
     */
    var JitReflector = function() {
        this.reflectionCapabilities = new core.ɵReflectionCapabilities();
    };
    JitReflector.prototype.componentModuleUrl = function(type, cmpMetadata) {
        var moduleId = cmpMetadata.moduleId;
        if (typeof moduleId === 'string') {
            var scheme = compiler.getUrlScheme(moduleId);
            return scheme ? moduleId : "package:" + moduleId;
        } else if (moduleId !== undefined) {
            throw new Error("moduleId should be a string in \"" + core.ɵstringify(type) + "\".");
        }
        return "./" + core.ɵstringify(type);
    };

    /**
     * Angular compiler configuration
     */
    var CompilerImpl = function(injector, _metadataResolver, templateParser, styleCompiler, viewCompiler, ngModuleCompiler, summaryResolver, compileReflector, jitEvaluator, compilerConfig, console) {
        this._metadataResolver = _metadataResolver;
        this._delegate = new compiler.JitCompiler(_metadataResolver, templateParser, styleCompiler, viewCompiler, ngModuleCompiler, summaryResolver, compileReflector, jitEvaluator, compilerConfig, console, this.getExtraNgModuleProviders.bind(this));
        this.injector = injector;
    };

    /**
     * Version of the Angular platform-browser-dynamic package
     */
    var VERSION = new core.Version('9.1.13');

    /**
     * Public API exports
     */
    exports.VERSION = VERSION;
    exports.JitCompilerFactory = JitCompilerFactory;
    exports.platformBrowserDynamic = platformBrowserDynamic;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
