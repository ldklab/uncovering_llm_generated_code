'use strict';

const { jsx: jsxRuntime } = require('react/jsx-runtime');
const React = require('react');

// Utils
const createNamespaceDefault = (e) => {
  const n = Object.create(null);
  if (e) {
    Object.keys(e).forEach((k) => {
      if (k !== 'default') {
        const d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : { enumerable: true, get: () => e[k] });
      }
    });
  }
  n.default = e;
  return Object.freeze(n);
};

const ReactNamespace = createNamespaceDefault(React);

const warnedMessages = new Set();
const warnOnce = (condition, message, element) => {
  if (condition || warnedMessages.has(message)) return;
  console.warn(message);
  if (element) console.warn(element);
  warnedMessages.add(message);
};

// Proxy handler for motion component factory
const createDOMMotionComponentProxy = (componentFactory) => {
  if (typeof Proxy === "undefined") return componentFactory;

  const componentCache = new Map();
  const deprecatedFactoryFunction = (...args) => {
    if (process.env.NODE_ENV !== "production") {
      warnOnce(false, "motion() is deprecated. Use motion.create() instead.");
    }
    return componentFactory(...args);
  };

  return new Proxy(deprecatedFactoryFunction, {
    get: (_target, key) => {
      if (key === "create") return componentFactory;
      if (!componentCache.has(key)) {
        componentCache.set(key, componentFactory(key));
      }
      return componentCache.get(key);
    },
  });
};

// Animation functionalities
const animationControls = {
  start: (options) => {
    const {
      delay = 0, type = "keyframes", repeat = 0, repeatDelay = 0, useManualTiming,
      onComplete, onUpdate,
    } = options;
    
    return new Promise((resolve) => {
      console.warn(`Starting animation with type ${type}. Change to new system for enhanced features.`);
      setTimeout(() => {
        console.log(`Animation started with delay ${delay}`);
        onUpdate && onUpdate(Math.random());
        onComplete && onComplete();
        resolve('animation finished');
      }, delay);
    });
  },
  variantPriorityOrder: [
    "animate", "whileInView", "whileFocus", "whileHover", "whileTap", "whileDrag", "exit"
  ],
};

// Public configurations
const AnimationGlobalConfig = {
  skipAnimations: false,
  useManualTiming: false,
};

exports.AnimationGlobalConfig = AnimationGlobalConfig;
exports.animationControls = animationControls;
exportsjsxRuntime = jsxRuntime;
exports.ReactNamespace = ReactNamespace;
exports.createDOMMotionComponentProxy = createDOMMotionComponentProxy;
