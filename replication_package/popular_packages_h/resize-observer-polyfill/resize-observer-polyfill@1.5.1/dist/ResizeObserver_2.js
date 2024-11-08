(function(global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined'
        ? module.exports = factory()
        : typeof define === 'function' && define.amd
        ? define(factory)
        : (global.ResizeObserver = factory());
}(this, function() {
    'use strict';

    // Minimal Map Shim.
    var MapShim = typeof Map !== 'undefined' ? Map : (function() {
        function MapShim() {
            this.entries = [];
        }
        MapShim.prototype.size = function() {
            return this.entries.length;
        };
        MapShim.prototype.get = function(key) {
            var index = this.entries.findIndex(entry => entry[0] === key);
            return index !== -1 ? this.entries[index][1] : undefined;
        };
        MapShim.prototype.set = function(key, value) {
            var index = this.entries.findIndex(entry => entry[0] === key);
            if (index !== -1) this.entries[index][1] = value;
            else this.entries.push([key, value]);
        };
        MapShim.prototype.delete = function(key) {
            var index = this.entries.findIndex(entry => entry[0] === key);
            if (index !== -1) this.entries.splice(index, 1);
        };
        MapShim.prototype.has = function(key) {
            return this.entries.some(entry => entry[0] === key);
        };
        MapShim.prototype.clear = function() {
            this.entries = [];
        };
        MapShim.prototype.forEach = function(callback, ctx) {
            this.entries.forEach(entry => callback.call(ctx, entry[1], entry[0]));
        };
        return MapShim;
    })();

    var isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';
    var globalObject = typeof global !== 'undefined' ? global : self || Function('return this')();

    var requestAnimationFrameShim = (function() {
        return typeof requestAnimationFrame === 'function'
            ? requestAnimationFrame.bind(globalObject)
            : function(callback) {
                return setTimeout(function() { callback(Date.now()); }, 1000/60);
            };
    })();

    function throttle(callback, delay) {
        var leadingCall = false, trailingCall = false, lastCallTime = 0;
        function resolvePending() {
            if (leadingCall) {
                leadingCall = false;
                callback();
            }
            if (trailingCall) proxy();
        }
        function timeoutCallback() {
            requestAnimationFrameShim(resolvePending);
        }
        function proxy() {
            var timeStamp = Date.now();
            if (leadingCall) {
                if (timeStamp - lastCallTime < delay) return;
                trailingCall = true;
            } else {
                leadingCall = true;
                setTimeout(timeoutCallback, delay);
            }
            lastCallTime = timeStamp;
        }
        return proxy;
    }

    var REFRESH_DELAY = 20;
    var observersRegistry = typeof WeakMap !== 'undefined' ? new WeakMap() : new MapShim();

    class ResizeObserverController {
        constructor() {
            this.observers = [];
            this.connected = false;
            this.onTransitionEndBound = this.onTransitionEnd_.bind(this);
            this.refresh = throttle(this.refresh.bind(this), REFRESH_DELAY);
        }
        static getInstance() {
            if (!ResizeObserverController.instance) {
                ResizeObserverController.instance = new ResizeObserverController();
            }
            return ResizeObserverController.instance;
        }
        addObserver(observer) {
            if (!this.observers.includes(observer)) {
                this.observers.push(observer);
            }
            if (!this.connected) this.connect_();
        }
        removeObserver(observer) {
            const index = this.observers.indexOf(observer);
            if (index !== -1) this.observers.splice(index, 1);
            if (!this.observers.length && this.connected) {
                this.disconnect_();
            }
        }
        refresh() {
            const changesDetected = this.updateObservers();
            if (changesDetected) this.refresh();
        }
        updateObservers() {
            const activeObservers = this.observers.filter(observer => {
                observer.gatherActive();
                return observer.hasActive();
            });
            activeObservers.forEach(observer => observer.broadcastActive());
            return activeObservers.length > 0;
        }
        connect_() {
            if (!isBrowser || this.connected) return;
            window.addEventListener('resize', this.refresh);
            document.addEventListener('transitionend', this.onTransitionEndBound);
            // Further MutationObserver implementation...
            this.connected = true;
        }
        disconnect_() {
            if (!isBrowser || !this.connected) return;
            window.removeEventListener('resize', this.refresh);
            document.removeEventListener('transitionend', this.onTransitionEndBound);
            // Further cleanup...
            this.connected = false;
        }
        onTransitionEnd_({ propertyName = '' }) {
            if (['top', 'right', 'bottom', 'left', 'width', 'height', 'size', 'weight'].some(key => propertyName.includes(key))) {
                this.refresh();
            }
        }
    }

    class ResizeObserverSPI {
        constructor(callback, controller, callbackCtx) {
            this.activeObservations = [];
            this.observations = new MapShim();
            if (typeof callback !== 'function') {
                throw new TypeError('The callback provided as parameter 1 is not a function.');
            }
            this.callback = callback;
            this.controller = controller;
            this.callbackCtx = callbackCtx;
        }
        observe(target) {
            if (!(target instanceof Element)) {
                throw new TypeError('parameter 1 is not of type "Element".');
            }
            if (!this.observations.has(target)) {
                this.observations.set(target, new ResizeObservation(target));
                this.controller.addObserver(this);
                this.controller.refresh();
            }
        }
        unobserve(target) {
            if (!(target instanceof Element)) {
                throw new TypeError('parameter 1 is not of type "Element".');
            }
            if (this.observations.has(target)) {
                this.observations.delete(target);
                if (!this.observations.size) this.controller.removeObserver(this);
            }
        }
        disconnect() {
            this.activeObservations = [];
            this.observations.clear();
            this.controller.removeObserver(this);
        }
        gatherActive() {
            this.clearActive();
            this.observations.forEach(observation => {
                if (observation.isActive()) {
                    this.activeObservations.push(observation);
                }
            });
        }
        broadcastActive() {
            if (!this.hasActive()) return;
            const entries = this.activeObservations.map(observation => {
                return new ResizeObserverEntry(observation.target, observation.broadcastRect());
            });
            this.callback.call(this.callbackCtx, entries, this.callbackCtx);
            this.clearActive();
        }
        clearActive() {
            this.activeObservations = [];
        }
        hasActive() {
            return this.activeObservations.length > 0;
        }
    }

    class ResizeObservation {
        constructor(target) {
            this.target = target;
            this.contentRect_ = this.broadcastRect();
        }
        isActive() {
            const rect = getContentRect(this.target);
            this.contentRect_ = rect;
            return rect.width !== this.broadcastWidth || rect.height !== this.broadcastHeight;
        }
        broadcastRect() {
            return this.contentRect_;
        }
    }

    class ResizeObserverEntry {
        constructor(target, rectInit) {
            this.target = target;
            this.contentRect = rectInit;
        }
    }

    class ResizeObserver {
        constructor(callback) {
            if (!(this instanceof ResizeObserver)) {
                throw new TypeError('Cannot call a class as a function.');
            }
            const controller = ResizeObserverController.getInstance();
            const observer = new ResizeObserverSPI(callback, controller, this);
            observersRegistry.set(this, observer);
        }
    }

    ['observe', 'unobserve', 'disconnect'].forEach(method => {
        ResizeObserver.prototype[method] = function(...args) {
            const observer = observersRegistry.get(this);
            return observer ? observer[method](...args) : null;
        };
    });

    return typeof globalObject.ResizeObserver !== 'undefined'
        ? globalObject.ResizeObserver
        : ResizeObserver;

}));
