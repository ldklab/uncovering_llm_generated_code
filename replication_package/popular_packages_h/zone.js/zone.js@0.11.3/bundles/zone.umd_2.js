(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        factory(require('zone.js'));
    } else {
        factory();
    }
}(function() {
    'use strict';

    // Polyfill for `zone.js` functionalities, focusing on zone execution contexts.

    function defineZone(global) {
        const Zone = function(parent, zoneSpec) {
            this._parent = parent;
            this._name = zoneSpec ? zoneSpec.name || 'unnamed' : '<root>';
            this._properties = zoneSpec && zoneSpec.properties || {};
            this._zoneDelegate = new ZoneDelegate(this, this._parent && this._parent._zoneDelegate, zoneSpec);
        };

        Zone.current = {};
        Zone.root = {};
        Zone.prototype.run = function(callback) {
            try {
                return this._zoneDelegate.invoke(this, callback);
            } finally {
                // Cleanup logic after callback
            }
        };

        // Mocking a zone's task scheduling
        Zone.prototype.scheduleTask = function(task) {
            setTimeout(() => {
                this._zoneDelegate.invoke(this, task.callback);
            }, task.delay || 0);
        };

        function noop() {}

        function ZoneDelegate(zone, parentDelegate, zoneSpec) {
            this.zone = zone;
            this.parentDelegate = parentDelegate;
            // Other initialization code
        }

        ZoneDelegate.prototype.invoke = function(zone, callback) {
            return callback();
        };

        global.Zone = Zone;
        return Zone;
    }

    function patchTimers(global) {
        const originalSetTimeout = global.setTimeout;
        global.setTimeout = function(callback, delay) {
            return originalSetTimeout.call(this, Zone.current.run(callback), delay);
        };
    }

    function patchEventListener(global) {
        const originalAddEventListener = global.addEventListener;
        global.addEventListener = function(type, listener) {
            return originalAddEventListener.call(this, type, Zone.current.wrap(listener));
        };
    }

    function bootstrapZones() {
        const global = typeof window !== 'undefined' ? window : globalThis;
        const Zone = defineZone(global);

        Zone.current = new Zone(null, {name: 'default'});
        Zone.root = Zone.current;

        patchTimers(global);
        patchEventListener(global);

        // Running test code in a zone
        Zone.current.run(() => {
            setTimeout(() => {
                console.log('In Zone:', Zone.current._name);  // Logs 'default'
            }, 1000);
        });
    }

    bootstrapZones();
}));
