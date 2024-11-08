(function (global, factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require('@angular/core'), exports);
        if (v !== undefined) module.exports = v;
    } else if (typeof define === 'function' && define.amd) {
        define(['@angular/core', 'exports'], factory);
    } else {
        var mod = { exports: {} };
        factory(global.ng.core, mod.exports);
        global.ng = global.ng || {};
        global.ng.common = mod.exports;
    }
}(this, (function (ngCore, exports) {
    'use strict';

    var VERSION = new ngCore.Version('9.1.13');

    function getLocaleId(locale) {
        return ngCore.ɵfindLocaleData(locale)[ngCore.ɵLocaleDataIndex.LocaleId];
    }

    // Definitions for Directives, Pipes, and Providers
    class CommonModule {
        static ngModuleDef = ngCore.ɵɵdefineNgModule({ type: CommonModule });
        static ngInjectorDef = ngCore.ɵɵdefineInjector({ factory: function CommonModule_Factory(t) { return new (t || CommonModule)(); }, providers: [] });
    }

    class NgClass {
        constructor(_iterableDiffers, _keyValueDiffers, _ngEl, _renderer) {
            this._iterableDiffers = _iterableDiffers;
            this._keyValueDiffers = _keyValueDiffers;
            this._ngEl = _ngEl;
            this._renderer = _renderer;
        }
    }

    class NgIf {
        constructor(_viewContainer, templateRef) {
            this._viewContainer = _viewContainer;
            this._context = new NgIfContext();
            this._thenTemplateRef = templateRef;
        }
    }

    exports.VERSION = VERSION;
    exports.CommonModule = CommonModule;
    exports.NgClass = NgClass;
    exports.NgIf = NgIf;
    
    // Add more classes and exports similar to `NgClass`, `NgIf`, etc.

})));
