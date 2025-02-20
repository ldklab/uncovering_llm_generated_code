'use strict';

const { hasOwnProperty, setPrototypeOf, isFrozen, getPrototypeOf, getOwnPropertyDescriptor, freeze, seal, create } = Object;
const apply = Reflect && Reflect.apply || ((fun, thisValue, args) => fun.apply(thisValue, args));
const construct = Reflect && Reflect.construct || ((Func, args) => new (Function.prototype.bind.apply(Func, [null, ...args]))());

const unapply = (func) => (thisArg, ...args) => apply(func, thisArg, args);
const unconstruct = (func) => (...args) => construct(func, args);
const arrayForEach = unapply(Array.prototype.forEach);
const arrayPop = unapply(Array.prototype.pop);
const arrayPush = unapply(Array.prototype.push);

const stringToLowerCase = unapply(String.prototype.toLowerCase);
const stringMatch = unapply(String.prototype.match);
const stringReplace = unapply(String.prototype.replace);
const stringIndexOf = unapply(String.prototype.indexOf);
const stringTrim = unapply(String.prototype.trim);

const regExpTest = unapply(RegExp.prototype.test);
const typeErrorCreate = unconstruct(TypeError);

function addToSet(set, array) {
  setPrototypeOf && setPrototypeOf(set, null);
  array.forEach(element => {
    if (typeof element === 'string') {
      let lcElement = stringToLowerCase(element);
      if (!isFrozen(array)) array[array.indexOf(element)] = lcElement;
      element = lcElement;
    }
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

function lookupGetter(object, prop) {
  while (object !== null) {
    const desc = getOwnPropertyDescriptor(object, prop);
    if (desc) {
      if (desc.get) return unapply(desc.get);
      if (typeof desc.value === 'function') return unapply(desc.value);
    }
    object = getPrototypeOf(object);
  }
  return null;
}

const htmlTags = freeze(['a', 'abbr', 'address', 'area', 'article', 'aside', 'audio', ...]);
const svgTags = freeze(['svg', 'a', 'circle', 'clipPath', 'defs', 'desc', 'ellipse', ...]);
const svgFilters = freeze(['feBlend', 'feColorMatrix', 'feComponentTransfer', 'feComposite', ...]);
const mathMlTags = freeze(['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', ...]);
const text = freeze(['#text']);
const allowedAttributes = freeze(['accept', 'action', 'align', 'alt', 'autocapitalize', 'autocomplete', ...]);
const IS_ALLOWED_URI = seal(/^(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$)/i);

const createDOMPurify = (window = typeof window === 'undefined' ? null : window) => {
  const DOMPurify = (root) => createDOMPurify(root);
  DOMPurify.version = '2.2.6';
  DOMPurify.removed = [];

  if (!window || !window.document || window.document.nodeType !== 9) return DOMPurify;

  const { document } = window;
  const { implementation, createNodeIterator } = document;
  const trustedTypes = window.trustedTypes ?? null;
  const ElementPrototype = Element.prototype;

  const hooks = {};
  let CONFIG = null;

  const _parseConfig = (cfg) => {
    CONFIG = clone(cfg || {});
  };

  const _checkValidNamespace = (element) => {
    const tagName = stringToLowerCase(element.tagName);
    const parent = element.parentNode ?? { namespaceURI: 'http://www.w3.org/1999/xhtml', tagName: 'template' };
    if (element.namespaceURI === 'http://www.w3.org/2000/svg') return tagName === 'svg';
    if (element.namespaceURI === 'http://www.w3.org/1998/Math/MathML') return tagName === 'math';
    return true;
  };

  const _forceRemove = (node) => {
    arrayPush(DOMPurify.removed, { element: node });
    node.parentNode?.removeChild(node);
  };

  const _removeAttribute = (name, node) => {
    arrayPush(DOMPurify.removed, { attribute: node.getAttributeNode(name), from: node });
    node.removeAttribute(name);
  };

  const _initDocument = (dirty) => {
    let leadingWhitespace = dirty.match(/^[\r\n\t ]+/)?.[0];
    const doc = new DOMParser().parseFromString(trustedTypes ? trustedTypes.createHTML(dirty) : dirty, 'text/html') ?? implementation.createHTMLDocument('');
    if (leadingWhitespace) doc.body.insertBefore(document.createTextNode(leadingWhitespace), doc.body.firstChild);
    return doc.getElementsByTagName('body')[0];
  };

  const _createIterator = (root) => createNodeIterator(root.ownerDocument || root, root, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT | NodeFilter.SHOW_TEXT, () => NodeFilter.FILTER_ACCEPT);

  const _sanitizeElements = (currentNode) => {
    _executeHook('beforeSanitizeElements', currentNode, null);
    if (_isClobbered(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }
    const tagName = stringToLowerCase(currentNode.nodeName);
    _executeHook('uponSanitizeElement', currentNode, { tagName, allowedTags: htmlTags });
    _executeHook('afterSanitizeElements', currentNode, null);
    return false;
  };

  const _isValidAttribute = (lcTag, lcName, value) => {
    if (ALLOWED_ATTR[lcName]) {
      if ((lcName === 'src' || lcName === 'xlink:href' || lcName === 'href') && lcTag !== 'script' && value.startsWith('data:')) return true;
      if (ALLOWED_URI_REGEXP.test(value.replace(ATTR_WHITESPACE, ''))) return true;
    }
    return false;
  };

  const _sanitizeAttributes = (currentNode) => {
    _executeHook('beforeSanitizeAttributes', currentNode, null);
    const attributes = currentNode.attributes;
    if (!attributes) return;

    let hookEvent = { attrName: '', attrValue: '', keepAttr: true, allowedAttributes: ALLOWED_ATTR };
    arrayForEach(attributes, (attr) => {
      let { name, value } = attr;
      const lcName = stringToLowerCase(name);
      value = stringTrim(value);
      hookEvent = { ...hookEvent, attrName: lcName, attrValue: value, keepAttr: true, forceKeepAttr: undefined };
      _executeHook('uponSanitizeAttribute', currentNode, hookEvent);
      if (!hookEvent.keepAttr) return _removeAttribute(name, currentNode);
      if (!value || !_isValidAttribute(currentNode.nodeName.toLowerCase(), lcName, value)) return _removeAttribute(name, currentNode);
      currentNode.setAttribute(name, value);
      arrayPop(DOMPurify.removed);
    });
    _executeHook('afterSanitizeAttributes', currentNode, null);
  };

  const _executeHook = (entryPoint, currentNode, data) => {
    if (!hooks[entryPoint]) return;
    arrayForEach(hooks[entryPoint], (hook) => hook.call(DOMPurify, currentNode, data, CONFIG));
  };

  const _isClobbered = (elm) => !(elm instanceof Element) || !(elm.attributes instanceof NamedNodeMap);

  DOMPurify.sanitize = (dirty, cfg) => {
    if (!dirty) dirty = '<!-->';
    if (!CONFIG) _parseConfig(cfg);
    DOMPurify.removed = [];
    let body = dirty instanceof Node ? dirty : _initDocument(dirty);
    let nodeIterator = _createIterator(body);
    let currentNode;

    while (currentNode = nodeIterator.nextNode()) {
      if (currentNode === oldNode || _sanitizeElements(currentNode)) continue;
      _sanitizeAttributes(currentNode);
      oldNode = currentNode;
    }

    return domString(body);
  };

  const domString = (body) => {
    let serializedHTML = !WHOLE_DOCUMENT ? body.innerHTML : body.outerHTML;
    return trustedTypes && RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
  };

  DOMPurify.setConfig = (cfg) => { _parseConfig(cfg); SET_CONFIG = true; };
  DOMPurify.clearConfig = () => { CONFIG = null; SET_CONFIG = false };
  DOMPurify.isValidAttribute = (tag, attr, value) => _isValidAttribute(stringToLowerCase(tag), stringToLowerCase(attr), value);
  DOMPurify.addHook = (entryPoint, hookFunction) => { hooks[entryPoint] = hooks[entryPoint] || []; arrayPush(hooks[entryPoint], hookFunction) };
  DOMPurify.removeHook = (entryPoint) => { hooks[entryPoint] && arrayPop(hooks[entryPoint]) };
  DOMPurify.removeHooks = (entryPoint) => { hooks[entryPoint] = [] };
  DOMPurify.removeAllHooks = () => { for (const key in hooks) hooks[key] = [] };

  return DOMPurify;
};

const purify = createDOMPurify();
module.exports = purify;
