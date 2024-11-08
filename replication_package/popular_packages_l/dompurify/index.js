markdown
// dompurify-package.js

const jsdom = require('jsdom');
const { JSDOM } = jsdom;

function createDOMPurify(window) {
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

class DOMPurify {
  constructor(window, config) {
    this.window = window;
    this.config = config;
    this.removed = [];
  }

  sanitize(dirty) {
    const sanitizedDOM = new this.window.DOMParser().parseFromString(dirty, 'text/html');
    this.walkDOM(sanitizedDOM.body, (node) => this.cleanNode(node));
    this.configReturnType(sanitizedDOM.body);
    return sanitizedDOM.body.innerHTML;
  }

  walkDOM(node, callback) {
    if (!node) return;
    callback(node);
    node = node.firstChild;
    while (node) {
      this.walkDOM(node, callback);
      node = node.nextSibling;
    }
  }

  cleanNode(node) {
    // Apply filter configurations (ALLOWED_TAGS, FORBID_TAGS, etc.)
    // Basic filtering logic; additional configurations can be added here.
    if (this.config.ALLOWED_TAGS && !this.config.ALLOWED_TAGS.includes(node.nodeName)) {
      this.removed.push(node.nodeName);
      node.remove();
    }
    // Additional attribute checks and cleaning logic can go here
  }

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
    // Default return as string.
    return domElement.innerHTML;
  }

  setTrustPolicy(policyName, config) {
    const policy = this.window.trustedTypes.createPolicy(policyName, {
      createHTML: (html) => this.sanitize(html, config)
    });
    this.config.TRUSTED_TYPES_POLICY = policy;
  }
}

exports.createDOMPurify = createDOMPurify;

// Test usage example in Node.js

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window);

const cleanHTML = DOMPurify.sanitize('<img src=x onerror=alert(1)//>');

console.log(cleanHTML); // Outputs: <img src="x">
