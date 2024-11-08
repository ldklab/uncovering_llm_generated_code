'use strict';

const {
  entries,
  setPrototypeOf,
  isFrozen,
  getPrototypeOf,
  getOwnPropertyDescriptor,
  freeze,
  seal,
  create,
  apply,
  construct
} = Object; 

const unapply = (func) => function (thisArg, ...args) {
  return apply(func, thisArg, args);
};

const unconstruct = (func) => function (...args) {
  return construct(func, args);
};

const arrayForEach = unapply(Array.prototype.forEach);
const arrayPop = unapply(Array.prototype.pop);
const arrayPush = unapply(Array.prototype.push);
const stringReplace = unapply(String.prototype.replace);
const regExpTest = unapply(RegExp.prototype.test);
const objectHasOwnProperty = unapply(Object.prototype.hasOwnProperty);

let CONFIG;
let ALLOWED_TAGS;
const EXPRESSIONS = {
  MUSTACHE_EXPR: seal(/\{\{[\w\W]*|[\w\W]*\}\}/gm),
  ERB_EXPR: seal(/<%[\w\W]*|[\w\W]*%>/gm),
  TMPLIT_EXPR: seal(/\${[\w\W]*}/gm),
};

function createDOMPurify(window) {
  let DOMPurify = root => createDOMPurify(root);
  const hooks = {};
  let trustedTypesPolicy;
  const DEFAULT_ALLOWED_TAGS = freeze(['a', 'abbr', 'address', 'article', 'section', 'div', 'h1', 'span', 'p']);

  const _parseConfig = (cfg = {}) => {
    CONFIG = freeze(cfg);
    ALLOWED_TAGS = objectHasOwnProperty(cfg, 'ALLOWED_TAGS') ? addToSet({}, cfg.ALLOWED_TAGS) : DEFAULT_ALLOWED_TAGS;
  };

  const _isValidAttribute = (lcTag, lcName, value) => {
    return ALLOWED_TAGS[lcTag] && value && !regExpTest(EXPRESSIONS.MUSTACHE_EXPR, value);
  };

  const _sanitizeElements = (element) => {
    if (!ALLOWED_TAGS[element.tagName.toLowerCase()]) {
      element.remove();
      return true;
    }
    return false;
  };

  const _sanitizeAttributes = (node) => {
    if (!node.attributes) return;
    let l = node.attributes.length;
    while (l--) {
      const attr = node.attributes[l];
      if (!_isValidAttribute(node.nodeName.toLowerCase(), attr.name.toLowerCase(), attr.value)) {
        node.removeAttribute(attr.name);
      }
    }
  };

  DOMPurify.sanitize = (dirty, cfg = {}) => {
    if (!dirty) return '';
    _parseConfig(cfg);
    const parser = new DOMParser();
    const doc = parser.parseFromString(dirty, 'text/html');
    const body = doc.body;
    const walker = doc.createTreeWalker(body, NodeFilter.SHOW_ELEMENT, null, false);
    let currentNode;
    while (currentNode = walker.nextNode()) {
      if (_sanitizeElements(currentNode)) continue;
      _sanitizeAttributes(currentNode);
    }
    return body.innerHTML;
  };

  DOMPurify.setConfig = (cfg = {}) => _parseConfig(cfg);
  DOMPurify.isValidAttribute = _isValidAttribute;

  return DOMPurify;
}

module.exports = createDOMPurify;
