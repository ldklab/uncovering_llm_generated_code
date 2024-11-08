'use strict';

function createDOMPurify() {
  let hooks = {};
  
  function addToSet(set, array) {
    array.forEach(element => {
      if (typeof element === 'string') {
        set[element.toLowerCase()] = true;
      }
    });
    return set;
  }

  function clone(object) {
    const newObject = Object.create(null);
    for (const property in object) {
      if (Object.prototype.hasOwnProperty.call(object, property)) {
        newObject[property] = object[property];
      }
    }
    return newObject;
  }

  function isValidAttribute(tag, attr, value) {
    const allowedAttrs = { /* Define allowed attributes here */ };
    const safeUriPattern = /^(http|https|mailto|tel):/;
    const lcAttr = attr.toLowerCase();
    if (allowedAttrs[lcAttr]) {
      return safeUriPattern.test(value) || ['id', 'class', 'name'].includes(lcAttr);
    }
    return false;
  }

  function sanitizeAttributes(node) {
    const attributes = node.attributes;
    [...attributes].forEach(attr => {
      const { name, value } = attr;
      if (!isValidAttribute(node.nodeName, name, value)) {
        node.removeAttribute(name);
      }
    });
  }

  function sanitizeElements(node) {
    const allowedTags = addToSet({}, ['div', 'span', 'a', 'p', 'b', 'i', 'u', 'strong']);
    const tagName = node.nodeName.toLowerCase();
    if (!allowedTags[tagName]) {
      node.parentNode && node.parentNode.removeChild(node);
    }
  }

  const DOMPurify = {
    sanitize(dirty) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(dirty, 'text/html');
      const body = doc.body;

      const walk = document.createTreeWalker(body, NodeFilter.SHOW_ELEMENT, null, false);
      while (walk.nextNode()) {
        const currentNode = walk.currentNode;
        sanitizeElements(currentNode);
        sanitizeAttributes(currentNode);
      }

      return body.innerHTML;
    },
    addHook(entryPoint, hookFunction) {
      if (!hooks[entryPoint]) hooks[entryPoint] = [];
      hooks[entryPoint].push(hookFunction);
    },
    removeHooks(entryPoint) {
      if (hooks[entryPoint]) hooks[entryPoint] = [];
    }
  };

  return DOMPurify;
}

const purify = createDOMPurify();
module.exports = purify;
