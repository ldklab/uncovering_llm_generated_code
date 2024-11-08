(function (global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define(factory);
    } else {
        global.ResizeObserver = factory();
    }
}(this, (function () { 'use strict';

    const MapShim = (() => {
        if (typeof Map !== 'undefined') return Map;

        function getIndex(arr, key) {
            let result = -1;
            arr.some((entry, index) => {
                if (entry[0] === key) {
                    result = index;
                    return true;
                }
                return false;
            });
            return result;
        }

        return class {
            constructor() { this.__entries__ = []; }
            get size() { return this.__entries__.length; }
            get(key) {
                const index = getIndex(this.__entries__, key);
                const entry = this.__entries__[index];
                return entry && entry[1];
            }
            set(key, value) {
                const index = getIndex(this.__entries__, key);
                if (~index) {
                    this.__entries__[index][1] = value;
                } else {
                    this.__entries__.push([key, value]);
                }
            }
            delete(key) {
                const index = getIndex(this.__entries__, key);
                if (~index) this.__entries__.splice(index, 1);
            }
            has(key) { return !!~getIndex(this.__entries__, key); }
            clear() { this.__entries__.splice(0); }
            forEach(callback, ctx = null) {
                for (let entry of this.__entries__) {
                    callback.call(ctx, entry[1], entry[0]);
                }
            }
        };
    })();

    const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined' && window.document === document;

    const global$1 = (() => {
        if (typeof global !== 'undefined' && global.Math === Math) return global;
        if (typeof self !== 'undefined' && self.Math === Math) return self;
        if (typeof window !== 'undefined' && window.Math === Math) return window;
        return Function('return this')();
    })();

    const requestAnimationFrame$1 = (() => {
        if (typeof requestAnimationFrame === 'function') {
            return requestAnimationFrame.bind(global$1);
        }
        return callback => setTimeout(() => callback(Date.now()), 1000 / 60);
    })();

    const trailingTimeout = 2;

    function throttle(callback, delay) {
        let leadingCall = false, trailingCall = false, lastCallTime = 0;

        function resolvePending() {
            if (leadingCall) {
                leadingCall = false;
                callback();
            }
            if (trailingCall) {
                proxy();
            }
        }

        function timeoutCallback() {
            requestAnimationFrame$1(resolvePending);
        }

        function proxy() {
            const timeStamp = Date.now();
            if (leadingCall) {
                if (timeStamp - lastCallTime < trailingTimeout) return;
                trailingCall = true;
            } else {
                leadingCall = true;
                trailingCall = false;
                setTimeout(timeoutCallback, delay);
            }
            lastCallTime = timeStamp;
        }
        return proxy;
    }

    const REFRESH_DELAY = 20;
    const transitionKeys = ['top', 'right', 'bottom', 'left', 'width', 'height', 'size', 'weight'];
    const mutationObserverSupported = typeof MutationObserver !== 'undefined';

    class ResizeObserverController {
        constructor() {
            this.connected_ = false;
            this.mutationEventsAdded_ = false;
            this.mutationsObserver_ = null;
            this.observers_ = [];
            this.onTransitionEnd_ = this.onTransitionEnd_.bind(this);
            this.refresh = throttle(this.refresh.bind(this), REFRESH_DELAY);
        }

        addObserver(observer) {
            if (!~this.observers_.indexOf(observer)) {
                this.observers_.push(observer);
            }
            if (!this.connected_) {
                this.connect_();
            }
        }

        removeObserver(observer) {
            const index = this.observers_.indexOf(observer);
            if (~index) this.observers_.splice(index, 1);

            if (!this.observers_.length && this.connected_) {
                this.disconnect_();
            }
        }

        refresh() {
            const changesDetected = this.updateObservers_();
            if (changesDetected) {
                this.refresh();
            }
        }

        updateObservers_() {
            const activeObservers = this.observers_.filter(observer => {
                observer.gatherActive();
                return observer.hasActive();
            });

            activeObservers.forEach(observer => observer.broadcastActive());
            return activeObservers.length > 0;
        }

        connect_() {
            if (!isBrowser || this.connected_) return;

            document.addEventListener('transitionend', this.onTransitionEnd_);
            window.addEventListener('resize', this.refresh);

            if (mutationObserverSupported) {
                this.mutationsObserver_ = new MutationObserver(this.refresh);
                this.mutationsObserver_.observe(document, { attributes: true, childList: true, characterData: true, subtree: true });
            } else {
                document.addEventListener('DOMSubtreeModified', this.refresh);
                this.mutationEventsAdded_ = true;
            }
            this.connected_ = true;
        }

        disconnect_() {
            if (!isBrowser || !this.connected_) return;

            document.removeEventListener('transitionend', this.onTransitionEnd_);
            window.removeEventListener('resize', this.refresh);

            if (this.mutationsObserver_) {
                this.mutationsObserver_.disconnect();
            }
            if (this.mutationEventsAdded_) {
                document.removeEventListener('DOMSubtreeModified', this.refresh);
            }
            this.mutationsObserver_ = null;
            this.mutationEventsAdded_ = false;
            this.connected_ = false;
        }

        onTransitionEnd_({ propertyName = '' }) {
            const isReflowProperty = transitionKeys.some(key => propertyName.indexOf(key) !== -1);
            if (isReflowProperty) {
                this.refresh();
            }
        }

        static getInstance() {
            if (!this.instance_) {
                this.instance_ = new ResizeObserverController();
            }
            return this.instance_;
        }
    }
    ResizeObserverController.instance_ = null;

    const defineConfigurable = (target, props) => {
        for (let key of Object.keys(props)) {
            Object.defineProperty(target, key, {
                value: props[key],
                enumerable: false,
                writable: false,
                configurable: true
            });
        }
        return target;
    };

    const getWindowOf = (target) => {
        const ownerGlobal = target && target.ownerDocument && target.ownerDocument.defaultView;
        return ownerGlobal || global$1;
    };

    const emptyRect = createRectInit(0, 0, 0, 0);

    function toFloat(value) {
        return parseFloat(value) || 0;
    }

    function getBordersSize(styles, ...positions) {
        return positions.reduce((size, position) => {
            const value = styles['border-' + position + '-width'];
            return size + toFloat(value);
        }, 0);
    }

    function getPaddings(styles) {
        const positions = ['top', 'right', 'bottom', 'left'];
        const paddings = {};
        for (let position of positions) {
            const value = styles['padding-' + position];
            paddings[position] = toFloat(value);
        }
        return paddings;
    }

    function getSVGContentRect(target) {
        const bbox = target.getBBox();
        return createRectInit(0, 0, bbox.width, bbox.height);
    }

    function getHTMLElementContentRect(target) {
        const clientWidth = target.clientWidth, clientHeight = target.clientHeight;
        if (!clientWidth && !clientHeight) {
            return emptyRect;
        }

        const styles = getWindowOf(target).getComputedStyle(target);
        const paddings = getPaddings(styles);
        const horizPad = paddings.left + paddings.right;
        const vertPad = paddings.top + paddings.bottom;

        let width = toFloat(styles.width), height = toFloat(styles.height);

        if (styles.boxSizing === 'border-box') {
            if (Math.round(width + horizPad) !== clientWidth) {
                width -= getBordersSize(styles, 'left', 'right') + horizPad;
            }
            if (Math.round(height + vertPad) !== clientHeight) {
                height -= getBordersSize(styles, 'top', 'bottom') + vertPad;
            }
        }

        if (!isDocumentElement(target)) {
            const vertScrollbar = Math.round(width + horizPad) - clientWidth;
            const horizScrollbar = Math.round(height + vertPad) - clientHeight;

            if (Math.abs(vertScrollbar) !== 1) {
                width -= vertScrollbar;
            }
            if (Math.abs(horizScrollbar) !== 1) {
                height -= horizScrollbar;
            }
        }
        return createRectInit(paddings.left, paddings.top, width, height);
    }

    const isSVGGraphicsElement = (() => {
        if (typeof SVGGraphicsElement !== 'undefined') {
            return target => target instanceof getWindowOf(target).SVGGraphicsElement;
        }
        return target => (target instanceof getWindowOf(target).SVGElement && typeof target.getBBox === 'function');
    })();

    function isDocumentElement(target) {
        return target === getWindowOf(target).document.documentElement;
    }

    function getContentRect(target) {
        if (!isBrowser) {
            return emptyRect;
        }
        if (isSVGGraphicsElement(target)) {
            return getSVGContentRect(target);
        }
        return getHTMLElementContentRect(target);
    }

    function createReadOnlyRect({ x, y, width, height }) {
        const Constr = typeof DOMRectReadOnly !== 'undefined' ? DOMRectReadOnly : Object;
        const rect = Object.create(Constr.prototype);

        defineConfigurable(rect, {
            x, y, width, height,
            top: y,
            right: x + width,
            bottom: height + y,
            left: x
        });

        return rect;
    }

    function createRectInit(x, y, width, height) {
        return { x, y, width, height };
    }

    class ResizeObservation {
        constructor(target) {
            this.broadcastWidth = 0;
            this.broadcastHeight = 0;
            this.contentRect_ = createRectInit(0, 0, 0, 0);
            this.target = target;
        }

        isActive() {
            const rect = getContentRect(this.target);
            this.contentRect_ = rect;
            return (rect.width !== this.broadcastWidth || rect.height !== this.broadcastHeight);
        }

        broadcastRect() {
            const rect = this.contentRect_;
            this.broadcastWidth = rect.width;
            this.broadcastHeight = rect.height;
            return rect;
        }
    }

    class ResizeObserverEntry {
        constructor(target, rectInit) {
            const contentRect = createReadOnlyRect(rectInit);
            defineConfigurable(this, { target, contentRect });
        }
    }

    class ResizeObserverSPI {
        constructor(callback, controller, callbackCtx) {
            this.activeObservations_ = [];
            this.observations_ = new MapShim();

            if (typeof callback !== 'function') {
                throw new TypeError('The callback provided as parameter 1 is not a function.');
            }

            this.callback_ = callback;
            this.controller_ = controller;
            this.callbackCtx_ = callbackCtx;
        }

        observe(target) {
            if (!arguments.length) {
                throw new TypeError('1 argument required, but only 0 present.');
            }

            if (typeof Element === 'undefined' || !(Element instanceof Object)) {
                return;
            }

            if (!(target instanceof getWindowOf(target).Element)) {
                throw new TypeError('parameter 1 is not of type "Element".');
            }

            const observations = this.observations_;
            if (observations.has(target)) return;

            observations.set(target, new ResizeObservation(target));
            this.controller_.addObserver(this);
            this.controller_.refresh();
        }

        unobserve(target) {
            if (!arguments.length) {
                throw new TypeError('1 argument required, but only 0 present.');
            }

            if (typeof Element === 'undefined' || !(Element instanceof Object)) {
                return;
            }

            if (!(target instanceof getWindowOf(target).Element)) {
                throw new TypeError('parameter 1 is not of type "Element".');
            }

            const observations = this.observations_;
            if (!observations.has(target)) return;

            observations.delete(target);
            if (!observations.size) {
                this.controller_.removeObserver(this);
            }
        }

        disconnect() {
            this.clearActive();
            this.observations_.clear();
            this.controller_.removeObserver(this);
        }

        gatherActive() {
            this.clearActive();
            this.observations_.forEach(observation => {
                if (observation.isActive()) {
                    this.activeObservations_.push(observation);
                }
            });
        }

        broadcastActive() {
            if (!this.hasActive()) return;

            const ctx = this.callbackCtx_;
            const entries = this.activeObservations_.map(observation => {
                return new ResizeObserverEntry(observation.target, observation.broadcastRect());
            });
            this.callback_.call(ctx, entries, ctx);
            this.clearActive();
        }

        clearActive() {
            this.activeObservations_.splice(0);
        }

        hasActive() {
            return this.activeObservations_.length > 0;
        }
    }

    const observers = typeof WeakMap !== 'undefined' ? new WeakMap() : new MapShim();

    class ResizeObserver {
        constructor(callback) {
            if (!(this instanceof ResizeObserver)) {
                throw new TypeError('Cannot call a class as a function.');
            }
            if (!arguments.length) {
                throw new TypeError('1 argument required, but only 0 present.');
            }

            const controller = ResizeObserverController.getInstance();
            const observer = new ResizeObserverSPI(callback, controller, this);
            observers.set(this, observer);
        }
    }

    ['observe', 'unobserve', 'disconnect'].forEach(method => {
        ResizeObserver.prototype[method] = function () {
            const targetObserver = observers.get(this);
            return targetObserver[method].apply(targetObserver, arguments);
        };
    });

    const index = (() => {
        if (typeof global$1.ResizeObserver !== 'undefined') {
            return global$1.ResizeObserver;
        }
        return ResizeObserver;
    })();

    return index;
})));
