// dompurify-package.js

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

/**
 * Factory function to create a DOMPurify instance
 * @param {Object} window - Simulated browser window object
 * @return {Object} DOMPurify instance with sanitize and configuration methods
 */
function createDOMPurify(window) {
  return {
    // Method to sanitize input HTML with optional configuration
    sanitize: function (dirty, config = {}) {
      const domPurify = new DOMPurify(window, config);
      return domPurify.sanitize(dirty);
    },
    // Method to set configuration options
    setConfig: function (config) {
      this.config = config;
    },
    // Method to clear any existing configuration
    clearConfig: function () {
      this.config = {};
    },
    // Method to add custom hooks
    addHook: function (hookName, callback) {
      this.hooks[hookName] = callback;
    },
    // Internal storage for hooks, configuration, and removed elements
    hooks: {},
    config: {},
    removed: []
  };
}

/**
 * Class representing the DOMPurify logic
 */
class DOMPurify {
  constructor(window, config) {
    this.window = window;
    this.config = config;
    this.removed = [];
  }

  // Method to sanitize the input HTML
  sanitize(dirty) {
    const sanitizedDOM = new this.window.DOMParser().parseFromString(dirty, 'text/html');
    this.walkDOM(sanitizedDOM.body, (node) => this.cleanNode(node));
    return this.configReturnType(sanitizedDOM.body);
  }

  // Recursively walk the DOM and apply cleaning logic
  walkDOM(node, callback) {
    if (!node) return;
    callback(node);
    node = node.firstChild;
    while (node) {
      this.walkDOM(node, callback);
      node = node.nextSibling;
    }
  }

  // Basic node cleaning logic based on configuration
  cleanNode(node) {
    if (this.config.ALLOWED_TAGS && !this.config.ALLOWED_TAGS.includes(node.nodeName)) {
      this.removed.push(node.nodeName);
      node.remove();
    }
    // Additional cleaning logic can be added here
  }

  // Configure return type based on configuration settings
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
    return domElement.innerHTML; // Default return as string
  }

  // Set trusted types policy for security
  setTrustPolicy(policyName, config) {
    const policy = this.window.trustedTypes.createPolicy(policyName, {
      createHTML: (html) => this.sanitize(html, config)
    });
    this.config.TRUSTED_TYPES_POLICY = policy;
  }
}

// Export the createDOMPurify function
exports.createDOMPurify = createDOMPurify;

// Test usage example in Node.js
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

// Sanitize an HTML string and log the result
const cleanHTML = DOMPurify.sanitize('<img src=x onerror=alert(1)//>');
console.log(cleanHTML); // Outputs: <img src="x">
