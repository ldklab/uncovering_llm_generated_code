'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var tslib = require('tslib');
var sync = require('framesync');
var popmotion = require('popmotion');
var heyListen = require('hey-listen');
var styleValueTypes = require('style-value-types');
var React = require('react');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var sync__default = /*#__PURE__*/_interopDefaultLegacy(sync);
var React__default = /*#__PURE__*/_interopDefaultLegacy(React);

/* Utility functions */
var isRefObject = ref => typeof ref === "object" && ref.hasOwnProperty("current");
var isFloat = value => !isNaN(parseFloat(value));
function noop(any) { return any; }

/* Subscription Manager */
class SubscriptionManager {
    constructor() {
        this.subscriptions = new Set();
    }
    add(handler) {
        this.subscriptions.add(handler);
        return () => this.subscriptions.delete(handler);
    }
    notify(a, b, c) {
        if (!this.subscriptions.size) return;
        for (const handler of this.subscriptions) {
            handler(a, b, c);
        }
    }
    clear() {
        this.subscriptions.clear();
    }
}

/* Motion Value */
class MotionValue {
    constructor(init) {
        this.timeDelta = 0;
        this.lastUpdated = 0;
        this.updateSubscribers = new SubscriptionManager();
        this.renderSubscribers = new SubscriptionManager();
        this.canTrackVelocity = false;
        this.current = init;
        this.prev = undefined;
        this.canTrackVelocity = isFloat(this.current);

        this.updateAndNotify = (v, render = true) => {
            this.prev = this.current;
            this.current = v;
            if (this.prev !== this.current) {
                this.updateSubscribers.notify(this.current);
            }
            if (render) this.renderSubscribers.notify(this.current);
            
            const { delta, timestamp } = sync.getFrameData();
            if (this.lastUpdated !== timestamp) {
                this.timeDelta = delta;
                this.lastUpdated = timestamp;
                sync__default['default'].postRender(this.scheduleVelocityCheck);
            }
        };

        this.scheduleVelocityCheck = () => {
            sync__default['default'].postRender(this.velocityCheck);
        };

        this.velocityCheck = ({ timestamp }) => {
            if (timestamp !== this.lastUpdated) {
                this.prev = this.current;
            }
        };
    }

    onChange(subscription) {
        return this.updateSubscribers.add(subscription);
    }

    clearListeners() {
        this.updateSubscribers.clear();
    }

    onRenderRequest(subscription) {
        subscription(this.get());
        return this.renderSubscribers.add(subscription);
    }

    attach(passiveEffect) {
        this.passiveEffect = passiveEffect;
    }

    set(v, render = true) {
        if (!render || !this.passiveEffect) {
            this.updateAndNotify(v, render);
        } else {
            this.passiveEffect(v, this.updateAndNotify);
        }
    }

    get() {
        return this.current;
    }

    getPrevious() {
        return this.prev;
    }

    getVelocity() {
        return this.canTrackVelocity 
            ? popmotion.velocityPerSecond(parseFloat(this.current) - parseFloat(this.prev), this.timeDelta)
            : 0;
    }

    start(animation) {
        this.stop();
        return new Promise(resolve => {
            this.stopAnimation = animation(resolve);
        }).then(() => this.clearAnimation());
    }

    stop() {
        if (this.stopAnimation) this.stopAnimation();
        this.clearAnimation();
    }

    isAnimating() {
        return !!this.stopAnimation;
    }

    clearAnimation() {
        this.stopAnimation = null;
    }

    destroy() {
        this.updateSubscribers.clear();
        this.renderSubscribers.clear();
        this.stop();
    }
}

function motionValue(init) {
    return new MotionValue(init);
}

/* VisualElement */
class VisualElement {
    constructor(parent, ref) {
        this.children = new Set();
        this.baseTarget = {};
        this.latest = {};
        this.values = new Map();
        this.valueSubscriptions = new Map();
        this.config = {};
        this.isMounted = false;
        this.update = () => this.config.onUpdate(this.latest);
        this.triggerRender = () => this.render();
        this.ref = element => {
            element ? this.mount(element) : this.unmount();
            if (!this.externalRef) return;
            if (typeof this.externalRef === "function") {
                this.externalRef(element);
            } else if (isRefObject(this.externalRef)) {
                this.externalRef.current = element;
            }
        };
        this.parent = parent;
        this.rootParent = parent ? parent.rootParent : this;
        this.treePath = parent ? tslib.__spread(parent.treePath, [parent]) : [];
        this.depth = parent ? parent.depth + 1 : 0;
        this.externalRef = ref;
    }

    getVariantPayload() {
        return this.config.custom;
    }

    getVariant(label) {
        var _a;
        return (_a = this.config.variants) === null || _a === void 0 ? void 0 : _a[label];
    }

    addVariantChild(visualElement) {
        var _this = this;
        if (!this.variantChildren) this.variantChildren = new Set();
        this.variantChildren.add(visualElement);
        return function () { return _this.variantChildren.delete(visualElement); };
    }

    onAnimationStart() {
        var _a, _b;
        (_b = (_a = this.config).onAnimationStart) === null || _b === void 0 ? void 0 : _b.call(_a);
    }

    onAnimationComplete() {
        var _a, _b;
        this.isMounted && ((_b = (_a = this.config).onAnimationComplete) === null || _b === void 0 ? void 0 : _b.call(_a));
    }

    getDefaultTransition() {
        return this.config.transition;
    }
  
    subscribe(child) {
        var _this = this;
        this.children.add(child);
        return function () { return _this.children.delete(child); };
    }

    hasValue(key) {
        return this.values.has(key);
    }

    addValue(key, value) {
        if (this.hasValue(key)) this.removeValue(key);
        this.values.set(key, value);
        this.setSingleStaticValue(key, value.get());
        this.subscribeToValue(key, value);
    }
    
    removeValue(key) {
        var _a;
        (_a = this.valueSubscriptions.get(key)) === null || _a === void 0 ? void 0 : _a();
        this.valueSubscriptions.delete(key);
        this.values.delete(key);
        delete this.latest[key];
    }
  
    getValue(key, defaultValue) {
        var value = this.values.get(key);
        if (value === undefined && defaultValue !== undefined) {
            value = new MotionValue(defaultValue);
            this.addValue(key, value);
        }
        return value;
    }
  
    forEachValue(callback) {
        this.values.forEach(callback);
    }

    getInstance() {
        return this.element;
    }

    updateConfig(config) {
        if (config === void 0) { config = {}; }
        this.config = tslib.__assign({}, config);
    }

    getBaseValue(key, _props) {
        return this.baseTarget[key];
    }

    setSingleStaticValue(key, value) {
        this.latest[key] = value;
    }

    setStaticValues(values, value) {
        if (typeof values === "string") {
            this.setSingleStaticValue(values, value);
        } else {
            for (var key in values) {
                this.setSingleStaticValue(key, values[key]);
            }
        }
    }

    scheduleRender() {
        sync__default['default'].render(this.triggerRender, false, true);
    }

    subscribeToValue(key, value) {
        var _this = this;
        var onChange = function (latest) {
            _this.setSingleStaticValue(key, latest);
            _this.element && _this.config.onUpdate && sync__default['default'].update(_this.update, false, true);
        };
        var onRender = function () {
            _this.element && _this.scheduleRender();
        };
        var unsubscribeOnChange = value.onChange(onChange);
        var unsubscribeOnRender = value.onRenderRequest(onRender);
        this.valueSubscriptions.set(key, function () {
            unsubscribeOnChange();
            unsubscribeOnRender();
        });
    }

    mount(element) {
        heyListen.invariant(!!element, "No ref found. Ensure components created with motion.custom forward refs using React.forwardRef");
        if (this.parent) {
            this.removeFromParent = this.parent.subscribe(this);
        }
        this.element = this.current = element;
    }

    unmount() {
        var _this = this;
        this.forEachValue(function (_, key) { return _this.removeValue(key); });
        sync.cancelSync.update(this.update);
        sync.cancelSync.render(this.render);
        this.removeFromParent && this.removeFromParent();
    }
}

/* Main export block */
/**
 * @internal
 */
exports.MotionValue = MotionValue;
exports.VisualElement = VisualElement;
