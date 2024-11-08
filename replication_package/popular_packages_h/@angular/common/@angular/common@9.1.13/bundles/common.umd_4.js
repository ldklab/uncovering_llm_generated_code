(function (root, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports, require('@angular/core'));
    } else if (typeof define === 'function' && define.amd) {
        define(['exports', '@angular/core'], factory);
    } else {
        root = root || self;
        factory((root.ng = root.ng || {}, root.ng.common = {}), root.ng.core);
    }
}(this, function (exports, core) {
    'use strict';
    
    var _DOM = null;
    function getDOM() {
        return _DOM;
    }
    function setDOM(adapter) {
        _DOM = adapter;
    }
    function setRootDomAdapter(adapter) {
        if (!_DOM) {
            _DOM = adapter;
        }
    }
    class DomAdapter {}

    const DOCUMENT = new core.InjectionToken('DocumentToken');
    const LOCATION_INITIALIZED = new core.InjectionToken('Location Initialized');
    const APP_BASE_HREF = new core.InjectionToken('appBaseHref');

    class PlatformLocation {
        constructor() {}
    }

    class BrowserPlatformLocation extends PlatformLocation {
        constructor(document) {
            super();
            this._doc = document;
            this._init();
        }
        _init() {
            // Initialization logic
        }
        getBaseHrefFromDOM() {
            return getDOM().getBaseHref(this._doc);
        }
        // Other methods
    }

    function createBrowserPlatformLocation() {
        return new BrowserPlatformLocation(core.ɵɵinject(DOCUMENT));
    }

    function useBrowserPlatformLocation() {
        return core.ɵɵinject(BrowserPlatformLocation);
    }

    class NgLocalization {
        constructor() {}
    }

    class NgLocaleLocalization extends NgLocalization {
        constructor(locale) {
            super();
            this.locale = locale;
        }
        getPluralCategory(value, locale) {
            // Pluralization logic
        }
    }

    const VERSION = new core.Version('9.1.13');

    const COMMON_DIRECTIVES = [
        // List of common directives
    ];

    const COMMON_PIPES = [
        // List of common pipes
    ];

    class CommonModule {}

    CommonModule.decorators = [
        { type: core.NgModule, args: [{
            declarations: [COMMON_DIRECTIVES, COMMON_PIPES],
            exports: [COMMON_DIRECTIVES, COMMON_PIPES],
            providers: [
                { provide: NgLocalization, useClass: NgLocaleLocalization },
            ],
        }]}
    ];
    
    exports.APP_BASE_HREF = APP_BASE_HREF;
    exports.AsyncPipe = AsyncPipe;
    exports.CommonModule = CommonModule;
    exports.CurrencyPipe = CurrencyPipe;
    exports.DOCUMENT = DOCUMENT;
    exports.DatePipe = DatePipe;
    exports.DecimalPipe = DecimalPipe;
    exports.HashLocationStrategy = HashLocationStrategy;
    exports.I18nPluralPipe = I18nPluralPipe;
    exports.I18nSelectPipe = I18nSelectPipe;
    exports.JsonPipe = JsonPipe;
    exports.KeyValuePipe = KeyValuePipe;
    exports.LOCATION_INITIALIZED = LOCATION_INITIALIZED;
    exports.Location = Location;
    exports.LocationStrategy = LocationStrategy;
    exports.LowerCasePipe = LowerCasePipe;
    exports.NgClass = NgClass;
    exports.NgComponentOutlet = NgComponentOutlet;
    exports.NgForOf = NgForOf;
    exports.NgIf = NgIf;
    exports.NgLocaleLocalization = NgLocaleLocalization;
    exports.NgLocalization = NgLocalization;
    exports.NgPlural = NgPlural;
    exports.NgPluralCase = NgPluralCase;
    exports.NgStyle = NgStyle;
    exports.NgSwitch = NgSwitch;
    exports.NgSwitchCase = NgSwitchCase;
    exports.NgSwitchDefault = NgSwitchDefault;
    exports.NgTemplateOutlet = NgTemplateOutlet;
    exports.PathLocationStrategy = PathLocationStrategy;
    exports.PercentPipe = PercentPipe;
    exports.PlatformLocation = PlatformLocation;
    exports.SlicePipe = SlicePipe;
    exports.TitleCasePipe = TitleCasePipe;
    exports.UpperCasePipe = UpperCasePipe;
    exports.VERSION = VERSION;
    exports.ViewportScroller = ViewportScroller;
    exports.formatCurrency = formatCurrency;
    exports.formatDate = formatDate;
    exports.formatNumber = formatNumber;
    exports.formatPercent = formatPercent;
    exports.getCurrencySymbol = getCurrencySymbol;
    exports.isPlatformBrowser = isPlatformBrowser;
    exports.isPlatformServer = isPlatformServer;
    exports.isPlatformWorkerApp = isPlatformWorkerApp;
    exports.isPlatformWorkerUi = isPlatformWorkerUi;
    exports.registerLocaleData = registerLocaleData;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
