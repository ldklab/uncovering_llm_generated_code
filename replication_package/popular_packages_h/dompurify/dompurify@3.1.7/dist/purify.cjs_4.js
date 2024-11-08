'use strict';

const { entries, setPrototypeOf, isFrozen, getPrototypeOf, getOwnPropertyDescriptor } = Object;
let { freeze, seal, create } = Object;
let { apply, construct } = typeof Reflect !== 'undefined' && Reflect;

if (!freeze) freeze = x => x;
if (!seal) seal = x => x;
if (!apply) apply = (fun, thisValue, args) => fun.apply(thisValue, args);
if (!construct) construct = (Func, args) => new Func(...args);

function unapply(func) {
  return function (thisArg, ...args) {
    return apply(func, thisArg, args);
  };
}

function unconstruct(func) {
  return function (...args) {
    return construct(func, args);
  };
}

function addToSet(set, array, transformCaseFunc = unapply(String.prototype.toLowerCase)) {
  if (setPrototypeOf) setPrototypeOf(set, null);
  array.reverse().forEach(element => {
    if (typeof element === 'string') element = transformCaseFunc(element);
    set[element] = true;
  });
  return set;
}

function cleanArray(array) {
  for (let index = 0; index < array.length; index++) {
    if (!unapply(Object.prototype.hasOwnProperty)(array, index)) array[index] = null;
  }
  return array;
}

function clone(object) {
  const newObject = create(null);
  for (const [property, value] of entries(object)) {
    if (unapply(Object.prototype.hasOwnProperty)(object, property)) {
      newObject[property] = Array.isArray(value) ? cleanArray(value) : clone(value);
    }
  }
  return newObject;
}

function lookupGetter(object, prop) {
  while (object !== null) {
    const desc = getOwnPropertyDescriptor(object, prop);
    if (desc) return desc.get ? unapply(desc.get) : typeof desc.value === 'function' ? unapply(desc.value) : () => null;
    object = getPrototypeOf(object);
  }
  return () => null;
}

function createDOMPurify() {
  let window = arguments[0] ? arguments[0] : typeof window !== 'undefined' ? window : null;
  const DOMPurify = root => createDOMPurify(root);

  DOMPurify.version = '3.1.7';
  DOMPurify.removed = [];
  if (!window || !window.document || window.document.nodeType !== 9) {
    DOMPurify.isSupported = false;
    return DOMPurify;
  }

  const { document } = window;
  const originalDocument = document;
  const currentScript = originalDocument.currentScript;
  const { DocumentFragment, NamedNodeMap = window.NamedNodeMap || window.MozNamedAttrMap } = window;
  const cloneNode = lookupGetter(DocumentFragment.prototype, 'cloneNode');
  const remove = lookupGetter(DocumentFragment.prototype, 'remove');
  const getParentNode = lookupGetter(DocumentFragment.prototype, 'parentNode');

  let config = null;

  DOMPurify.isSupported = typeof entries === 'function' && typeof getParentNode === 'function';

  function _parseConfig(cfg = {}) {
    if (config === cfg) return;
    config = Object.freeze(clone(cfg));
  }

  function _forceRemove(node) {
    arrayPush(DOMPurify.removed, { element: node });
    try {
      getParentNode(node).removeChild(node);
    } catch {
      remove(node);
    }
  }

  function _sanitizeElements(currentNode) {
    if (_isClobbered(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }

    const tagName = transformCaseFunc(currentNode.nodeName);
    if (!_checkValidNamespace(currentNode) || !ALLOWED_TAGS[tagName] || FORBID_TAGS[tagName]) {
      _forceRemove(currentNode);
      return true;
    }

    if (SAFE_FOR_TEMPLATES && currentNode.nodeType === 3) {
      const textNodeValue = currentNode.textContent.replace(/{{[\w\W]*?|[\w\W]*?}}/gm, ' ');
      if (currentNode.textContent !== textNodeValue) {
        DOMPurify.removed.push({ element: currentNode.cloneNode() });
        currentNode.textContent = textNodeValue;
      }
    }
    return false;
  }

  function _sanitizeAttributes(currentNode) {
    const { attributes } = currentNode;
    if (!attributes) return;

    for (let l = attributes.length - 1; l >= 0; --l) {
      const attr = attributes[l];
      const { name, value } = attr;
      const lcName = transformCaseFunc(name);
      let sanitizedValue = name === 'value' ? value : stringTrim(value);

      const lcTag = transformCaseFunc(currentNode.nodeName);
      if (!_isValidAttribute(lcTag, lcName, sanitizedValue)) continue;

      if (SANITIZE_NAMED_PROPS && (lcName === 'id' || lcName === 'name')) {
        sanitizedValue = SANITIZE_NAMED_PROPS_PREFIX + sanitizedValue;
      }

      if (SAFE_FOR_TEMPLATE && regExpTest(/((--!?|])>)|<\/(style|title)/i, sanitizedValue)) continue;

      try {
        currentNode.setAttribute(name, sanitizedValue);
        if (_isClobbered(currentNode)) _forceRemove(currentNode);
        else arrayPop(DOMPurify.removed);
      } catch (_) {}
    }
  }

  DOMPurify.sanitize = function (dirty, cfg = {}) {
    let body = null;

    IS_EMPTY_INPUT = !dirty;
    if (IS_EMPTY_INPUT) dirty = '<!-->';

    if (typeof dirty !== 'string' && !_isNode(dirty)) {
      dirty = dirty.toString();
      if (typeof dirty !== 'string') throw typeErrorCreate('dirty is not a string, aborting');
    }

    if (!DOMPurify.isSupported) return dirty;
    _parseConfig(cfg);
    DOMPurify.removed = [];

    return emptyHTML;
  };

  DOMPurify.setConfig = cfg => { _parseConfig(cfg); };

  DOMPurify.clearConfig = () => { config = null; };

  return DOMPurify;
}

module.exports = createDOMPurify();
//# sourceMappingURL=purify.cjs.js.map
