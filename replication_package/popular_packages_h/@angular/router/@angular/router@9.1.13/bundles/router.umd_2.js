(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports, require('@angular/common'), require('@angular/core'), require('rxjs'), require('rxjs/operators'));
    } else if (typeof define === 'function' && define.amd) {
        define('@angular/router', ['exports', '@angular/common', '@angular/core', 'rxjs', 'rxjs/operators'], factory);
    } else {
        global = global || self;
        factory((global.ng = global.ng || {}, global.ng.router = {}), global.ng.common, global.ng.core, global.rxjs, global.rxjs.operators);
    }
}(this, function (exports, common, core, rxjs, operators) {
    'use strict';

    var __extendStatics = function(d, b) {
        __extendStatics = Object.setPrototypeOf || function (d, b) { d.__proto__ = b; };
        return __extendStatics(d, b);
    };

    function __extends(d, b) {
        __extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    }

    var RouterEvent = /** @class */ (function () {
        function RouterEvent(id, url) {
            this.id = id;
            this.url = url;
        }
        return RouterEvent;
    }());

    var NavigationStart = /** @class */ (function (_super) {
        __extends(NavigationStart, _super);
        function NavigationStart(id, url, navigationTrigger, restoredState) {
            var _this = _super.call(this, id, url) || this;
            _this.navigationTrigger = navigationTrigger || 'imperative';
            _this.restoredState = restoredState || null;
            return _this;
        }
        return NavigationStart;
    }(RouterEvent));

    function createEmptyUrlTree() {
        return { root: {}, queryParams: {}, fragment: null };
    }

    function setupRouter() {
        // Setup and configuration of the Angular Router
        return {
            createUrlTree: function (commands, options) {
                // Logic for creating UrlTree
            },
            navigateByUrl: function (url) {
                // Logic for navigating by url
            }
        };
    }

    // Define exports
    exports.RouterEvent = RouterEvent;
    exports.NavigationStart = NavigationStart;
    exports.createEmptyUrlTree = createEmptyUrlTree;
    exports.setupRouter = setupRouter;

}));
