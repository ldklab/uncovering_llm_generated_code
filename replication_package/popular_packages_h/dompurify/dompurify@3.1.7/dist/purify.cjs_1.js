'use strict';

const {
  entries,
  setPrototypeOf,
  isFrozen,
  getPrototypeOf,
  getOwnPropertyDescriptor,
} = Object;
let { freeze, seal, create } = Object; // Initialize Object methods
let { apply, construct } = typeof Reflect !== 'undefined' && Reflect; // Reflect methods

// Fallbacks if certain methods aren't available
if (!freeze) freeze = function(x) { return x; };
if (!seal) seal = function(x) { return x; };
if (!apply) apply = function(fun, thisValue, args) { return fun.apply(thisValue, args); };
if (!construct) construct = function(Func, args) { return new Func(...args); };

// Utility functions for safe function and constructor handling
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

// Public-facing utility functions
function addToSet(set, array, transformCaseFunc = string => string.toLowerCase()) {
  if (setPrototypeOf) {
    setPrototypeOf(set, null); // Unset the prototype
  }
  array.forEach(element => {
    if (typeof element === 'string') {
      const lcElement = transformCaseFunc(element);
      if (lcElement !== element && !isFrozen(array)) {
        const index = array.indexOf(element);
        if (index !== -1) array[index] = lcElement;
      }
      element = lcElement;
    }
    set[element] = true;
  });
  return set;
}

function cleanArray(array) {
  array.forEach((_, index) => {
    if (!Object.prototype.hasOwnProperty.call(array, index)) {
      array[index] = null;
    }
  });
  return array;
}

function clone(object) {
  const newObject = create(null);
  entries(object).forEach(([property, value]) => {
    if (objectHasOwnProperty(object, property)) {
      newObject[property] = Array.isArray(value) ? cleanArray(value)
                      : value && typeof value === 'object' && value.constructor === Object
                      ? clone(value)
                      : value;
    }
  });
  return newObject;
}

function lookupGetter(object, prop) {
  while (object !== null) {
    const desc = getOwnPropertyDescriptor(object, prop);
    if (desc) {
      return desc.get ? unapply(desc.get) : typeof desc.value === 'function' ? unapply(desc.value) : () => null;
    }
    object = getPrototypeOf(object);
  }
  return () => null;
}

// Define initial allowed and unsupported element and attribute lists
const allowedElements = freeze(['a', 'abbr', 'acronym', 'address', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'big', 'blink', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'center', 'cite', 'code', 'col', 'colgroup', 'content', 'data', 'datalist', 'dd', 'decorator', 'del', 'details', 'dfn', 'dialog', 'dir', 'div', 'dl', 'dt', 'element', 'em', 'fieldset', 'figcaption', 'figure', 'font', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'marquee', 'menu', 'menuitem', 'meter', 'nav', 'nobr', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'select', 'shadow', 'small', 'source', 'spacer', 'span', 'strike', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'tt', 'u', 'ul', 'var', 'video', 'wbr']);
const allowedAttributes = freeze(['accept', 'action', 'align', 'alt', 'autocapitalize', 'autocomplete', 'autopictureinpicture', 'autoplay', 'background','bgcolor', 'border', 'capture', 'cellpadding', 'cellspacing', 'checked', 'cite', 'class', 'clear', 'color', 'cols', 'colspan', 'controls', 'controlslist', 'coords', 'crossorigin', 'datetime', 'decoding', 'default', 'dir', 'disabled', 'download', 'draggable', 'enctype', 'enterkeyhint', 'face', 'for', 'headers', 'height', 'hidden', 'high', 'href', 'hreflang', 'id', 'inputmode', 'integrity', 'ismap', 'kind', 'label', 'lang', 'list', 'loading', 'loop', 'low', 'max', 'maxlength', 'media', 'method','min', 'minlength', 'multiple', 'muted', 'name', 'nonce', 'noshade', 'novalidate', 'nowrap', 'open', 'optimum', 'pattern', 'placeholder', 'playsinline', 'popover', 'popovertarget', 'popovertargetaction', 'poster', 'preload', 'pubdate', 'radiogroup', 'readonly', 'rel', 'required', 'rev', 'reversed', 'role', 'rows', 'rowspan', 'scope', 'selected', 'shape', 'size', 'sizes', 'span', 'srclang', 'start', 'src', 'srcset', 'step', 'style', 'summary', 'tabindex', 'title', 'translate', 'type', 'usemap', 'valign', 'value', 'width', 'wrap', 'xmlns', 'slot']);

// Regular expressions to identify potential security risks in attributes
const mustacheExpr = seal(/\{\{[\w\W]*|[\w\W]*\}\}/gm);
const erbExpr = seal(/<%[\w\W]*|[\w\W]*%>/gm);
const tmplItExpr = seal(/\${[\w\W]*}/gm);
const dataAttr = seal(/^data-[\-\w.\u00B7-\uFFFF]/);
const ariaAttr = seal(/^aria-[\-\w]+$/);
const isAllowedURI = seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i);
const isScriptOrData = seal(/^(?:\w+script|data):/i);

// Function to sanitize HTML content
function createDOMPurify() {
  const DOMPurify = root => createDOMPurify(root);

  DOMPurify.version = '3.1.7';
  DOMPurify.removed = [];
  DOMPurify.isSupported = typeof entries === 'function' && typeof getPrototypeOf === 'function';

  DOMPurify.sanitize = function (dirty, cfg = {}) {
    if (!DOMPurify.isSupported) return dirty; // Return input if not supported

    let body = null;
    if (typeof dirty === 'string') {
      body = _initDocument(dirty);
    } else {
      // Additional handling...
    }
    // Further processing....
    return body ? body.innerHTML : '';
  };

  return DOMPurify;
}

const purify = createDOMPurify();
module.exports = purify;
