'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function getBoundingClientRect(element) {
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
    top: rect.top,
    right: rect.right,
    bottom: rect.bottom,
    left: rect.left,
    x: rect.left,
    y: rect.top
  };
}

function getWindow(node) {
  if (node.toString() !== '[object Window]') {
    const ownerDocument = node.ownerDocument;
    return ownerDocument ? ownerDocument.defaultView || window : window;
  }
  return node;
}

function getWindowScroll(node) {
  const win = getWindow(node);
  return {
    scrollLeft: win.pageXOffset,
    scrollTop: win.pageYOffset
  };
}

function isElement(node) {
  return node instanceof (getWindow(node).Element || Element);
}

function isHTMLElement(node) {
  return node instanceof (getWindow(node).HTMLElement || HTMLElement);
}

function isShadowRoot(node) {
  return node instanceof (getWindow(node).ShadowRoot || ShadowRoot);
}

function getHTMLElementScroll(element) {
  return {
    scrollLeft: element.scrollLeft,
    scrollTop: element.scrollTop
  };
}

function getNodeScroll(node) {
  if (node === getWindow(node) || !isHTMLElement(node)) {
    return getWindowScroll(node);
  } else {
    return getHTMLElementScroll(node);
  }
}

function getNodeName(element) {
  return element ? (element.nodeName || '').toLowerCase() : null;
}

function getDocumentElement(element) {
  return ((isElement(element) ? element.ownerDocument : element.document) || window.document).documentElement;
}

function getWindowScrollBarX(element) {
  return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
}

function getComputedStyle(element) {
  return getWindow(element).getComputedStyle(element);
}

function isScrollParent(element) {
  const { overflow, overflowX, overflowY } = getComputedStyle(element);
  return /auto|scroll|overlay|hidden/.test(overflow + overflowY + overflowX);
}

function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed) {
  if (isFixed === undefined) isFixed = false;

  const documentElement = getDocumentElement(offsetParent);
  const rect = getBoundingClientRect(elementOrVirtualElement);
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  let scroll = { scrollLeft: 0, scrollTop: 0 };
  let offsets = { x: 0, y: 0 };

  if (isOffsetParentAnElement || (!isOffsetParentAnElement && !isFixed)) {
    if (getNodeName(offsetParent) !== 'body' || isScrollParent(documentElement)) {
      scroll = getNodeScroll(offsetParent);
    }
    if (isHTMLElement(offsetParent)) {
      offsets = getBoundingClientRect(offsetParent);
      offsets.x += offsetParent.clientLeft;
      offsets.y += offsetParent.clientTop;
    } else if (documentElement) {
      offsets.x = getWindowScrollBarX(documentElement);
    }
  }

  return {
    x: rect.left + scroll.scrollLeft - offsets.x,
    y: rect.top + scroll.scrollTop - offsets.y,
    width: rect.width,
    height: rect.height
  };
}

function getLayoutRect(element) {
  return {
    x: element.offsetLeft,
    y: element.offsetTop,
    width: element.offsetWidth,
    height: element.offsetHeight
  };
}

function getParentNode(element) {
  if (getNodeName(element) === 'html') {
    return element;
  }

  return (element.assignedSlot || element.parentNode || element.host || getDocumentElement(element));
}

function getScrollParent(node) {
  if (['html', 'body', '#document'].indexOf(getNodeName(node)) >= 0) {
    return node.ownerDocument.body;
  }
  if (isHTMLElement(node) && isScrollParent(node)) {
    return node;
  }
  return getScrollParent(getParentNode(node));
}

function listScrollParents(element, list = []) {
  const scrollParent = getScrollParent(element);
  const isBody = getNodeName(scrollParent) === 'body';
  const win = getWindow(scrollParent);
  const target = isBody ? [win].concat(
    win.visualViewport || [],
    isScrollParent(scrollParent) ? scrollParent : []
  ) : scrollParent;
  const updatedList = list.concat(target);
  return isBody ? updatedList : updatedList.concat(listScrollParents(getParentNode(target)));
}

function isTableElement(element) {
  return ['table', 'td', 'th'].indexOf(getNodeName(element)) >= 0;
}

function getTrueOffsetParent(element) {
  if (!isHTMLElement(element) || getComputedStyle(element).position === 'fixed') {
    return null;
  }
  const offsetParent = element.offsetParent;
  if (offsetParent) {
    const html = getDocumentElement(offsetParent);
    if (getNodeName(offsetParent) === 'body' &&
        getComputedStyle(offsetParent).position === 'static' &&
        getComputedStyle(html).position !== 'static') {
      return html;
    }
  }
  return offsetParent;
}

function getContainingBlock(element) {
  let currentNode = getParentNode(element);

  while (isHTMLElement(currentNode) && ['html', 'body'].indexOf(getNodeName(currentNode)) < 0) {
    const css = getComputedStyle(currentNode);
    if (css.transform !== 'none' || css.perspective !== 'none' || (css.willChange && css.willChange !== 'auto')) {
      return currentNode;
    } else {
      currentNode = currentNode.parentNode;
    }
  }
  return null;
}

function getOffsetParent(element) {
  const window = getWindow(element);
  let offsetParent = getTrueOffsetParent(element);

  while (offsetParent && isTableElement(offsetParent) && getComputedStyle(offsetParent).position === 'static') {
    offsetParent = getTrueOffsetParent(offsetParent);
  }

  if (offsetParent && getNodeName(offsetParent) === 'body' &&
      getComputedStyle(offsetParent).position === 'static') {
    return window;
  }

  return offsetParent || getContainingBlock(element) || window;
}

const top = 'top';
const bottom = 'bottom';
const right = 'right';
const left = 'left';
const auto = 'auto';
const basePlacements = [top, bottom, right, left];
const start = 'start';
const end = 'end';
const clippingParents = 'clippingParents';
const viewport = 'viewport';
const popper = 'popper';
const reference = 'reference';
const variationPlacements = basePlacements.reduce((acc, placement) => {
  return acc.concat([`${placement}-${start}`, `${placement}-${end}`]);
}, []);
const placements = [...basePlacements, auto].reduce((acc, placement) => {
  return acc.concat([placement, `${placement}-${start}`, `${placement}-${end}`]);
}, []);

const beforeRead = 'beforeRead';
const read = 'read';
const afterRead = 'afterRead';
const beforeMain = 'beforeMain';
const main = 'main';
const afterMain = 'afterMain';
const beforeWrite = 'beforeWrite';
const write = 'write';
const afterWrite = 'afterWrite';
const modifierPhases = [
  beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite
];

function order(modifiers) {
  const map = new Map();
  const visited = new Set();
  const result = [];
  modifiers.forEach(modifier => {
    map.set(modifier.name, modifier);
  });

  function sort(modifier) {
    visited.add(modifier.name);
    const requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
    requires.forEach(dep => {
      if (!visited.has(dep)) {
        const depModifier = map.get(dep);
        if (depModifier) {
          sort(depModifier);
        }
      }
    });
    result.push(modifier);
  }

  modifiers.forEach(modifier => {
    if (!visited.has(modifier.name)) {
      sort(modifier);
    }
  });

  return result;
}

function orderModifiers(modifiers) {
  const orderedModifiers = order(modifiers);
  return modifierPhases.reduce((acc, phase) => {
    return acc.concat(orderedModifiers.filter(modifier => modifier.phase === phase));
  }, []);
}

function debounce(fn) {
  let pending;
  return () => {
    if (!pending) {
      pending = new Promise(resolve => {
        Promise.resolve().then(() => {
          pending = undefined;
          resolve(fn());
        });
      });
    }
    return pending;
  };
}

function format(str, ...args) {
  return args.reduce((p, c) => p.replace(/%s/, c), str);
}

const INVALID_MODIFIER_ERROR = 'Popper: modifier "%s" provided an invalid %s property, expected %s but got %s';
const MISSING_DEPENDENCY_ERROR = 'Popper: modifier "%s" requires "%s", but "%s" modifier is not available';
const VALID_PROPERTIES = ['name', 'enabled', 'phase', 'fn', 'effect', 'requires', 'options'];

function validateModifiers(modifiers) {
  modifiers.forEach(modifier => {
    Object.keys(modifier).forEach(key => {
      switch (key) {
        case 'name':
          if (typeof modifier.name !== 'string') {
            console.error(format(INVALID_MODIFIER_ERROR, String(modifier.name), '"name"', '"string"', `"${String(modifier.name)}"`));
          }
          break;
        case 'enabled':
          if (typeof modifier.enabled !== 'boolean') {
            console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"enabled"', '"boolean"', `"${String(modifier.enabled)}"`));
          }
        case 'phase':
          if (!modifierPhases.includes(modifier.phase)) {
            console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"phase"', `either ${modifierPhases.join(', ')}`, `"${String(modifier.phase)}"`));
          }
          break;
        case 'fn':
          if (typeof modifier.fn !== 'function') {
            console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"fn"', '"function"', `"${String(modifier.fn)}"`));
          }
          break;
        case 'effect':
          if (typeof modifier.effect !== 'function') {
            console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"effect"', '"function"', `"${String(modifier.fn)}"`));
          }
          break;
        case 'requires':
          if (!Array.isArray(modifier.requires)) {
            console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"requires"', '"array"', `"${String(modifier.requires)}"`));
          }
          break;
        case 'requiresIfExists':
          if (!Array.isArray(modifier.requiresIfExists)) {
            console.error(format(INVALID_MODIFIER_ERROR, modifier.name, '"requiresIfExists"', '"array"', `"${String(modifier.requiresIfExists)}"`));
          }
          break;
        case 'options':
        case 'data':
          break;
        default:
          console.error(`PopperJS: an invalid property has been provided to the "${modifier.name}" modifier, valid properties are ${VALID_PROPERTIES.map(s => `"${s}"`).join(', ')}; but "${key}" was provided.`);
      }
      modifier.requires && modifier.requires.forEach(requirement => {
        if (!modifiers.some(mod => mod.name === requirement)) {
          console.error(format(MISSING_DEPENDENCY_ERROR, String(modifier.name), requirement, requirement));
        }
      });
    });
  });
}

function uniqueBy(arr, fn) {
  const identifiers = new Set();
  return arr.filter(item => {
    const identifier = fn(item);
    if (!identifiers.has(identifier)) {
      identifiers.add(identifier);
      return true;
    }
  });
}

function getBasePlacement(placement) {
  return placement.split('-')[0];
}

function mergeByName(modifiers) {
  const merged = modifiers.reduce((merged, current) => {
    const existing = merged[current.name];
    merged[current.name] = existing ? {
      ...existing,
      ...current,
      options: { ...existing.options, ...current.options },
      data: { ...existing.data, ...current.data }
    } : current;
    return merged;
  }, {});
  return Object.keys(merged).map(key => merged[key]);
}

function getViewportRect(element) {
  const win = getWindow(element);
  const html = getDocumentElement(element);
  const visualViewport = win.visualViewport;
  let width = html.clientWidth;
  let height = html.clientHeight;
  let x = 0;
  let y = 0;
  if (visualViewport) {
    width = visualViewport.width;
    height = visualViewport.height;
    if (!/^((?!chrome|android).)*safari/i.test(navigator.userAgent)) {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }
  return {
    width,
    height,
    x: x + getWindowScrollBarX(element),
    y
  };
}

function getDocumentRect(element) {
  const html = getDocumentElement(element);
  const winScroll = getWindowScroll(element);
  const body = element.ownerDocument.body;
  const width = Math.max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
  const height = Math.max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
  let x = -winScroll.scrollLeft + getWindowScrollBarX(element);
  let y = -winScroll.scrollTop;
  if (getComputedStyle(body || html).direction === 'rtl') {
    x += Math.max(html.clientWidth, body ? body.clientWidth : 0) - width;
  }
  return { width, height, x, y };
}

function contains(parent, child) {
  const rootNode = child.getRootNode && child.getRootNode();
  if (parent.contains(child)) {
    return true;
  } else if (rootNode && isShadowRoot(rootNode)) {
    let next = child;
    do {
      if (next && parent.isSameNode(next)) {
        return true;
      }
      next = next.parentNode || next.host;
    } while (next);
  }
  return false;
}

function rectToClientRect(rect) {
  return { ...rect, left: rect.x, top: rect.y, right: rect.x + rect.width, bottom: rect.y + rect.height };
}

function getInnerBoundingClientRect(element) {
  const rect = getBoundingClientRect(element);
  rect.top = rect.top + element.clientTop;
  rect.left = rect.left + element.clientLeft;
  rect.bottom = rect.top + element.clientHeight;
  rect.right = rect.left + element.clientWidth;
  rect.width = element.clientWidth;
  rect.height = element.clientHeight;
  rect.x = rect.left;
  rect.y = rect.top;
  return rect;
}

function getClientRectFromMixedType(element, clippingParent) {
  return clippingParent === viewport
    ? rectToClientRect(getViewportRect(element))
    : isHTMLElement(clippingParent)
    ? getInnerBoundingClientRect(clippingParent)
    : rectToClientRect(getDocumentRect(getDocumentElement(element)));
}

function getClippingParents(element) {
  const clippingParents = listScrollParents(getParentNode(element));
  const canEscapeClipping = ['absolute', 'fixed'].includes(getComputedStyle(element).position);
  const clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;
  return isElement(clipperElement)
    ? clippingParents.filter(clippingParent => isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== 'body')
    : [];
}

function getClippingRect(element, boundary, rootBoundary) {
  const mainClippingParents = boundary === 'clippingParents' ? getClippingParents(element) : [].concat(boundary);
  const clippingParents = [].concat(mainClippingParents, [rootBoundary]);
  const firstClippingParent = clippingParents[0];
  const clippingRect = clippingParents.reduce((accRect, clippingParent) => {
    const rect = getClientRectFromMixedType(element, clippingParent);
    accRect.top = Math.max(rect.top, accRect.top);
    accRect.right = Math.min(rect.right, accRect.right);
    accRect.bottom = Math.min(rect.bottom, accRect.bottom);
    accRect.left = Math.max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromMixedType(element, firstClippingParent));
  clippingRect.width = clippingRect.right - clippingRect.left;
  clippingRect.height = clippingRect.bottom - clippingRect.top;
  clippingRect.x = clippingRect.left;
  clippingRect.y = clippingRect.top;
  return clippingRect;
}

function getVariation(placement) {
  return placement.split('-')[1];
}

function getMainAxisFromPlacement(placement) {
  return ['top', 'bottom'].includes(placement) ? 'x' : 'y';
}

function computeOffsets({ reference, element, placement }) {
  const basePlacement = placement ? getBasePlacement(placement) : null;
  const variation = placement ? getVariation(placement) : null;
  const commonX = reference.x + reference.width / 2 - element.width / 2;
  const commonY = reference.y + reference.height / 2 - element.height / 2;
  let offsets;
  switch (basePlacement) {
    case top:
      offsets = { x: commonX, y: reference.y - element.height };
      break;
    case bottom:
      offsets = { x: commonX, y: reference.y + reference.height };
      break;
    case right:
      offsets = { x: reference.x + reference.width, y: commonY };
      break;
    case left:
      offsets = { x: reference.x - element.width, y: commonY };
      break;
    default:
      offsets = { x: reference.x, y: reference.y };
  }
  const mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;
  if (mainAxis != null) {
    const len = mainAxis === 'y' ? 'height' : 'width';
    switch (variation) {
      case start:
        offsets[mainAxis] = offsets[mainAxis] - (reference[len] / 2 - element[len] / 2);
        break;
      case end:
        offsets[mainAxis] = offsets[mainAxis] + (reference[len] / 2 - element[len] / 2);
        break;
    }
  }
  return offsets;
}

function getFreshSideObject() {
  return { top: 0, right: 0, bottom: 0, left: 0 };
}

function mergePaddingObject(paddingObject) {
  return { ...getFreshSideObject(), ...paddingObject };
}

function expandToHashMap(value, keys) {
  return keys.reduce((hashMap, key) => {
    hashMap[key] = value;
    return hashMap;
  }, {});
}

function detectOverflow(state, options = {}) {
  const { placement = state.placement, boundary = clippingParents, rootBoundary = viewport, elementContext = popper, altBoundary = false, padding = 0 } = options;
  const paddingObject = mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
  const altContext = elementContext === popper ? reference : popper;
  const referenceElement = state.elements.reference;
  const popperRect = state.rects.popper;
  const element = state.elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary);
  const referenceClientRect = getBoundingClientRect(referenceElement);
  const popperOffsets = computeOffsets({ reference: referenceClientRect, element: popperRect, strategy: 'absolute', placement });
  const popperClientRect = rectToClientRect({ ...popperRect, ...popperOffsets });
  const elementClientRect = elementContext === popper ? popperClientRect : referenceClientRect;
  const overflowOffsets = {
    top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
    bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
    left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
    right: elementClientRect.right - clippingClientRect.right + paddingObject.right
  };
  const offsetData = state.modifiersData.offset;
  if (elementContext === popper && offsetData) {
    const offset = offsetData[placement];
    Object.keys(overflowOffsets).forEach(key => {
      const multiply = [right, bottom].includes(key) ? 1 : -1;
      const axis = [top, bottom].includes(key) ? 'y' : 'x';
      overflowOffsets[key] += offset[axis] * multiply;
    });
  }
  return overflowOffsets;
}

const INVALID_ELEMENT_ERROR = 'Popper: Invalid reference or popper argument provided. They must be either a DOM element or virtual element.';
const INFINITE_LOOP_ERROR = 'Popper: An infinite loop in the modifiers cycle has been detected! The cycle has been interrupted to prevent a browser crash.';
const DEFAULT_OPTIONS = {
  placement: 'bottom',
  modifiers: [],
  strategy: 'absolute'
};

function areValidElements(...args) {
  return !args.some(element => !(element && typeof element.getBoundingClientRect === 'function'));
}

function popperGenerator(generatorOptions = {}) {
  const { defaultModifiers = [], defaultOptions = DEFAULT_OPTIONS } = generatorOptions;
  return function createPopper(reference, popper, options = defaultOptions) {
    const state = {
      placement: 'bottom',
      orderedModifiers: [],
      options: { ...DEFAULT_OPTIONS, ...defaultOptions },
      modifiersData: {},
      elements: { reference, popper },
      attributes: {},
      styles: {}
    };
    const effectCleanupFns = [];
    let isDestroyed = false;
    const instance = {
      state,
      setOptions(options) {
        cleanupModifierEffects();
        state.options = { ...defaultOptions, ...state.options, ...options };
        state.scrollParents = {
          reference: isElement(reference) ? listScrollParents(reference) : reference.contextElement ? listScrollParents(reference.contextElement) : [],
          popper: listScrollParents(popper)
        };
        const orderedModifiers = orderModifiers(mergeByName([...defaultModifiers, ...state.options.modifiers]));
        state.orderedModifiers = orderedModifiers.filter(m => m.enabled);
        if (process.env.NODE_ENV !== "production") {
          const modifiers = uniqueBy([...orderedModifiers, ...state.options.modifiers], ({ name }) => name);
          validateModifiers(modifiers);

          if (getBasePlacement(state.options.placement) === auto) {
            const flipModifier = state.orderedModifiers.find(({ name }) => name === 'flip');
            if (!flipModifier) {
              console.error(['Popper: "auto" placements require the "flip" modifier be', 'present and enabled to work.'].join(' '));
            }
          }

          const { marginTop, marginRight, marginBottom, marginLeft } = getComputedStyle(popper);
          if ([marginTop, marginRight, marginBottom, marginLeft].some(margin => parseFloat(margin))) {
            console.warn(['Popper: CSS "margin" styles cannot be used to apply padding', 'between the popper and its reference element or boundary.', 'To replicate margin, use the `offset` modifier, as well as', 'the `padding` option in the `preventOverflow` and `flip`', 'modifiers.'].join(' '));
          }
        }

        runModifierEffects();
        return instance.update();
      },
      forceUpdate() {
        if (isDestroyed) {
          return;
        }
        const { reference, popper } = state.elements;
        if (!areValidElements(reference, popper)) {
          if (process.env.NODE_ENV !== "production") {
            console.error(INVALID_ELEMENT_ERROR);
          }
          return;
        }
        state.rects = {
          reference: getCompositeRect(reference, getOffsetParent(popper), state.options.strategy === 'fixed'),
          popper: getLayoutRect(popper)
        };
        state.reset = false;
        state.placement = state.options.placement;
        state.orderedModifiers.forEach(modifier => {
          state.modifiersData[modifier.name] = { ...modifier.data };
        });
        let __debug_loops__ = 0;
        for (let index = 0; index < state.orderedModifiers.length; index++) {
          if (process.env.NODE_ENV !== "production") {
            __debug_loops__ += 1;
            if (__debug_loops__ > 100) {
              console.error(INFINITE_LOOP_ERROR);
              break;
            }
          }
          if (state.reset === true) {
            state.reset = false;
            index = -1;
            continue;
          }
          const { fn, options = {}, name } = state.orderedModifiers[index];
          if (typeof fn === 'function') {
            state = fn({ state, options, name, instance }) || state;
          }
        }
      },
      update: debounce(() => new Promise(resolve => {
        instance.forceUpdate();
        resolve(state);
      })),
      destroy() {
        cleanupModifierEffects();
        isDestroyed = true;
      }
    };

    if (!areValidElements(reference, popper)) {
      if (process.env.NODE_ENV !== "production") {
        console.error(INVALID_ELEMENT_ERROR);
      }
      return instance;
    }

    instance.setOptions(options).then(state => {
      if (!isDestroyed && options.onFirstUpdate) {
        options.onFirstUpdate(state);
      }
    });

    function runModifierEffects() {
      state.orderedModifiers.forEach(({ name, options = {}, effect }) => {
        if (typeof effect === 'function') {
          const cleanupFn = effect({ state, name, instance, options });
          effectCleanupFns.push(cleanupFn || function() {});
        }
      });
    }

    function cleanupModifierEffects() {
      effectCleanupFns.forEach(fn => fn());
      effectCleanupFns.length = 0;
    }

    return instance;
  };
}

const passive = { passive: true };

function effect({ state, instance, options: { scroll = true, resize = true } }) {
  const window = getWindow(state.elements.popper);
  const scrollParents = [...state.scrollParents.reference, ...state.scrollParents.popper];

  if (scroll) {
    scrollParents.forEach(scrollParent => {
      scrollParent.addEventListener('scroll', instance.update, passive);
    });
  }

  if (resize) {
    window.addEventListener('resize', instance.update, passive);
  }

  return () => {
    if (scroll) {
      scrollParents.forEach(scrollParent => {
        scrollParent.removeEventListener('scroll', instance.update, passive);
      });
    }

    if (resize) {
      window.removeEventListener('resize', instance.update, passive);
    }
  };
}

const eventListeners = {
  name: 'eventListeners',
  enabled: true,
  phase: 'write',
  fn: function() {},
  effect,
  data: {}
};

function popperOffsets({ state, name }) {
  state.modifiersData[name] = computeOffsets({
    reference: state.rects.reference,
    element: state.rects.popper,
    strategy: 'absolute',
    placement: state.placement
  });
}

const popperOffsets$1 = {
  name: 'popperOffsets',
  enabled: true,
  phase: 'read',
  fn: popperOffsets,
  data: {}
};

const unsetSides = {
  top: 'auto',
  right: 'auto',
  bottom: 'auto',
  left: 'auto'
};

function roundOffsetsByDPR({ x, y }) {
  const win = window;
  const dpr = win.devicePixelRatio || 1;
  return {
    x: Math.round(x * dpr) / dpr || 0,
    y: Math.round(y * dpr) / dpr || 0
  };
}

function mapToStyles({ popper, popperRect, placement, offsets, position, gpuAcceleration, adaptive, roundOffsets }) {
  const { x = 0, y = 0 } = roundOffsets ? roundOffsetsByDPR(offsets) : offsets;
  const hasX = Object.prototype.hasOwnProperty.call(offsets, 'x');
  const hasY = Object.prototype.hasOwnProperty.call(offsets, 'y');
  const sideX = left;
  const sideY = top;
  const win = window;

  if (adaptive) {
    let offsetParent = getOffsetParent(popper);

    if (offsetParent === getWindow(popper)) {
      offsetParent = getDocumentElement(popper);
    }

    if (placement === top) {
      sideY = bottom;
      y -= offsetParent.clientHeight - popperRect.height;
      y *= gpuAcceleration ? 1 : -1;
    }

    if (placement === left) {
      sideX = right;
      x -= offsetParent.clientWidth - popperRect.width;
      x *= gpuAcceleration ? 1 : -1;
    }
  }

  const commonStyles = {
    position,
    ...adaptive && unsetSides
  };

  if (gpuAcceleration) {
    return {
      ...commonStyles,
      [sideY]: hasY ? '0' : '',
      [sideX]: hasX ? '0' : '',
      transform: (win.devicePixelRatio || 1) < 2 ? `translate(${x}px, ${y}px)` : `translate3d(${x}px, ${y}px, 0)`
    };
  }

  return {
    ...commonStyles,
    [sideY]: hasY ? `${y}px` : '',
    [sideX]: hasX ? `${x}px` : '',
    transform: ''
  };
}

function computeStyles({ state, options: { gpuAcceleration = true, adaptive = true, roundOffsets = true } }) {
  if (process.env.NODE_ENV !== "production") {
    const transitionProperty = getComputedStyle(state.elements.popper).transitionProperty || '';
    if (adaptive && ['transform', 'top', 'right', 'bottom', 'left'].some(property => transitionProperty.includes(property))) {
      console.warn([
        'Popper: Detected CSS transitions on at least one of the following',
        'CSS properties: "transform", "top", "right", "bottom", "left".',
        '\n\n',
        'Disable the "computeStyles" modifier\'s `adaptive` option to allow',
        'for smooth transitions, or remove these properties from the CSS',
        'transition declaration on the popper element if only transitioning',
        'opacity or background-color for example.',
        '\n\n',
        'We recommend using the popper element as a wrapper around an inner',
        'element that can have any CSS property transitioned for animations.'
      ].join(' '));
    }
  }

  const commonStyles = {
    placement: getBasePlacement(state.placement),
    popper: state.elements.popper,
    popperRect: state.rects.popper,
    gpuAcceleration
  };

  if (state.modifiersData.popperOffsets != null) {
    state.styles.popper = {
      ...state.styles.popper,
      ...mapToStyles({
        ...commonStyles,
        offsets: state.modifiersData.popperOffsets,
        position: state.options.strategy,
        adaptive,
        roundOffsets
      })
    };
  }

  if (state.modifiersData.arrow != null) {
    state.styles.arrow = {
      ...state.styles.arrow,
      ...mapToStyles({
        ...commonStyles,
        offsets: state.modifiersData.arrow,
        position: 'absolute',
        adaptive: false,
        roundOffsets
      })
    };
  }

  state.attributes.popper = {
    ...state.attributes.popper,
    'data-popper-placement': state.placement
  };
}

const computeStyles$1 = {
  name: 'computeStyles',
  enabled: true,
  phase: 'beforeWrite',
  fn: computeStyles,
  data: {}
};

function applyStyles({ state }) {
  Object.keys(state.elements).forEach(name => {
    const style = state.styles[name] || {};
    const attributes = state.attributes[name] || {};
    const element = state.elements[name];

    if (!isHTMLElement(element) || !getNodeName(element)) {
      return;
    }

    Object.assign(element.style, style);
    Object.keys(attributes).forEach(name => {
      const value = attributes[name];
      if (value === false) {
        element.removeAttribute(name);
      } else {
        element.setAttribute(name, value === true ? '' : value);
      }
    });
  });
}

function effect$1({ state }) {
  const initialStyles = {
    popper: { position: state.options.strategy, left: '0', top: '0', margin: '0' },
    arrow: { position: 'absolute' },
    reference: {}
  };

  Object.assign(state.elements.popper.style, initialStyles.popper);

  if (state.elements.arrow) {
    Object.assign(state.elements.arrow.style, initialStyles.arrow);
  }

  return () => {
    Object.keys(state.elements).forEach(name => {
      const element = state.elements[name];
      const attributes = state.attributes[name] || {};
      const styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]);
      const style = styleProperties.reduce((style, property) => ({ ...style, [property]: '' }), {});
      if (!isHTMLElement(element) || !getNodeName(element)) {
        return;
      }
      Object.assign(element.style, style);
      Object.keys(attributes).forEach(attribute => {
        element.removeAttribute(attribute);
      });
    });
  };
}

const applyStyles$1 = {
  name: 'applyStyles',
  enabled: true,
  phase: 'write',
  fn: applyStyles,
  effect: effect$1,
  requires: ['computeStyles']
};

function distanceAndSkiddingToXY(placement, rects, offset) {
  const basePlacement = getBasePlacement(placement);
  const invertDistance = [left, top].includes(basePlacement) ? -1 : 1;

  const { skidding = 0, distance = 0 } = typeof offset === 'function' ? offset({ ...rects, placement }) : offset;

  return [left, right].includes(basePlacement)
    ? { x: distance, y: skidding }
    : { x: skidding, y: distance };
}

function offset({ state, options, name }) {
  const { offset = [0, 0] } = options;
  const data = placements.reduce((acc, placement) => {
    acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset);
    return acc;
  }, {});
  const { x, y } = data[state.placement];

  if (state.modifiersData.popperOffsets != null) {
    state.modifiersData.popperOffsets.x += x;
    state.modifiersData.popperOffsets.y += y;
  }

  state.modifiersData[name] = data;
}

const offset$1 = {
  name: 'offset',
  enabled: true,
  phase: 'main',
  requires: ['popperOffsets'],
  fn: offset
};

const hash = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' };

function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, matched => hash[matched]);
}

const hash$1 = { start: 'end', end: 'start' };

function getOppositeVariationPlacement(placement) {
  return placement.replace(/start|end/g, matched => hash$1[matched]);
}

function computeAutoPlacement(state, options = {}) {
  const { placement, boundary, rootBoundary, padding, flipVariations, allowedAutoPlacements = placements } = options;
  const variation = getVariation(placement);
  const placements$1 = variation
    ? flipVariations ? variationPlacements : variationPlacements.filter(placement => getVariation(placement) === variation)
    : basePlacements;
  let allowedPlacements = placements$1.filter(placement => allowedAutoPlacements.includes(placement));

  if (allowedPlacements.length === 0) {
    allowedPlacements = placements$1;
    if (process.env.NODE_ENV !== "production") {
      console.error(['Popper: The `allowedAutoPlacements` option did not allow any', 'placements. Ensure the `placement` option matches the variation', 'of the allowed placements.', 'For example, "auto" cannot be used to allow "bottom-start".', 'Use "auto-start" instead.'].join(' '));
    }
  }

  const overflows = allowedPlacements.reduce((acc, placement) => {
    acc[placement] = detectOverflow(state, { placement, boundary, rootBoundary, padding })[getBasePlacement(placement)];
    return acc;
  }, {});
  return Object.keys(overflows).sort((a, b) => overflows[a] - overflows[b]);
}

function getExpandedFallbackPlacements(placement) {
  if (getBasePlacement(placement) === auto) {
    return [];
  }

  const oppositePlacement = getOppositePlacement(placement);
  return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
}

function flip({ state, options, name }) {
  if (state.modifiersData[name]._skip) {
    return;
  }

  const { mainAxis: checkMainAxis = true, altAxis: checkAltAxis = true, fallbackPlacements: specifiedFallbackPlacements, padding, boundary, rootBoundary, altBoundary, flipVariations = true, allowedAutoPlacements } = options;
  const preferredPlacement = state.options.placement;
  const basePlacement = getBasePlacement(preferredPlacement);
  const isBasePlacement = basePlacement === preferredPlacement;
  const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
  const placements = [preferredPlacement, ...fallbackPlacements].reduce((acc, placement) => {
    return acc.concat(getBasePlacement(placement) === auto ? computeAutoPlacement(state, { placement, boundary, rootBoundary, padding, flipVariations, allowedAutoPlacements }) : placement);
  }, []);
  const referenceRect = state.rects.reference;
  const popperRect = state.rects.popper;
  const checksMap = new Map();
  let makeFallbackChecks = true;
  let firstFittingPlacement = placements[0];

  for (let i = 0; i < placements.length; i++) {
    const placement = placements[i];

    const _basePlacement = getBasePlacement(placement);

    const isStartVariation = getVariation(placement) === start;
    const isVertical = [top, bottom].includes(_basePlacement);
    const len = isVertical ? 'width' : 'height';
    const overflow = detectOverflow(state, {
      placement,
      boundary,
      rootBoundary,
      altBoundary,
      padding
    });
    const mainVariationSide = isVertical ? (isStartVariation ? right : left) : (isStartVariation ? bottom : top);
    if (referenceRect[len] > popperRect[len]) {
      mainVariationSide = getOppositePlacement(mainVariationSide);
    }
    const altVariationSide = getOppositePlacement(mainVariationSide);
    const checks = [];
    if (checkMainAxis) {
      checks.push(overflow[_basePlacement] <= 0);
    }
    if (checkAltAxis) {
      checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);
    }
    if (checks.every(check => check)) {
      firstFittingPlacement = placement;
      makeFallbackChecks = false;
      break;
    }
    checksMap.set(placement, checks);
  }

  if (makeFallbackChecks) {
    const numberOfChecks = flipVariations ? 3 : 1;

    for (let i = numberOfChecks; i > 0; i--) {
      const fittingPlacement = placements.find(placement => {
        const checks = checksMap.get(placement);
        return checks ? checks.slice(0, i).every(check => check) : false;
      });

      if (fittingPlacement) {
        firstFittingPlacement = fittingPlacement;
        break;
      }
    }
  }

  if (state.placement !== firstFittingPlacement) {
    state.modifiersData[name]._skip = true;
    state.placement = firstFittingPlacement;
    state.reset = true;
  }
}

const flip$1 = {
  name: 'flip',
  enabled: true,
  phase: 'main',
  fn: flip,
  requiresIfExists: ['offset'],
  data: { _skip: false }
};

function getAltAxis(axis) {
  return axis === 'x' ? 'y' : 'x';
}

function within(min, value, max) {
  return Math.max(min, Math.min(value, max));
}

function preventOverflow({ state, options, name }) {
  const { mainAxis: checkMainAxis = true, altAxis: checkAltAxis = false, boundary, rootBoundary, altBoundary, padding, tether = true, tetherOffset = 0 } = options;
  const overflow = detectOverflow(state, {
    boundary,
    rootBoundary,
    padding,
    altBoundary
  });
  const basePlacement = getBasePlacement(state.placement);
  const variation = getVariation(state.placement);
  const isBasePlacement = !variation;
  const mainAxis = getMainAxisFromPlacement(basePlacement);
  const altAxis = getAltAxis(mainAxis);
  const popperOffsets = state.modifiersData.popperOffsets;
  const referenceRect = state.rects.reference;
  const popperRect = state.rects.popper;
  const tetherOffsetValue = typeof tetherOffset === 'function' ? tetherOffset({ ...state.rects, placement: state.placement }) : tetherOffset;
  const data = { x: 0, y: 0 };

  if (!popperOffsets) {
    return;
  }

  if (checkMainAxis) {
    const mainSide = mainAxis === 'y' ? top : left;
    const altSide = mainAxis === 'y' ? bottom : right;
    const len = mainAxis === 'y' ? 'height' : 'width';
    const offset = popperOffsets[mainAxis];
    const min = popperOffsets[mainAxis] + overflow[mainSide];
    const max = popperOffsets[mainAxis] - overflow[altSide];
    const additive = tether ? -popperRect[len] / 2 : 0;
    const minLen = variation === start ? referenceRect[len] : popperRect[len];
    const maxLen = variation === start ? -popperRect[len] : -referenceRect[len];
    const arrowElement = state.elements.arrow;
    const arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : { width: 0, height: 0 };
    const arrowPaddingObject = state.modifiersData['arrow#persistent'] ? state.modifiersData['arrow#persistent'].padding : getFreshSideObject();
    const arrowPaddingMin = arrowPaddingObject[mainSide];
    const arrowPaddingMax = arrowPaddingObject[altSide];
    const arrowLen = within(0, referenceRect[len], arrowRect[len]);
    const minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - tetherOffsetValue : minLen - arrowLen - arrowPaddingMin - tetherOffsetValue;
    const maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + tetherOffsetValue : maxLen + arrowLen + arrowPaddingMax + tetherOffsetValue;
    const arrowOffsetParent = state.elements.arrow ? getOffsetParent(state.elements.arrow) : null;
    const clientOffset = arrowOffsetParent ? mainAxis === 'y' ? arrowOffsetParent.clientTop || 0 : arrowOffsetParent.clientLeft || 0 : 0;
    const offsetModifierValue = state.modifiersData.offset ? state.modifiersData.offset[state.placement][mainAxis] : 0;
    const tetherMin = popperOffsets[mainAxis] + minOffset - offsetModifierValue - clientOffset;
    const tetherMax = popperOffsets[mainAxis] + maxOffset - offsetModifierValue;
    const preventedOffset = within(tether ? Math.min(min, tetherMin) : min, offset, tether ? Math.max(max, tetherMax) : max);
    popperOffsets[mainAxis] = preventedOffset;
    data[mainAxis] = preventedOffset - offset;
  }

  if (checkAltAxis) {
    const mainSide = mainAxis === 'x' ? top : left;
    const altSide = mainAxis === 'x' ? bottom : right;
    const offset = popperOffsets[altAxis];
    const min = offset + overflow[mainSide];
    const max = offset - overflow[altSide];
    const preventedOffset = within(min, offset, max);
    popperOffsets[altAxis] = preventedOffset;
    data[altAxis] = preventedOffset - offset;
  }

  state.modifiersData[name] = data;
}

const preventOverflow$1 = {
  name: 'preventOverflow',
  enabled: true,
  phase: 'main',
  fn: preventOverflow,
  requiresIfExists: ['offset']
};

function arrow({ state, name }) {
  const arrowElement = state.elements.arrow;
  const popperOffsets = state.modifiersData.popperOffsets;
  const basePlacement = getBasePlacement(state.placement);
  const axis = getMainAxisFromPlacement(basePlacement);
  const isVertical = [left, right].includes(basePlacement);
  const len = isVertical ? 'height' : 'width';

  if (!arrowElement || !popperOffsets) {
    return;
  }

  const paddingObject = state.modifiersData[`${name}#persistent`].padding;
  const arrowRect = getLayoutRect(arrowElement);
  const minProp = axis === 'y' ? top : left;
  const maxProp = axis === 'y' ? bottom : right;
  const endDiff = state.rects.reference[len] + state.rects.reference[axis] - popperOffsets[axis] - state.rects.popper[len];
  const startDiff = popperOffsets[axis] - state.rects.reference[axis];
  const arrowOffsetParent = getOffsetParent(arrowElement);
  const clientSize = arrowOffsetParent ? (axis === 'y' ? arrowOffsetParent.clientHeight || 0 : arrowOffsetParent.clientWidth || 0) : 0;
  const centerToReference = endDiff / 2 - startDiff / 2;
  const min = paddingObject[minProp];
  const max = clientSize - arrowRect[len] - paddingObject[maxProp];
  const center = clientSize / 2 - arrowRect[len] / 2 + centerToReference;
  const offset = within(min, center, max);
  state.modifiersData[name] = { [axis]: offset, centerOffset: offset - center };
}

function effect$2({ state, options, name }) {
  let { element: arrowElement = '[data-popper-arrow]', padding = 0 } = options;

  if (arrowElement == null) {
    return;
  }

  if (typeof arrowElement === 'string') {
    arrowElement = state.elements.popper.querySelector(arrowElement);
    if (!arrowElement) {
      return;
    }
  }

  if (process.env.NODE_ENV !== "production") {
    if (!isHTMLElement(arrowElement)) {
      console.error([
        'Popper: "arrow" element must be an HTMLElement (not an SVGElement).',
        'To use an SVG arrow, wrap it in an HTMLElement that will be used as',
        'the arrow.'
      ].join(' '));
    }
  }

  if (!contains(state.elements.popper, arrowElement)) {
    if (process.env.NODE_ENV !== "production") {
      console.error(['Popper: "arrow" modifier\'s `element` must be a child of the popper', 'element.'].join(' '));
    }
    return;
  }

  state.elements.arrow = arrowElement;
  state.modifiersData[`${name}#persistent`] = {
    padding: mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements))
  };
}

const arrow$1 = {
  name: 'arrow',
  enabled: true,
  phase: 'main',
  fn: arrow,
  effect: effect$2,
  requires: ['popperOffsets'],
  requiresIfExists: ['preventOverflow']
};

function getSideOffsets(overflow, rect, preventedOffsets = { x: 0, y: 0 }) {
  return {
    top: overflow.top - rect.height - preventedOffsets.y,
    right: overflow.right - rect.width + preventedOffsets.x,
    bottom: overflow.bottom - rect.height + preventedOffsets.y,
    left: overflow.left - rect.width - preventedOffsets.x
  };
}

function isAnySideFullyClipped(overflow) {
  return [top, right, bottom, left].some(side => overflow[side] >= 0);
}

function hide({ state, name }) {
  const referenceRect = state.rects.reference;
  const popperRect = state.rects.popper;
  const preventedOffsets = state.modifiersData.preventOverflow;
  const referenceOverflow = detectOverflow(state, { elementContext: 'reference' });
  const popperAltOverflow = detectOverflow(state, { altBoundary: true });
  const referenceClippingOffsets = getSideOffsets(referenceOverflow, referenceRect);
  const popperEscapeOffsets = getSideOffsets(popperAltOverflow, popperRect, preventedOffsets);
  const isReferenceHidden = isAnySideFullyClipped(referenceClippingOffsets);
  const hasPopperEscaped = isAnySideFullyClipped(popperEscapeOffsets);
  state.modifiersData[name] = {
    referenceClippingOffsets,
    popperEscapeOffsets,
    isReferenceHidden,
    hasPopperEscaped
  };
  state.attributes.popper = {
    ...state.attributes.popper,
    'data-popper-reference-hidden': isReferenceHidden,
    'data-popper-escaped': hasPopperEscaped
  };
}

const hide$1 = {
  name: 'hide',
  enabled: true,
  phase: 'main',
  requiresIfExists: ['preventOverflow'],
  fn: hide
};

const defaultModifiers = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1];
const createPopper = popperGenerator({ defaultModifiers });
const defaultModifiers$1 = [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1, offset$1, flip$1, preventOverflow$1, arrow$1, hide$1];
const createPopper$1 = popperGenerator({ defaultModifiers: defaultModifiers$1 });

exports.applyStyles = applyStyles$1;
exports.arrow = arrow$1;
exports.computeStyles = computeStyles$1;
exports.createPopper = createPopper$1;
exports.createPopperLite = createPopper;
exports.defaultModifiers = defaultModifiers$1;
exports.detectOverflow = detectOverflow;
exports.eventListeners = eventListeners;
exports.flip = flip$1;
exports.hide = hide$1;
exports.offset = offset$1;
exports.popperGenerator = popperGenerator;
exports.popperOffsets = popperOffsets$1;
exports.preventOverflow = preventOverflow$1;
