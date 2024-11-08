(function (global, factory) {
    // Universal Module Definition for different module loading mechanisms
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@angular/common'), require('@angular/core'), require('rxjs')) :
    typeof define === 'function' && define.amd ? define(['@angular/common', '@angular/core', 'rxjs'], factory) :
    (global = global || self, factory((global.ng = global.ng || {}, global.ng.router = {}), global.ng.common, global.ng.core, global.rxjs));
}(this, (function (exports, common, core, rxjs) { 

    // The Angular Router module
    var Router = function (routerConfig) {
        this.config = routerConfig || []; // Initialize with route configuration

        this.navigate = function(routePath) {
            console.log(`Navigating to ${routePath}`);
            // Logic to handle the route change
        };
    };

    // Example route function
    Router.prototype.route = function(route) {
        console.log(`Routing with config:`, route);
    };

    // Simplifying a router link Directive
    var RouterLinkDirective = function () {
        var router = new Router();
        this.onClick = function (path) {
            router.navigate(path);
        };
    };

    // Exporting router components
    exports.Router = Router;
    exports.RouterLinkDirective = RouterLinkDirective;

})));
