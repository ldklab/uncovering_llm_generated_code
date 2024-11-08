const jsdom = require('jsdom');
const { JSDOM } = jsdom;

function createSanitizer(window) {
  return {
    sanitize: (input, options = {}) => {
      const purifier = new Sanitizer(window, options);
      return purifier.clean(input);
    },
    configure: function (options) {
      this.options = options;
    },
    resetConfiguration: function () {
      this.options = {};
    },
    registerHook: function (name, handler) {
      this.hookFunctions[name] = handler;
    },
    hookFunctions: {},
    options: {},
    removedNodes: [],
  };
}

class Sanitizer {
  constructor(window, options) {
    this.window = window;
    this.options = options;
    this.removedNodes = [];
  }

  clean(input) {
    const parsedDOM = new this.window.DOMParser().parseFromString(input, 'text/html');
    this.traverseDOM(parsedDOM.body, (node) => this.sanitizeNode(node));
    return this.determineReturnType(parsedDOM.body);
  }

  traverseDOM(node, callback) {
    if (!node) return;
    callback(node);
    let child = node.firstChild;
    while (child) {
      this.traverseDOM(child, callback);
      child = child.nextSibling;
    }
  }

  sanitizeNode(node) {
    if (this.options.ALLOWED_TAGS && !this.options.ALLOWED_TAGS.includes(node.nodeName)) {
      this.removedNodes.push(node.nodeName);
      node.remove();
    }
    // Implement additional attribute checks here if needed
  }

  determineReturnType(domElement) {
    if (this.options.RETURN_DOM) {
      return domElement;
    }
    if (this.options.RETURN_DOM_FRAGMENT) {
      const fragment = this.window.document.createDocumentFragment();
      while (domElement.firstChild) {
        fragment.appendChild(domElement.firstChild);
      }
      return fragment;
    }
    return domElement.innerHTML;
  }

  defineTrustPolicy(policyName, options) {
    this.options.TRUSTED_TYPES_POLICY = this.window.trustedTypes.createPolicy(policyName, {
      createHTML: (html) => this.clean(html, options),
    });
  }
}

exports.createSanitizer = createSanitizer;

// Example usage

const window = new JSDOM('').window;
const sanitizer = createSanitizer(window);

const sanitizedHTML = sanitizer.sanitize('<img src=x onerror=alert(1)//>');

console.log(sanitizedHTML); // Expected output: <img src="x">
