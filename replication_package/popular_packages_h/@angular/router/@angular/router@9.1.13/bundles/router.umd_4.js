"use strict";

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

    class RouterEvent {
        constructor(id, url) {
            this.id = id;
            this.url = url;
        }
    }

    class NavigationStart extends RouterEvent {
        constructor(id, url, navigationTrigger = 'imperative', restoredState = null) {
            super(id, url);
            this.navigationTrigger = navigationTrigger;
            this.restoredState = restoredState;
        }

        toString() {
            return `NavigationStart(id: ${this.id}, url: '${this.url}')`;
        }
    }

    class NavigationEnd extends RouterEvent {
        constructor(id, url, urlAfterRedirects) {
            super(id, url);
            this.urlAfterRedirects = urlAfterRedirects;
        }

        toString() {
            return `NavigationEnd(id: ${this.id}, url: '${this.url}', urlAfterRedirects: '${this.urlAfterRedirects}')`;
        }
    }

    // Basic functionality to handle Angular routing setup
    function setupRouter() {
        // Implementation logic for the router setup, 
        // including event handlers and configuration loading.
    }

    function registerListeners() {
        // Register event listeners for router events
        // like NavigationStart, NavigationEnd, etc.
    }

    exports.RouterEvent = RouterEvent;
    exports.NavigationStart = NavigationStart;
    exports.NavigationEnd = NavigationEnd;
    exports.setupRouter = setupRouter;
    exports.registerListeners = registerListeners;

}));
