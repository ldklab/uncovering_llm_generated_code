(function (global) {
    // Utility function to safely create namespaced symbols
    function __symbol__(name) {
        return '__zone_symbol__' + name;
    }

    // Global references
    var Zone = (function () {
        var ZoneDelegate = function (zone, parentDelegate, zoneSpec) {
            this.zone = zone;
            this.parent = parentDelegate;
            this.zoneSpec = zoneSpec;
        };

        ZoneDelegate.prototype = {
            fork: function (zoneSpec) { return new Zone(this.zone, zoneSpec); },
            intercept: function (callback, source) {
                return callback;
            },
            invoke: function (callback, applyThis, applyArgs, source) {
                return callback.apply(applyThis, applyArgs);
            }
        };

        var Zone = function (parent, zoneSpec) {
            this.parent = parent;
            this.zoneSpec = zoneSpec;
            this.zoneDelegate = new ZoneDelegate(this, parent && parent.zoneDelegate, zoneSpec);
        };

        Zone.prototype.run = function (callback, applyThis, applyArgs, source) {
            return this.zoneDelegate.invoke(callback, applyThis, applyArgs, source);
        };

        Zone.prototype.wrap = function (callback, source) {
            return this.zoneDelegate.intercept(callback, source);
        };

        return Zone;
    })();

    // Patching asynchronous APIs
    function patchTimer(obj, setName, cancelName) {
        const setNative = obj[setName];
        const clearNative = obj[cancelName];

        obj[setName] = function (func, delay, ...args) {
            const callback = function () {
                func.apply(this, args);
            };
            return setNative.call(obj, callback, delay);
        };

        obj[cancelName] = function (id) {
            return clearNative.call(obj, id);
        };
    }

    patchTimer(global, 'setTimeout', 'clearTimeout');
    patchTimer(global, 'setInterval', 'clearInterval');

    // Patching EventTarget
    function patchEventTargetMethods(objPrototype) {
        const addEventListener = objPrototype.addEventListener;
        const removeEventListener = objPrototype.removeEventListener;

        objPrototype.addEventListener = function (type, listener, options) {
            const wrappedListener = listener.__zone_symbol__function || (listener.__zone_symbol__function = function (...args) {
                return Zone.current.wrap(listener).apply(this, args);
            });
            return addEventListener.call(this, type, wrappedListener, options);
        };

        objPrototype.removeEventListener = function (type, listener, options) {
            const wrappedListener = listener.__zone_symbol__function;
            return removeEventListener.call(this, type, wrappedListener || listener, options);
        };
    }

    if (global.EventTarget) {
        patchEventTargetMethods(global.EventTarget.prototype);
    }

    // Patch Promise
    const NativePromise = global.Promise;
    function ZoneAwarePromise(executor) {
        const zone = Zone.current;
        return new NativePromise(zone.wrap(executor));
    }

    global.Promise = ZoneAwarePromise;

    // Attach the zone object to the global namespace
    global.Zone = Zone;

    // Initialize root zone
    Zone.current = new Zone(null, null);

})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : this);
