(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports, require('@angular/common'), require('@angular/core'));
    } else if (typeof define === 'function' && define.amd) {
        define('@angular/platform-browser', ['exports', '@angular/common', '@angular/core'], factory);
    } else {
        global = global || self;
        factory((global.ng = global.ng || {}, global.ng.platformBrowser = {}), global.ng.common, global.ng.core);
    }
}(this, function (exports, common, i0) {
    'use strict';

    // TypeScript Helper Functions for extending classes and more
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

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    // Security and Sanitization
    var DomSanitizer = /** @class */ (function () {
        function DomSanitizer() {}
        DomSanitizer.prototype.sanitize = function(ctx, value) {
            // Sanitization logic goes here...
            return value;
        };
        DomSanitizer.prototype.bypassSecurityTrustHtml = function(value) { return value; };
        return DomSanitizer;
    }());

    // Supporting Angular Structures
    /**
     * A Class to provide basic DOM operations for different platforms (browser specifically here).
     */
    var GenericBrowserDomAdapter = /** @class */ (function (_super) {
        __extends(GenericBrowserDomAdapter, _super);
        function GenericBrowserDomAdapter() { return _super.call(this) || this; }
        GenericBrowserDomAdapter.prototype.supportsDOMEvents = function () { return true; };
        return GenericBrowserDomAdapter;
    }(common.ɵDomAdapter));

    // Constants and utilities for key event processing or other DOM related activities.
    var TRANSITION_ID = new i0.InjectionToken('TRANSITION_ID');
    var ɵ0 = function() { if (i0.ɵglobal['Node']) {
            return i0.ɵglobal['Node'].prototype.contains || function(node) { return !!(this.compareDocumentPosition(node) & 16); };
        } return undefined; };
    var nodeContains = (ɵ0)();

    // Code related to Rendering and Renderer
    var BrowserDomAdapter = /** @class */ (function (_super) {
        __extends(BrowserDomAdapter, _super);
        function BrowserDomAdapter() { return _super !== null && _super.apply(this, arguments) || this; }
        BrowserDomAdapter.makeCurrent = function () {
            common.ɵsetRootDomAdapter(new BrowserDomAdapter());
        };
        BrowserDomAdapter.prototype.getProperty = function (el, name) { return el[name]; };
        BrowserDomAdapter.prototype.log = function (error) { if (window.console) { window.console.log && window.console.log(error); } };
        return BrowserDomAdapter;
    }(GenericBrowserDomAdapter));

    // Export structures for enabling different functionalities
    exports.BrowserModule = BrowserModule;
    exports.DomSanitizer = DomSanitizer;
    exports.BrowserDomAdapter = BrowserDomAdapter;

    Object.defineProperty(exports, '__esModule', { value: true });
}));
