/**
 * @license Angular v9.1.13
 * (c) 2010-2020 Google LLC. https://angular.io/
 * License: MIT
 */

(function (global, factory) {
    // Check if module.exports is an object and define factory for Node environment
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports, require('@angular/common'), require('@angular/core'));
    }
    // Check if AMD is supported and define factory for it
    else if (typeof define === 'function' && define.amd) {
        define('@angular/platform-browser', ['exports', '@angular/common', '@angular/core'], factory);
    }
    // Fallback for other environments (e.g., browser global)
    else {
        if (global = global || self) {
            factory((global.ng = global.ng || {}, global.ng.platformBrowser = {}), global.ng.common, global.ng.core);
        }
    }
}(this, (function (exports, common, i0) { 'use strict';

    // A series of functionalities are implemented, consisting of:
    // - Extending classes (__extends).
    // - Assigning properties (__assign).
    // - Decorating functions (__decorate).
    // - Handling async operations (__awaiter, __generator).
    // - Binding utilities and handling exported content (__exportStar, __values, etc.).

    const extendStatics = (d, b) => {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && ((d, b) => { d.__proto__ = b; })) ||
            ((d, b) => { for (let p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; });
        return extendStatics(d, b);
    }

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    // ... additional utility methods

    // Angular platform-browser modules, utilities, and core classes
    class GenericBrowserDomAdapter extends common.ɵDomAdapter {
        constructor() { super(); }
        supportsDOMEvents() { return true; }
    }

    class BrowserDomAdapter extends GenericBrowserDomAdapter {
        static makeCurrent() {
            common.ɵsetRootDomAdapter(new BrowserDomAdapter());
        }

        // Several methods dealing with property retrieval, event dispatching, etc.

        // ... more methods and logic related to DOM manipulation
    }

    // Browser specific services and functionalities

    // Providers and setup for server transition and testability
    const TRANSITION_ID = new i0.InjectionToken('TRANSITION_ID');
    function appInitializerFactory(transitionId, document, injector) {
        return function () {
            injector.get(i0.ApplicationInitStatus).donePromise.then(() => {
                const dom = common.ɵgetDOM();
                const styles = Array.prototype.slice.apply(document.querySelectorAll("style[ng-transition]"));
                styles.filter(el => el.getAttribute('ng-transition') === transitionId).forEach(el => dom.remove(el));
            });
        };
    }
    const SERVER_TRANSITION_PROVIDERS = [
        {
            provide: i0.APP_INITIALIZER,
            useFactory: appInitializerFactory,
            deps: [TRANSITION_ID, common.DOCUMENT, i0.Injector],
            multi: true
        },
    ];

    // ... other module exports and utility methods

    // Export key components and utilities
    exports.BrowserModule = BrowserModule;
    exports.BrowserTransferStateModule = BrowserTransferStateModule;
    exports.By = By;
    exports.DomSanitizer = DomSanitizer;
    exports.EVENT_MANAGER_PLUGINS = EVENT_MANAGER_PLUGINS;
    exports.EventManager = EventManager;
    exports.HAMMER_GESTURE_CONFIG = HAMMER_GESTURE_CONFIG;
    exports.HAMMER_LOADER = HAMMER_LOADER;
    exports.HammerGestureConfig = HammerGestureConfig;
    exports.HammerModule = HammerModule;
    exports.Meta = Meta;
    exports.Title = Title;
    exports.TransferState = TransferState;
    exports.VERSION = VERSION;
    exports.disableDebugTools = disableDebugTools;
    exports.enableDebugTools = enableDebugTools;
    exports.makeStateKey = makeStateKey;
    exports.platformBrowser = platformBrowser;
    exports.ɵBROWSER_SANITIZATION_PROVIDERS = BROWSER_SANITIZATION_PROVIDERS;
    exports.ɵBrowserDomAdapter = BrowserDomAdapter;
    exports.ɵBrowserGetTestability = BrowserGetTestability;
    exports.ɵDomEventsPlugin = DomEventsPlugin;
    exports.ɵDomRendererFactory2 = DomRendererFactory2;
    exports.ɵDomSanitizerImpl = DomSanitizerImpl;
    exports.ɵDomSharedStylesHost = DomSharedStylesHost;
    exports.ɵELEMENT_PROBE_PROVIDERS = ELEMENT_PROBE_PROVIDERS;

    // Define additional exports as needed...

})));
