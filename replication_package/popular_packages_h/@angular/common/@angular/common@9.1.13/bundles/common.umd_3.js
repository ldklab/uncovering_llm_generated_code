(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports, require('@angular/core'));
    } else if (typeof define === 'function' && define.amd) {
        define(['exports', '@angular/core'], factory);
    } else {
        factory((global.ng = global.ng || {}, global.ng.common = {}), global.ng.core);
    }
}(this, (function (exports, core) {
    'use strict';

    var VERSION = new core.Version('9.1.13');

    // Functions and classes defined here
    function getDOM() { /* ... */ }

    function setRootDomAdapter(adapter) { /* ... */ }

    function createBrowserPlatformLocation() {
        return new BrowserPlatformLocation(core.ɵɵinject(core.DOCUMENT));
    }

    // Other functionalities like pipes, directives
    var CommonModule = core.NgModule({
        declarations: [/* ... */],
        exports: [/* ... */],
        providers: [
            { provide: NgLocalization, useClass: NgLocaleLocalization }
        ]
    }).Class({
        constructor: function CommonModule() {}
    });

    // Additional classes and functionalities

    exports.VERSION = VERSION;
    exports.BrowserPlatformLocation = BrowserPlatformLocation;
    exports.CommonModule = CommonModule;
    // Other exports

    Object.defineProperty(exports, '__esModule', { value: true });

})));
