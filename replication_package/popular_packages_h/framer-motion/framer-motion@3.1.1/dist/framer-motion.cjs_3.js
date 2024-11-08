'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const tslib = require('tslib');
const sync = require('framesync');
const popmotion = require('popmotion');
const heyListen = require('hey-listen');
const styleValueTypes = require('style-value-types');
const React = require('react');

// Helper function for loading default module
function _interopDefaultLegacy (e) { 
   return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; 
}

const sync_default = _interopDefaultLegacy(sync);
const React_default = _interopDefaultLegacy(React);

/**
 * Check if an object is a reference object
 */
const isRefObject = (ref) => {
    return typeof ref === "object" && ref.hasOwnProperty("current");
};

/**
 * SubscriptionManager class for handling subscriptions
 */
class SubscriptionManager {
    constructor() {
        this.subscriptions = new Set();
    }

    add(handler) {
        this.subscriptions.add(handler);
        return () => this.subscriptions.delete(handler);
    }

    notify(a, b, c) {
        try {
            for (let handler of this.subscriptions) {
                handler(a, b, c);
            }
        } catch (e) {
            throw e;
        }
    }

    clear() {
        this.subscriptions.clear();
    }
}

/**
 * Handles float value checks
 */
const isFloat = (value) => {
    return !isNaN(parseFloat(value));
};

/**
 * MotionValue class to track state and velocity of motion values
 */
class MotionValue {
    constructor(init) {
        this.current = init;
        this.prev = init;
        this.timeDelta = 0;
        this.lastUpdated = 0;
        this.updateSubscribers = new SubscriptionManager();
        this.renderSubscribers = new SubscriptionManager();
        this.canTrackVelocity = isFloat(this.current);
    }

    updateAndNotify(v, render = true) {
        this.prev = this.current;
        this.current = v;

        if (this.prev !== this.current) {
            this.updateSubscribers.notify(this.current);
        }

        if (render) {
            this.renderSubscribers.notify(this.current);
        }

        const { delta, timestamp } = sync.getFrameData();
        if (this.lastUpdated !== timestamp) {
            this.timeDelta = delta;
            this.lastUpdated = timestamp;
            sync_default['default'].postRender(this.scheduleVelocityCheck);
        }
    }

    scheduleVelocityCheck = () => { 
        return sync_default['default'].postRender(this.velocityCheck); 
    };

    velocityCheck = ({timestamp}) => {
        if (timestamp !== this.lastUpdated) {
            this.prev = this.current;
        }
    };

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
            ? popmotion.velocityPerSecond(
                    parseFloat(this.current) - parseFloat(this.prev), 
                    this.timeDelta
                )
            : 0;
    }

    start(animation) {
        this.stop();
        return new Promise((resolve) => {
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

/**
 * Function to create motionValue
 */
function motionValue(init) {
    return new MotionValue(init);
}

// Exported constants and utility functions go below
