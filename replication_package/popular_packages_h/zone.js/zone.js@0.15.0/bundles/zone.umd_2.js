'use strict';

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        factory();
    }
})((function () {
    'use strict';

    var global = globalThis;

    function __symbol__(name) {
        var symbolPrefix = global['__Zone_symbol_prefix'] || '__zone_symbol__';
        return symbolPrefix + name;
    }

    function loadZone() {
        var global = globalThis;
        if (global['Zone']) {
            throw new Error('Zone already loaded.');
        }
        global['Zone'] = initZone();
        return global['Zone'];
    }

    function initZone() {
        var ZoneImpl = function (parent, zoneSpec) {
            this._parent = parent;
            this._name = zoneSpec ? zoneSpec.name || 'unnamed' : '<root>';
            this._properties = (zoneSpec && zoneSpec.properties) || {};
            this._zoneDelegate = new _ZoneDelegate(this, parent && parent._zoneDelegate, zoneSpec);
        };

        ZoneImpl.prototype.get = function (key) { 
            var zone = this._searchZoneWith(key);
            return zone ? zone._properties[key] : undefined;
        };

        ZoneImpl.prototype._searchZoneWith = function (key) {
            var currentZone = this;
            while (currentZone) {
                if (currentZone._properties.hasOwnProperty(key)) {
                    return currentZone;
                }
                currentZone = currentZone._parent;
            }
            return null;
        };

        ZoneImpl.current = function () {
            // Returns the current zone.
        };

        return ZoneImpl;
    }

    function patchPrototype(proto, methodNames) {
        methodNames.forEach(function (name) {
            var delegate = proto[name];
            proto[name] = function () {
                var args = Array.prototype.slice.call(arguments);
                return delegate.apply(this, args);
            };
        });
    }

    function patchMethod(target, name, patchFn) {
        var delegate = target[name];
        target[name] = patchFn(delegate);
    }

    var zoneSymbol = __symbol__;
    var Zone = loadZone();
}));
