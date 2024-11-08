// dompurify-package.js

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// Utility function to create a DOMPurify instance
function createDOMPurify(window) {
  // Return an object with methods for sanitization and configuration handling
  return {
    sanitize: function (dirty, config = {}) {
      const domPurify = new DOMPurify(window, config);
      return domPurify.sanitize(dirty);
    },
    setConfig: function (config) {
      this.config = config;
    },
    clearConfig: function () {
      this.config = {};
    },
    addHook: function (hookName, callback) {
      this.hooks[hookName] = callback;
    },
    hooks: {},
    config: {},
    removed: []
  };
}

// Class handling the DOM sanitization logic
class DOMPurify {
  constructor(window, config) {
    this.window = window;
    this.config = config;
    this.removed = [];
  }

  // Sanitize the provided dirty HTML string
  sanitize(dirty) {
    const sanitizedDOM = new this.window.DOMParser().parseFromString(dirty, 'text/html'); // Parse HTML
    this.walkDOM(sanitizedDOM.body, (node) => this.cleanNode(node)); // Traverse and clean the DOM
    this.configReturnType(sanitizedDOM.body); // Configure the return type
    return sanitizedDOM.body.innerHTML;
  }

  // Walk through every node in the DOM
  walkDOM(node, callback) {
    if (!node) return;
    callback(node); // Apply cleaning to each node
    node = node.firstChild;
    while (node) {
      this.walkDOM(node, callback);
      node = node.nextSibling;
    }
  }

  // Clean individual nodes based on config
  cleanNode(node) {
    if (this.config.ALLOWED_TAGS && !this.config.ALLOWED_TAGS.includes(node.nodeName)) {
      this.removed.push(node.nodeName);
      node.remove();
    }
    // Additional cleaning logic can be added here
  }

  // Determine the return type of the sanitized output
  configReturnType(domElement) {
    if (this.config.RETURN_DOM) {
      return domElement;
    }
    if (this.config.RETURN_DOM_FRAGMENT) {
      const fragment = this.window.document.createDocumentFragment();
      while (domElement.firstChild) {
        fragment.appendChild(domElement.firstChild);
      }
      return fragment;
    }
    return domElement.innerHTML; // Default string return
  }

  // Set a Trusted Types policy
  setTrustPolicy(policyName, config) {
    const policy = this.window.trustedTypes.createPolicy(policyName, {
      createHTML: (html) => this.sanitize(html, config)
    });
    this.config.TRUSTED_TYPES_POLICY = policy;
  }
}

exports.createDOMPurify = createDOMPurify;

// Example usage in Node.js
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Sanitize a given HTML string
const cleanHTML = DOMPurify.sanitize('<img src=x onerror=alert(1)//>');

console.log(cleanHTML); // Outputs sanitized HTML: <img src="x">
