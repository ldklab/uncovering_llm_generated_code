(function(root, factory) {
    if (typeof exports === 'object' && typeof module === 'object')
        module.exports = factory();      // CommonJS
    else if (typeof define === 'function' && define.amd)
        define([], factory);            // AMD
    else if (typeof exports === 'object')
        exports["esprima"] = factory(); // CommonJS exports
    else
        root["esprima"] = factory();    // Global variable
})(this, function() {
    return (function(modules) { 
        var installedModules = {}; // The module cache

        function __webpack_require__(moduleId) {
            if (installedModules[moduleId]) 
                return installedModules[moduleId].exports;

            var module = installedModules[moduleId] = {
                exports: {},
                id: moduleId,
                loaded: false
            };

            modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
            module.loaded = true;
            return module.exports;
        }

        __webpack_require__.m = modules;
        __webpack_require__.c = installedModules;
        __webpack_require__.p = "";

        return __webpack_require__(0);
    })({
        // module definitions go here, starting from id 0
    });
});
