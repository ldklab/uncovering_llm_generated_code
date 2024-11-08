'use strict';

const {
  hasOwnProperty, setPrototypeOf, isFrozen, getPrototypeOf, 
  getOwnPropertyDescriptor, freeze, seal, create
} = Object;

const {
  apply, construct
} = typeof Reflect !== 'undefined' ? Reflect : {
  apply: (fun, thisValue, args) => fun.apply(thisValue, args),
  construct: (Func, args) => new (Function.prototype.bind.apply(Func, [null].concat([...args])))()
};

const unapply = (func) => (thisArg, ...args) => apply(func, thisArg, args);
const unconstruct = (func) => (...args) => construct(func, args);

const arrayForEach = unapply(Array.prototype.forEach);
const arrayPop = unapply(Array.prototype.pop);
const arrayPush = unapply(Array.prototype.push);

const stringToLowerCase = unapply(String.prototype.toLowerCase);
const stringReplace = unapply(String.prototype.replace);
const stringIndexOf = unapply(String.prototype.indexOf);
const stringTrim = unapply(String.prototype.trim);

const regExpTest = unapply(RegExp.prototype.test);
const typeErrorCreate = unconstruct(TypeError);

function addToSet(set, array) {
  if (setPrototypeOf) {
    setPrototypeOf(set, null);
  }
  array.forEach(item => {
    const element = typeof item === 'string' ? stringToLowerCase(item) : item;
    set[element] = true;
  });
  return set;
}

function clone(object) {
  const newObject = create(null);
  for (const property in object) {
    if (apply(hasOwnProperty, object, [property])) {
      newObject[property] = object[property];
    }
  }
  return newObject;
}

function createDOMPurify(window = (typeof window === 'undefined' ? null : window)) {
  const DOMPurify = (root) => createDOMPurify(root);

  DOMPurify.version = '2.2.6';
  DOMPurify.removed = [];

  if (!window || !window.document || window.document.nodeType !== 9) {
    DOMPurify.isSupported = false;
    return DOMPurify;
  }

  const originalDocument = window.document;
  const {
    document, HTMLTemplateElement, Node, NamedNodeMap, DOMParser, trustedTypes
  } = window;

  const ElementPrototype = Element.prototype;
  const cloneNode = lookupGetter(ElementPrototype, 'cloneNode');
  const getNextSibling = lookupGetter(ElementPrototype, 'nextSibling');
  const getChildNodes = lookupGetter(ElementPrototype, 'childNodes');
  const getParentNode = lookupGetter(ElementPrototype, 'parentNode');

  let trustedTypesPolicy = null;
  if (typeof trustedTypes === 'object' && typeof trustedTypes.createPolicy === 'function') {
    trustedTypesPolicy = trustedTypes.createPolicy('dompurify', {
      createHTML: (input) => input
    });
  }

  const _document = document;
  const { implementation, createNodeIterator, getElementsByTagName, createDocumentFragment } = _document;
  const importNode = originalDocument.importNode;

  const documentMode = typeof document.documentMode === 'object' ? document.documentMode : {};
  const hooks = {};
  DOMPurify.isSupported = typeof implementation.createHTMLDocument !== 'undefined' && documentMode !== 9;

  const ALLOWED_TAGS = addToSet({}, ['div', 'span', 'a']); // Example tags
  const ALLOWED_ATTR = addToSet({}, ['href', 'title', 'id']); // Example attributes

  function _sanitizeElements(currentNode) {
    const tagName = stringToLowerCase(currentNode.nodeName);
    if (!ALLOWED_TAGS[tagName]) {
      _forceRemove(currentNode);
      return true;
    }
    return false;
  }

  function _removeAttribute(name, node) {
    arrayPush(DOMPurify.removed, {
      attribute: node.getAttributeNode(name),
      from: node
    });
    node.removeAttribute(name);
  }

  function _forceRemove(node) {
    arrayPush(DOMPurify.removed, { element: node });
    try {
      node.parentNode.removeChild(node);
    } catch (_) {
      try {
        node.outerHTML = '';
      } catch (_) {
        node.remove();
      }
    }
  }

  function _sanitizeAttributes(currentNode) {
    const attributes = currentNode.attributes;
    if (!attributes) return;

    for (let attr of attributes) {
      const { name, value } = attr;
      const lcName = stringToLowerCase(name);
      if (!ALLOWED_ATTR[lcName]) {
        _removeAttribute(name, currentNode);
      }
    }
  }

  DOMPurify.sanitize = (dirty, cfg) => {
    let body;
    if (typeof dirty === 'string') {
      body = _document;
    } else {
      body = document.createElement('div');
      const importedNode = body.ownerDocument.importNode(dirty, true);
      body.appendChild(importedNode);
    }

    const nodeIterator = createNodeIterator.call(body.ownerDocument, body, NodeFilter.SHOW_ELEMENT, null, false);
    let currentNode;
    while (currentNode = nodeIterator.nextNode()) {
      if (_sanitizeElements(currentNode)) continue;
      _sanitizeAttributes(currentNode);
    }

    return trustedTypesPolicy ? trustedTypesPolicy.createHTML(body.innerHTML) : body.innerHTML;
  };

  DOMPurify.addHook = (entryPoint, hookFunction) => {
    hooks[entryPoint] = hooks[entryPoint] || [];
    arrayPush(hooks[entryPoint], hookFunction);
  };

  return DOMPurify;
}

const purify = createDOMPurify();

module.exports = purify;
