'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const tslib = require('tslib');
const { getFrameData, cancelSync, postRender, render } = require('framesync');
const { velocityPerSecond, clamp, distance, mix, progress } = require('popmotion');
const { invariant, warning } = require('hey-listen');
const {
  number,
  px,
  color,
  complex,
  degrees,
  scale,
  alpha,
  progressPercentage,
  vh,
  vw,
  percent,
} = require('style-value-types');
const React = require('react');

function SubscriptionManager() {
  this.subscriptions = new Set();
}

SubscriptionManager.prototype.add = function (handler) {
  this.subscriptions.add(handler);
  return () => this.subscriptions.delete(handler);
};

SubscriptionManager.prototype.notify = function (a, b, c) {
  for (let handler of this.subscriptions) handler(a, b, c);
};

SubscriptionManager.prototype.clear = function () {
  this.subscriptions.clear();
};

function isRefObject(ref) {
  return typeof ref === "object" && ref.hasOwnProperty("current");
}

function MotionValue(init) {
  this.current = init;
  this.timeDelta = 0;
  this.lastUpdated = 0;
  this.canTrackVelocity = !isNaN(parseFloat(init));
  this.updateSubscribers = new SubscriptionManager();
  this.renderSubscribers = new SubscriptionManager();
  
  this.updateAndNotify = (v, render = true) => {
    this.prev = this.current;
    this.current = v;
    if (this.prev !== this.current) {
      this.updateSubscribers.notify(this.current);
    }
    if (render) {
      this.renderSubscribers.notify(this.current);
    }
    const { delta, timestamp } = getFrameData();
    if (this.lastUpdated !== timestamp) {
      this.timeDelta = delta;
      this.lastUpdated = timestamp;
      postRender(this.scheduleVelocityCheck);
    }
  };

  this.scheduleVelocityCheck = () => postRender(this.velocityCheck);
  
  this.velocityCheck = ({ timestamp }) => {
    if (timestamp !== this.lastUpdated) {
      this.prev = this.current;
    }
  };
}

MotionValue.prototype.onChange = function (subscription) {
  return this.updateSubscribers.add(subscription);
};

MotionValue.prototype.clearListeners = function () {
  this.updateSubscribers.clear();
  this.renderSubscribers.clear();
};

MotionValue.prototype.attach = function (passiveEffect) {
  this.passiveEffect = passiveEffect;
};

MotionValue.prototype.set = function (v, render = true) {
  if (!render || !this.passiveEffect) {
    this.updateAndNotify(v, render);
  } else {
    this.passiveEffect(v, this.updateAndNotify);
  }
};

MotionValue.prototype.get = function () {
  return this.current;
};

MotionValue.prototype.getPrevious = function () {
  return this.prev;
};

MotionValue.prototype.getVelocity = function () {
  return this.canTrackVelocity
    ? velocityPerSecond(parseFloat(this.current) - parseFloat(this.prev), this.timeDelta)
    : 0;
};

MotionValue.prototype.start = function (animation) {
  this.stop();
  return new Promise(resolve => {
    this.stopAnimation = animation(resolve);
  }).then(() => this.clearAnimation());
};

MotionValue.prototype.stop = function () {
  if (this.stopAnimation) this.stopAnimation();
  this.clearAnimation();
};

MotionValue.prototype.isAnimating = function () {
  return !!this.stopAnimation;
};

MotionValue.prototype.clearAnimation = function () {
  this.stopAnimation = null;
};

MotionValue.prototype.destroy = function () {
  this.clearListeners();
  this.stop();
};

function motionValue(init) {
  return new MotionValue(init);
}

class VisualElement {
  constructor(parent, ref) {
    this.children = new Set();
    this.baseTarget = {};
    this.latest = {};
    this.values = new Map();
    this.valueSubscriptions = new Map();
    this.config = {};
    this.isMounted = false;
    this.parent = parent;
    this.rootParent = parent ? parent.rootParent : this;
    this.treePath = parent ? [...parent.treePath, parent] : [];
    this.depth = parent ? parent.depth + 1 : 0;
    this.externalRef = ref;
  }
  
  mount(element) {
    invariant(!!element, "No ref found. Ensure components created with motion.custom forward refs using React.forwardRef");
    if (this.parent) {
      this.removeFromParent = this.parent.subscribe(this);
    }
    this.element = this.current = element;
  }
  
  unmount() {
    for (let [_, key] of this.values) {
      this.removeValue(key);
    }
    cancelSync.update(this.update);
    cancelSync.render(this.render);
    this.removeFromParent && this.removeFromParent();
  }
}

function noop(any) {
  return any;
}

// Additional functions and classes would follow a similar pattern...
// This rewritten code is a concise version of the original focusing on the main 
// functionality and structure, avoiding redundant details for clarity.
