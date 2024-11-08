(function (root, factory) {
    // Check for AMD, CommonJS, and default to global
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        module.exports = factory();
    } else {
        root.Zone = factory();
    }
}(typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    // Defining constants and utilities
    function noop() {}
    function mark(name) {
        if (performance && performance['mark']) {
            performance.mark(name);
        }
    }
    function performanceMeasure(name, label) {
        if (performance && performance['measure']) {
            performance.measure(name, label);
        }
    }

    // Zone configuration
    var symbolPrefix = '__zone_symbol__';
    function __symbol__(name) {
        return symbolPrefix + name;
    }

    var patches = {};
    var _currentZoneFrame = { parent: null, zone: null };
    var _currentTask = null;

    // Main Zone class
    var Zone = (function () {
        function Zone(parent, zoneSpec) {
            this._parent = parent;
            this._name = zoneSpec?.name || 'root';
            this._properties = zoneSpec?.properties || {};
            this._zoneDelegate = new ZoneDelegate(this, parent && parent._zoneDelegate, zoneSpec);
        }

        Zone.assertZonePatched = function () {
            if (global['Promise'] !== patches['ZoneAwarePromise']) {
                throw new Error('Zone has detected that ZoneAwarePromise has been overwritten.');
            }
        };

        Object.defineProperty(Zone, "current", {
            get: function () {
                return _currentZoneFrame.zone;
            },
            configurable: true
        });

        Zone.prototype.fork = function (zoneSpec) {
            if (!zoneSpec) throw new Error('ZoneSpec required!');
            return this._zoneDelegate.fork(this, zoneSpec);
        };

        Zone.prototype.wrap = function (callback, source) {
            if (typeof callback !== 'function') {
                throw new Error('Expecting function, got: ' + callback);
            }
            return this._zoneDelegate.intercept(this, callback, source);
        };

        Zone.prototype.run = function (callback, applyThis, applyArgs, source) {
            _currentZoneFrame = { parent: _currentZoneFrame, zone: this };
            try {
                return this._zoneDelegate.invoke(this, callback, applyThis, applyArgs, source);
            } finally {
                _currentZoneFrame = _currentZoneFrame.parent;
            }
        };

        // Other internal methods...

        return Zone;
    }());

    // ZoneDelegate class
    var ZoneDelegate = function (zone, parentDelegate, zoneSpec) {
        // Initialize various properties and methods
    };

    // ZoneTask class
    var ZoneTask = function (type, source, callback, options, scheduleFn, cancelFn) {
        // Initialize task-related properties
    };

    // Task scheduling methods
    function scheduleMicroTask(task) {
        // Scheduling logic...
    }

    function patchEventTarget(api, target) {
        // Patches event target methods to make them zone-aware
    }

    // API exposure
    var _global = typeof window !== 'undefined' && window || typeof self !== 'undefined' && self || global;
    var _api = {
        symbol: __symbol__,
        patchEventTarget: patchEventTarget,
        // Other utility functions...
    };

    // Patching global objects and APIs
    Zone.__load_patch('toString', function (global) {
        // Patch Function.prototype.toString
    });

    // Other patch loading...

    return Zone;
}));
