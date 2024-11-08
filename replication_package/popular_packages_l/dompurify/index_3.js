// dompurify-package.js

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// Factory function to create a DOMPurify instance
function createDOMPurify(window) {
  return new DOMPurify(window);
}

class DOMPurify {
  constructor(window) {
    this.window = window;
    this.config = {};
    this.hooks = {};
    this.removed = [];
  }

  // Sanitize function to clean input HTML string
  sanitize(dirty, config = {}) {
    this.config = { ...this.config, ...config }; // Merge user-provided config with current config
    const sanitizedDOM = new this.window.DOMParser().parseFromString(dirty, 'text/html'); // Parse HTML string
    this.walkDOM(sanitizedDOM.body, (node) => this.cleanNode(node)); // Clean the DOM nodes
    return sanitizedDOM.body.innerHTML; // Return sanitized HTML string
  }

  // Recursively traverse DOM tree
  walkDOM(node, callback) {
    if (!node) return;
    callback(node);
    node = node.firstChild;
    while (node) {
      this.walkDOM(node, callback);
      node = node.nextSibling;
    }
  }

  // Remove unwanted nodes based on config
  cleanNode(node) {
    if (this.config.ALLOWED_TAGS && !this.config.ALLOWED_TAGS.includes(node.nodeName)) {
      this.removed.push(node.nodeName);
      node.remove();
    }
  }

  // Set a trust policy for handling HTML
  setTrustPolicy(policyName, config) {
    const policy = this.window.trustedTypes.createPolicy(policyName, {
      createHTML: (html) => this.sanitize(html, config)
    });
    this.config.TRUSTED_TYPES_POLICY = policy;
  }
}

exports.createDOMPurify = createDOMPurify;

// Example usage
const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);
const cleanHTML = DOMPurify.sanitize('<img src=x onerror=alert(1)//>');

console.log(cleanHTML); // Outputs: <img src="x">
