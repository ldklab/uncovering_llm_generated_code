'use strict';

(function(factory) {
    typeof define === 'function' && define.amd ? define(factory) : factory();
}(function() {
    'use strict';

    var global = globalThis;

    // Helper function to create prefixed symbols.
    function __symbol__(name) {
        var symbolPrefix = global['__Zone_symbol_prefix'] || '__zone_symbol__';
        return symbolPrefix + name;
    }

    // Main Zone implementation
    function initZone() {
        var performance = global['performance'];

        function mark(name) {
            performance && performance['mark'] && performance['mark'](name);
        }

        function performanceMeasure(name, label) {
            performance && performance['measure'] && performance['measure'](name, label);
        }

        mark('Zone');

        class _ZoneDelegate {
            // ZoneDelegate methods and properties...
        }

        class ZoneImpl {
            // ZoneImpl methods and properties...

            static assertZonePatched() {
                if (global['Promise'] !== patches['ZoneAwarePromise']) {
                    throw new Error('Zone.js has detected that ZoneAwarePromise has been overwritten.');
                }
            }
            
            static get root() {
                var zone = ZoneImpl.current;
                while (zone.parent) {
                    zone = zone.parent;
                }
                return zone;
            }

            static get current() {
                return _currentZoneFrame.zone;
            }

            static get currentTask() {
                return _currentTask;
            }
            
            static __load_patch(name, fn) {
                if (patches.hasOwnProperty(name)) {
                    // Duplicate check control
                    var checkDuplicate = global[__symbol__('forceDuplicateZoneCheck')] === true;
                    if (!ignoreDuplicate && checkDuplicate) {
                        throw Error('Already loaded patch: ' + name);
                    }
                } else if (!global['__Zone_disable_' + name]) {
                    patches[name] = fn(global, _api);
                }
            }
            
            constructor(parent, zoneSpec) {
                this._parent = parent;
                this._name = zoneSpec ? zoneSpec.name || 'unnamed' : '<root>';
                this._properties = (zoneSpec && zoneSpec.properties) || {};
                this._zoneDelegate = new _ZoneDelegate(this, this._parent && this._parent._zoneDelegate, zoneSpec);
            }

            get parent() {
                return this._parent;
            }

            get name() {
                return this._name;
            }

            get(key) {
                var zone = this.getZoneWith(key);
                return zone && zone._properties[key];
            }
            
            getZoneWith(key) {
                var current = this;
                while (current) {
                    if (current._properties.hasOwnProperty(key)) {
                        return current;
                    }
                    current = current._parent;
                }
                return null;
            }
            
            fork(zoneSpec) {
                if (!zoneSpec) throw new Error('ZoneSpec required!');
                return this._zoneDelegate.fork(this, zoneSpec);
            }

            wrap(callback, source) {
                if (typeof callback !== 'function') {
                    throw new Error('Expecting function got: ' + typeof callback);
                }
                // Handle wrap...
            }

            run(callback, applyThis, applyArgs, source) {
                let previousZoneFrame = _currentZoneFrame;
                _currentZoneFrame = { parent: _currentZoneFrame, zone: this };
                try {
                    return this._zoneDelegate.invoke(this, callback, applyThis, applyArgs, source);
                } finally {
                    _currentZoneFrame = previousZoneFrame;
                }
            }
            
            runGuarded(callback, applyThis, applyArgs, source) {
                _currentZoneFrame = { parent: _currentZoneFrame, zone: this };
                try {
                    try {
                        return this._zoneDelegate.invoke(this, callback, applyThis, applyArgs, source);
                    } catch (error) {
                        if (this._zoneDelegate.handleError(this, error)) {
                            throw error;
                        }
                    }
                } finally {
                    _currentZoneFrame = _currentZoneFrame.parent;
                }
            }

            // More methods concerning task scheduling and management...
        }

        // ZoneTask and other helper classes...

        var _currentZoneFrame = { parent: null, zone: new ZoneImpl(null, null) };
        var _currentTask = null;
        var patches = {};

        function noop() {}

        // Zone API definition
        var _api = {
            symbol: __symbol__,
            currentZoneFrame: () => _currentZoneFrame,
            onUnhandledError: noop,
            microtaskDrainDone: noop,
            // Other methods...
        };

        performanceMeasure('Zone', 'Zone');
        return ZoneImpl;
    }

    // Initial load of the zone.js implementation
    function loadZone() {
        var globalZone = global['Zone'];
        if (globalZone && typeof globalZone.__symbol__ !== 'function') {
            throw new Error('Zone already loaded.');
        }
        global['Zone'] = initZone();
    }

    // Additional patches and utilities...

    loadZone();
}));
