(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports, require('@angular/common'), require('@angular/core'));
    } else if (typeof define === 'function' && define.amd) {
        define('@angular/platform-browser', ['exports', '@angular/common', '@angular/core'], factory);
    } else {
        global = global || self;
        factory((global.ng = global.ng || {}, global.ng.platformBrowser = {}), global.ng.common, global.ng.core);
    }
}(this, (function (exports, common, i0) { 'use strict';

    // Polyfills
    const extendStatics = (d, b) => {
        extendStatics = Object.setPrototypeOf ||
            (({ __proto__: [] } instanceof Array && ((d, b) => { d.__proto__ = b; })) ||
            ((d, b) => { for (const p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; }));
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    const __assign = () => {
        __assign = Object.assign || function __assign(t) {
            for (let i = 1, n = arguments.length; i < n; i++) {
                const s = arguments[i];
                for (const p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        const t = {};
        for (const p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
        return t;
    }

    function __decorate(decorators, target, key, desc) {
        const c = arguments.length;
        const r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc;
        for (let i = decorators.length - 1; i >= 0; i--) if (decorators[i]) r = (c < 3 ? decorators[i](r) : c > 3 ? decorators[i](target, key, r) : decorators[i](target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    }

    function __param(paramIndex, decorator) {
        return function (target, key) { decorator(target, key, paramIndex); }
    }

    function __metadata(metadataKey, metadataValue) {
        if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
    }

    // Async helpers
    function __awaiter(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    }

    // Additional helpers would be defined here...

    // Generic DOM Adapter for Browsers
    class GenericBrowserDomAdapter extends common.ɵDomAdapter {
        constructor() { super(); }
        supportsDOMEvents() { return true; }
    }

    // Browser-specific DOM Adapter
    class BrowserDomAdapter extends GenericBrowserDomAdapter {
        static makeCurrent() {
            common.ɵsetRootDomAdapter(new BrowserDomAdapter());
        }

        getProperty(el, name) { return el[name]; }
        log(error) { if (window.console) window.console.log && window.console.log(error); }
        logGroup(error) { if (window.console) window.console.group && window.console.group(error); }
        logGroupEnd() { if (window.console) window.console.groupEnd && window.console.groupEnd(); }

        onAndCancel(el, evt, listener) {
            el.addEventListener(evt, listener, false);
            return () => el.removeEventListener(evt, listener, false);
        }
    }

    // Other parts of the module such as event manager, sanitizers, and life cycle handlers...

    // Initializations
    function initDomAdapter() {
        BrowserDomAdapter.makeCurrent();
        BrowserGetTestability.init();
    }

    // Export objects, constants, and classes
    exports.BrowserModule = BrowserModule;
    exports.DomSanitizer = DomSanitizer;
    exports.ɵescapeHtml = escapeHtml;
    exports.ɵflattenStyles = flattenStyles;
    
    Object.defineProperty(exports, '__esModule', { value: true });

})));
