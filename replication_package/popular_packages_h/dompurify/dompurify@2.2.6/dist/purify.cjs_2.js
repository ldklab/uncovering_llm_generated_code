'use strict';

function toConsumableArray(arr) {
  return Array.isArray(arr) ? [...arr] : Array.from(arr);
}

const {
  hasOwnProperty,
  setPrototypeOf,
  isFrozen,
  getPrototypeOf,
  getOwnPropertyDescriptor,
  freeze = x => x,
  seal = x => x,
  create,
} = Object;

let { apply, construct } = typeof Reflect !== 'undefined' && Reflect || {};

apply = apply || function (fun, thisValue, args) {
  return fun.apply(thisValue, args);
};

construct = construct || function (Func, args) {
  return new (Function.prototype.bind.apply(Func, [null, ...toConsumableArray(args)]))();
};

function unapply(func) {
  return function(thisArg, ...args) {
    return apply(func, thisArg, args);
  };
}

function unconstruct(func) {
  return function(...args) {
    return construct(func, args);
  };
}

function addToSet(set, array) {
  setPrototypeOf(set, null);
  let l = array.length;
  while (l--) {
    let element = array[l];
    if (typeof element === 'string') {
      const lcElement = element.toLowerCase();
      if (lcElement !== element && !isFrozen(array)) {
        array[l] = lcElement;
        element = lcElement;
      }
    }
    set[element] = true;
  }
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

const html = freeze(['a', 'abbr', 'area', 'article', 'aside', 'audio', 'b', 'bdi', 'bdo', 'blockquote', 'body', 'br', 'button', 'canvas', 'caption', 'cite', 'code', 'col', 'colgroup', 'data', 'datalist', 'dd', 'del', 'details', 'dfn', 'dialog', 'div', 'dl', 'dt', 'em', 'fieldset', 'figcaption', 'figure', 'footer', 'form', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'head', 'header', 'hgroup', 'hr', 'html', 'i', 'img', 'input', 'ins', 'kbd', 'label', 'legend', 'li', 'main', 'map', 'mark', 'menu', 'meter', 'nav', 'ol', 'optgroup', 'option', 'output', 'p', 'picture', 'pre', 'progress', 'q', 'rp', 'rt', 'ruby', 's', 'samp', 'section', 'select', 'small', 'source', 'span', 'strong', 'style', 'sub', 'summary', 'sup', 'table', 'tbody', 'td', 'template', 'textarea', 'tfoot', 'th', 'thead', 'time', 'tr', 'track', 'u', 'ul', 'var', 'video', 'wbr']);

const svg = freeze(['svg', 'a', 'altglyph', 'altglyphdef', 'altglyphitem', 'animatecolor', 'animatemotion', 'animatetransform', 'circle', 'clippath', 'defs', 'desc', 'ellipse', 'filter', 'font', 'g', 'glyph', 'glyphref', 'hkern', 'line', 'lineargradient', 'marker', 'mask', 'metadata', 'mpath', 'path', 'pattern', 'polygon', 'polyline', 'radialgradient', 'rect', 'stop', 'switch', 'symbol', 'text', 'textpath', 'title', 'tref', 'tspan', 'view']);

const mathMl = freeze(['math', 'menclose', 'merror', 'mfenced', 'mfrac', 'mglyph', 'mi', 'mlabeledtr', 'mmultiscripts', 'mn', 'mo', 'mover', 'mpadded', 'mphantom', 'mrow', 'ms', 'mspace', 'msqrt', 'mstyle', 'msub', 'msup', 'msubsup', 'mtable', 'mtd', 'mtext', 'mtr', 'munder', 'munderover']);

const text = freeze(['#text']);

const htmlAttrs = freeze(['accept', 'action', 'align', 'alt', 'autocomplete', 'checked', 'class', 'cols', 'colspan', 'controls', 'coords', 'data', 'datetime', 'dir', 'disabled', 'download', 'draggable', 'enctype', 'for', 'headers', 'height', 'href', 'hreflang', 'id', 'inputmode', 'lang', 'list', 'loop', 'method', 'multiple', 'name', 'open', 'pattern', 'placeholder', 'poster', 'rel', 'required', 'role', 'rows', 'rowspan', 'selected', 'shape', 'size', 'sizes', 'span', 'src', 'srcset', 'step', 'style', 'tabindex', 'title', 'type', 'usemap', 'value', 'width']);

const svgAttrs = freeze(['accent-height', 'alignment-baseline', 'ascent', 'attributename', 'bias', 'clip', 'clip-path', 'clip-rule', 'color', 'color-interpolation', 'color-rendering', 'cx', 'cy', 'd', 'direction', 'display', 'dx', 'dy', 'fill', 'fill-opacity', 'fill-rule', 'filter', 'font-family', 'font-size', 'font-style', 'font-weight', 'height', 'href', 'id', 'in', 'in2', 'k1', 'k2', 'k3', 'k4', 'kerning', 'lengthadjust', 'lighting-color', 'local', 'marker-end', 'marker-mid', 'marker-start', 'mask', 'markerheight', 'markerunits', 'markerwidth', 'mode', 'name', 'numoctaves', 'offset', 'opacity', 'operator', 'order', 'orient', 'orientation', 'origin', 'overflow', 'pathlength', 'patterncontentunits', 'patterntransform', 'patternunits', 'points', 'preservealpha', 'preserveaspectratio', 'primitiveunits', 'r', 'refx', 'refy', 'repeatcount', 'repeatdur', 'restart', 'result', 'rotate', 'rx', 'ry', 'scale', 'seed', 'shaperendering', 'specularconstant', 'specularexponent', 'spreadmethod', 'startoffset', 'stddeviation', 'stroke', 'strokedasharray', 'strokedashoffset', 'strokelinecap', 'strokelinejoin', 'strokemiterlimit', 'strokeopacity', 'strokewidth', 'style', 'surfacescale', 'systemlanguage', 'tabindex', 'targetx', 'targety', 'textanchor', 'textdecoration', 'textlength', 'type', 'u1', 'u2', 'unicode', 'values', 'viewbox', 'visibility', 'version', 'vx', 'wx', 'x', 'x1', 'x2', 'xchannelselector', 'xml:id', 'xmlns', 'xmlns:xlink', 'y', 'y1', 'y2', 'ychannelselector', 'zoomandpan']);

const mathMlAttrs = freeze(['accent', 'accentunder', 'align', 'bevelled', 'close', 'columnsalign', 'columnlines', 'columnspan', 'depth', 'dir', 'display', 'displaystyle', 'encoding', 'fence', 'frame', 'height', 'href', 'id', 'largeop', 'length', 'linethickness', 'lspace', 'mathbackground', 'mathcolor', 'mathsize', 'mathvariant', 'maxsize', 'minsize', 'movablelimits', 'notation', 'numalign', 'rowalign', 'rowspan', 'selection', 'separator', 'stretchy', 'subscriptshift', 'supscriptshift', 'symmetric', 'voffset', 'width', 'xmlns']);

const xmlAttrs = freeze(['xlink:href', 'xml:id', 'xlink:title', 'xml:space', 'xmlns:xlink']);

const regexPatterns = {
  mustacheExpr: seal(/\{\{[\s\S]*|[\s\S]*\}\}/gm),
  erbExpr: seal(/<%[\s\S]*|[\s\S]*%>/gm),
  dataAttr: seal(/^data-[\-\w.\u00B7-\uFFFF]/),
  ariaAttr: seal(/^aria-[\-\w]+$/),
  allowedUri: seal(/^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i),
  scriptOrData: seal(/^(?:\w+script|data):/i),
};

function createDOMPurify(window = typeof window !== 'undefined' ? window : globalThis) {
  let DOMPurify = function DOMPurify(root) {
    return createDOMPurify(root);
  };

  DOMPurify.version = '2.2.6';
  DOMPurify.removed = [];

  if (!window || !window.document || window.document.nodeType !== 9) {
    DOMPurify.isSupported = false;
    return DOMPurify;
  }

  const originalDocument = window.document;
  const { document, DocumentFragment, HTMLTemplateElement, Node, Element, NodeFilter, NamedNodeMap = window.NamedNodeMap || window.MozNamedAttrMap, Text, Comment, DOMParser, trustedTypes } = window;
  const ElementPrototype = Element.prototype;

  let cloneNode = lookupGetter(ElementPrototype, 'cloneNode');
  let getNextSibling = lookupGetter(ElementPrototype, 'nextSibling');
  let getChildNodes = lookupGetter(ElementPrototype, 'childNodes');
  let getParentNode = lookupGetter(ElementPrototype, 'parentNode');

  const template = document.createElement('template');
  let trustedTypesPolicy = trustedTypes && trustedTypes.createPolicy('dompurify', { createHTML: html => html }) || null;
  const emptyHTML = trustedTypesPolicy ? trustedTypesPolicy.createHTML('') : '';
  let doc = document;

  if (typeof HTMLTemplateElement === 'function' && template.content && template.content.ownerDocument) {
    doc = template.content.ownerDocument;
  }

  const { implementation, createNodeIterator, getElementsByTagName, createDocumentFragment } = doc;
  const { importNode } = originalDocument;
  let documentMode = {};
  try {
    documentMode = clone(document).documentMode ? document.documentMode : {};
  } catch (_) { }

  if (typeof implementation === 'undefined' || typeof implementation.createHTMLDocument === 'undefined' || documentMode === 9) {
    DOMPurify.isSupported = false;
    return DOMPurify;
  }

  DOMPurify.isSupported = true;

  let hooks = {};

  const globalConfig = {
    ALLOWED_TAGS: null,
    DEFAULT_ALLOWED_TAGS: addToSet({}, [...html, ...svg, ...mathMl, ...text]),
    ALLOWED_ATTR: null,
    DEFAULT_ALLOWED_ATTR: addToSet({}, [...htmlAttrs, ...svgAttrs, ...mathMlAttrs, ...xmlAttrs]),
    FORBID_TAGS: null,
    FORBID_ATTR: null,
    ALLOW_ARIA_ATTR: true,
    ALLOW_DATA_ATTR: true,
    ALLOW_UNKNOWN_PROTOCOLS: false,
    SAFE_FOR_TEMPLATES: false,
    WHOLE_DOCUMENT: false,
    SET_CONFIG: false,
    FORCE_BODY: false,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_DOM_IMPORT: true,
    RETURN_TRUSTED_TYPE: false,
    SANITIZE_DOM: true,
    KEEP_CONTENT: true,
    IN_PLACE: false,
    USE_PROFILES: {},
    FORBID_CONTENTS: addToSet({}, ['annotation-xml', 'audio', 'colgroup', 'foreignobject', 'iframe', 'math', 'mi', 'mn', 'mo', 'ms', 'mtext', 'noembed', 'noframes', 'noscript', 'plaintext', 'script', 'style', 'svg', 'template', 'thead', 'title', 'video', 'xmp']),
    DATA_URI_TAGS: null,
    DEFAULT_DATA_URI_TAGS: addToSet({}, ['audio', 'video', 'img', 'source', 'image', 'track']),
    URI_SAFE_ATTRIBUTES: null,
    DEFAULT_URI_SAFE_ATTRIBUTES: addToSet({}, ['alt', 'class', 'for', 'id', 'name', 'src', 'value', 'xmlns']),
    CONFIG: null,
  };

  let formElement = document.createElement('form');

  function parseConfig(cfg) {
    if (globalConfig.CONFIG && globalConfig.CONFIG === cfg) return;

    globalConfig.CONFIG = clone(cfg = cfg || {});
    const { ADD_URI_SAFE_ATTR, ADD_TAGS, ADD_ATTR, FORBID_TAGS, FORBID_ATTR, USE_PROFILES, ALLOW_ARIA_ATTR = true, ALLOW_DATA_ATTR = true, ALLOW_UNKNOWN_PROTOCOLS = false, SAFE_FOR_TEMPLATES = false, WHOLE_DOCUMENT = false, RETURN_DOM = false, RETURN_DOM_FRAGMENT = false, FORCE_BODY = false, SANITIZE_DOM = true, KEEP_CONTENT = true } = cfg;
    const { DEFAULT_ALLOWED_TAGS, DEFAULT_ALLOWED_ATTR, DEFAULT_DATA_URI_TAGS, DEFAULT_URI_SAFE_ATTRIBUTES } = globalConfig;

    globalConfig.ALLOWED_TAGS = cfg.ALLOWED_TAGS ? addToSet({}, cfg.ALLOWED_TAGS) : DEFAULT_ALLOWED_TAGS;
    globalConfig.ALLOWED_ATTR = cfg.ALLOWED_ATTR ? addToSet({}, cfg.ALLOWED_ATTR) : DEFAULT_ALLOWED_ATTR;
    globalConfig.URI_SAFE_ATTRIBUTES = ADD_URI_SAFE_ATTR ? addToSet(clone(DEFAULT_URI_SAFE_ATTRIBUTES), cfg.ADD_URI_SAFE_ATTR) : DEFAULT_URI_SAFE_ATTRIBUTES;
    globalConfig.DATA_URI_TAGS = cfg.ADD_DATA_URI_TAGS ? addToSet(clone(DEFAULT_DATA_URI_TAGS), cfg.ADD_DATA_URI_TAGS) : DEFAULT_DATA_URI_TAGS;
    globalConfig.FORBID_TAGS = FORBID_TAGS ? addToSet({}, FORBID_TAGS) : {};
    globalConfig.FORBID_ATTR = FORBID_ATTR ? addToSet({}, FORBID_ATTR) : {};
    globalConfig.USE_PROFILES = USE_PROFILES || false;
    globalConfig.ALLOW_ARIA_ATTR = ALLOW_ARIA_ATTR;
    globalConfig.ALLOW_DATA_ATTR = ALLOW_DATA_ATTR;
    globalConfig.ALLOW_UNKNOWN_PROTOCOLS = ALLOW_UNKNOWN_PROTOCOLS;
    globalConfig.SAFE_FOR_TEMPLATES = SAFE_FOR_TEMPLATES;
    globalConfig.WHOLE_DOCUMENT = WHOLE_DOCUMENT;
    globalConfig.RETURN_DOM = RETURN_DOM;
    globalConfig.RETURN_DOM_FRAGMENT = RETURN_DOM_FRAGMENT;
    globalConfig.RETURN_DOM_IMPORT = RETURN_DOM_IMPORT !== false;
    globalConfig.RETURN_TRUSTED_TYPE = cfg.RETURN_TRUSTED_TYPE || false;
    globalConfig.FORCE_BODY = FORCE_BODY;
    globalConfig.SANITIZE_DOM = SANITIZE_DOM;
    globalConfig.KEEP_CONTENT = KEEP_CONTENT;
    globalConfig.IN_PLACE = cfg.IN_PLACE || false;
    globalConfig.IS_ALLOWED_URI = cfg.ALLOWED_URI_REGEXP || regexPatterns.allowedUri;
    if (SAFE_FOR_TEMPLATES) globalConfig.ALLOW_DATA_ATTR = false;

    if (RETURN_DOM_FRAGMENT) globalConfig.RETURN_DOM = true;

    if (USE_PROFILES) {
      const textTags = ['text'];
      globalConfig.ALLOWED_TAGS = addToSet({}, textTags);
      globalConfig.ALLOWED_ATTR = [];
      if (USE_PROFILES.html) {
        addToSet(globalConfig.ALLOWED_TAGS, html);
        addToSet(globalConfig.ALLOWED_ATTR, htmlAttrs);
      }
      if (USE_PROFILES.svg) {
        addToSet(globalConfig.ALLOWED_TAGS, svg);
        addToSet(globalConfig.ALLOWED_ATTR, svgAttrs);
        addToSet(globalConfig.ALLOWED_ATTR, xmlAttrs);
      }
      if (USE_PROFILES.mathMl) {
        addToSet(globalConfig.ALLOWED_TAGS, mathMl);
        addToSet(globalConfig.ALLOWED_ATTR, mathMlAttrs);
        addToSet(globalConfig.ALLOWED_ATTR, xmlAttrs);
      }
    }

    if (ADD_TAGS) {
      if (globalConfig.ALLOWED_TAGS === DEFAULT_ALLOWED_TAGS) {
        globalConfig.ALLOWED_TAGS = clone(globalConfig.ALLOWED_TAGS);
      }
      addToSet(globalConfig.ALLOWED_TAGS, ADD_TAGS);
    }

    if (ADD_ATTR) {
      if (globalConfig.ALLOWED_ATTR === DEFAULT_ALLOWED_ATTR) {
        globalConfig.ALLOWED_ATTR = clone(globalConfig.ALLOWED_ATTR);
      }
      addToSet(globalConfig.ALLOWED_ATTR, ADD_ATTR);
    }

    if (KEEP_CONTENT) globalConfig.ALLOWED_TAGS['#text'] = true;
    if (WHOLE_DOCUMENT) addToSet(globalConfig.ALLOWED_TAGS, ['html', 'head', 'body']);

    if (freeze) freeze(cfg);
  }

  function executeHook(entryPoint, currentNode, data) {
    if (!hooks[entryPoint]) return;

    hooks[entryPoint].forEach(hook => hook.call(DOMPurify, currentNode, data, globalConfig.CONFIG));
  };

  function sanitizeElements(currentNode) {
    executeHook('beforeSanitizeElements', currentNode, null);

    if (_isClobbered(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }

    const tagName = currentNode.nodeName.toLowerCase();

    executeHook('uponSanitizeElement', currentNode, { tagName, allowedTags: globalConfig.ALLOWED_TAGS });

    if (!_isNode(currentNode.firstElementChild) && regExpTest(/<[/\w]/g, currentNode.innerHTML) && regExpTest(/<[/\w]/g, currentNode.textContent)) {
      _forceRemove(currentNode);
      return true;
    }

    if (!globalConfig.ALLOWED_TAGS[tagName] || globalConfig.FORBID_TAGS[tagName]) {
      if (globalConfig.KEEP_CONTENT && !globalConfig.FORBID_CONTENTS[tagName]) {
        const parentNode = getParentNode(currentNode);
        const childNodes = getChildNodes(currentNode);
        let childCount = childNodes.length;
        for (let i = 0; i < childCount; i++) {
          parentNode.insertBefore(cloneNode(childNodes[i], true), getNextSibling(currentNode));
        }
      }
      _forceRemove(currentNode);
      return true;
    }

    if (currentNode instanceof Element && !_checkValidNamespace(currentNode)) {
      _forceRemove(currentNode);
      return true;
    }

    if ((tagName === 'noscript' || tagName === 'noembed') && regExpTest(/<\/no(script|embed)/i, currentNode.innerHTML)) {
      _forceRemove(currentNode);
      return true;
    }

    if (globalConfig.SAFE_FOR_TEMPLATES && currentNode.nodeType === 3) {
      let content = currentNode.textContent;
      content = content.replace(regexPatterns.mustacheExpr, ' ').replace(regexPatterns.erbExpr, ' ');
      if (currentNode.textContent !== content) {
        globalConfig.CONFIG.push({ element: currentNode.cloneNode() });
        currentNode.textContent = content;
      }
    }

    executeHook('afterSanitizeElements', currentNode, null);
    return false;
  }

  function isValidAttribute(lcTag, lcName, value) {
    if (globalConfig.SANITIZE_DOM && (lcName === 'id' || lcName === 'name') && (value in document || value in formElement)) {
      return false;
    }

    if (globalConfig.ALLOW_DATA_ATTR && regexPatterns.dataAttr.test(lcName)) {
    } else if (globalConfig.ALLOW_ARIA_ATTR && regexPatterns.ariaAttr.test(lcName)) {
    } else if (!globalConfig.ALLOWED_ATTR[lcName] || globalConfig.FORBID_ATTR[lcName]) {
      return false;
    } else if (globalConfig.URI_SAFE_ATTRIBUTES[lcName]) {
    } else if (regexPatterns.allowedUri.test(value.replace(/\s/g, ''))) {
    } else if ((lcName === 'src' || lcName === 'xlink:href' || lcName === 'href') && lcTag !== 'script' && value.indexOf('data:') === 0 && globalConfig.DATA_URI_TAGS[lcTag]) {
    } else if (globalConfig.ALLOW_UNKNOWN_PROTOCOLS && !regexPatterns.scriptOrData.test(value.replace(/\s/g, ''))) {
    } else if (!value) {
    } else {
      return false;
    }

    return true;
  }

  function sanitizeAttributes(currentNode) {
    executeHook('beforeSanitizeAttributes', currentNode, null);

    const attributes = currentNode.attributes;

    if (!attributes) return;

    const hookEvent = {
      attrName: '',
      attrValue: '',
      keepAttr: true,
      allowedAttributes: globalConfig.ALLOWED_ATTR
    };

    for (let l = attributes.length - 1; l >= 0; l--) {
      const attr = attributes[l];
      const { name, namespaceURI } = attr;
      let value = attr.value.trim();
      const lcName = name.toLowerCase();

      hookEvent.attrName = lcName;
      hookEvent.attrValue = value;
      hookEvent.keepAttr = true;
      hookEvent.forceKeepAttr = undefined;
      executeHook('uponSanitizeAttribute', currentNode, hookEvent);
      value = hookEvent.attrValue;

      if (hookEvent.forceKeepAttr) continue;

      currentNode.removeAttribute(name);

      if (!hookEvent.keepAttr) continue;

      if (regexPatterns.mustacheExpr.test(value)) {
        currentNode.removeAttribute(name);
        continue;
      }

      if (globalConfig.SAFE_FOR_TEMPLATES) {
        value = value.replace(regexPatterns.mustacheExpr, ' ').replace(regexPatterns.erbExpr, ' ');
      }

      const lcTag = currentNode.nodeName.toLowerCase();
      if (!isValidAttribute(lcTag, lcName, value)) continue;

      try {
        if (namespaceURI) {
          currentNode.setAttributeNS(namespaceURI, name, value);
        } else {
          currentNode.setAttribute(name, value);
        }

        globalConfig.CONFIG.push(DOMPurify.removed.pop());
      } catch (_) {}
    }

    executeHook('afterSanitizeAttributes', currentNode, null);
  }

  function sanitizeShadowDOM(fragment) {
    executeHook('beforeSanitizeShadowDOM', fragment, null);

    const shadowIterator = createNodeIterator(fragment);

    while (let shadowNode = shadowIterator.nextNode()) {
      executeHook('uponSanitizeShadowNode', shadowNode, null);

      if (sanitizeElements(shadowNode)) continue;

      if (shadowNode.content instanceof DocumentFragment) {
        sanitizeShadowDOM(shadowNode.content);
      }

      sanitizeAttributes(shadowNode);
    }

    executeHook('afterSanitizeShadowDOM', fragment, null);
  }

  DOMPurify.sanitize = function (dirty, cfg) {
    if (!dirty) dirty = '<!-->';

    if (typeof dirty !== 'string' && !_isNode(dirty)) {
      if (typeof dirty.toString !== 'function' || typeof (dirty = dirty.toString()) !== 'string') {
        throw new TypeError('toString is not a function or dirty is not a string');
      }
    }

    if (!DOMPurify.isSupported) {
      if (typeof window.toStaticHTML === 'function') return _isNode(dirty) ? window.toStaticHTML(dirty.outerHTML) : window.toStaticHTML(dirty);
      return dirty;
    }

    if (!globalConfig.SET_CONFIG) parseConfig(cfg);

    DOMPurify.removed = [];

    if (typeof dirty === 'string') globalConfig.IN_PLACE = false;

    if (globalConfig.IN_PLACE) {
    } else if (dirty instanceof Node) {
      const body = _initDocument('<!---->');
      const importedNode = body.ownerDocument.importNode(dirty, true);
      if (importedNode.nodeType === 1 && importedNode.nodeName === 'BODY') {
        body = importedNode;
      } else if (importedNode.nodeName === 'HTML') {
        body = importedNode;
      } else {
        body.appendChild(importedNode);
      }
    } else {
      if (!globalConfig.RETURN_DOM && !globalConfig.SAFE_FOR_TEMPLATES && !globalConfig.WHOLE_DOCUMENT && dirty.indexOf('<') === -1) {
        return trustedTypesPolicy && globalConfig.RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(dirty) : dirty;
      }

      const body = _initDocument(dirty);
      if (!body) return globalConfig.RETURN_DOM ? null : emptyHTML;
    }

    if (body && globalConfig.FORCE_BODY) _forceRemove(body.firstChild);

    const nodeIterator = createNodeIterator(globalConfig.IN_PLACE ? dirty : body);
    let currentNode;
    let oldNode;

    while (currentNode = nodeIterator.nextNode()) {
      if (currentNode.nodeType === 3 && currentNode === oldNode) continue;

      if (sanitizeElements(currentNode)) continue;

      if (currentNode.content instanceof DocumentFragment) {
        sanitizeShadowDOM(currentNode.content);
      }

      sanitizeAttributes(currentNode);

      oldNode = currentNode;
    }

    oldNode = null;

    if (globalConfig.IN_PLACE) return dirty;

    if (globalConfig.RETURN_DOM) {
      let returnNode;
      if (globalConfig.RETURN_DOM_FRAGMENT) {
        returnNode = createDocumentFragment.call(body.ownerDocument);
        while (body.firstChild) {
          returnNode.appendChild(body.firstChild);
        }
      } else {
        returnNode = body;
      }

      if (globalConfig.RETURN_DOM_IMPORT) {
        returnNode = importNode.call(originalDocument, returnNode, true);
      }

      return returnNode;
    }

    const serializedHTML = globalConfig.WHOLE_DOCUMENT ? body.outerHTML : body.innerHTML;

    if (globalConfig.SAFE_FOR_TEMPLATES) {
      const serializedHTML = serializedHTML.replace(regexPatterns.mustacheExpr, ' ').replace(regexPatterns.erbExpr, ' ');
    }

    return trustedTypesPolicy && globalConfig.RETURN_TRUSTED_TYPE ? trustedTypesPolicy.createHTML(serializedHTML) : serializedHTML;
  };

  DOMPurify.setConfig = (cfg) => {
    parseConfig(cfg);
    globalConfig.SET_CONFIG = true;
  };

  DOMPurify.clearConfig = () => {
    globalConfig.CONFIG = null;
    globalConfig.SET_CONFIG = false;
  };

  DOMPurify.isValidAttribute = (tag, attr, value) => {
    if (!globalConfig.CONFIG) parseConfig({});
    return isValidAttribute(tag.toLowerCase(), attr.toLowerCase(), value);
  };

  DOMPurify.addHook = (entryPoint, hookFunction) => {
    if (typeof hookFunction !== 'function') return;
    hooks[entryPoint] = hooks[entryPoint] || [];
    hooks[entryPoint].push(hookFunction);
  };

  DOMPurify.removeHook = (entryPoint) => {
    if (hooks[entryPoint]) hooks[entryPoint].pop();
  };

  DOMPurify.removeHooks = (entryPoint) => {
    if (hooks[entryPoint]) hooks[entryPoint] = [];
  };

  DOMPurify.removeAllHooks = () => {
    hooks = {};
  };

  return DOMPurify;
}

const purify = createDOMPurify();
module.exports = purify;
