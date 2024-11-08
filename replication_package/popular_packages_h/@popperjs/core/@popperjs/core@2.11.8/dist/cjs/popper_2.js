'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function getWindow(node) {
  return node ? (node.toString() === '[object Window]' ? node : (node.ownerDocument ? node.ownerDocument.defaultView || window : window)) : window;
}

function isElement(node) {
  return node instanceof (getWindow(node).Element) || node instanceof Element;
}

function isHTMLElement(node) {
  return node instanceof (getWindow(node).HTMLElement) || node instanceof HTMLElement;
}

function isShadowRoot(node) {
  return typeof ShadowRoot !== 'undefined' && (node instanceof (getWindow(node).ShadowRoot) || node instanceof ShadowRoot);
}

const { max, min, round } = Math;

function getUAString() {
  const { userAgentData } = navigator;
  return userAgentData && userAgentData.brands && Array.isArray(userAgentData.brands)
    ? userAgentData.brands.map(item => `${item.brand}/${item.version}`).join(' ')
    : navigator.userAgent;
}

function isLayoutViewport() {
  return !/^((?!chrome|android).)*safari/i.test(getUAString());
}

function getBoundingClientRect(element, includeScale = false, isFixedStrategy = false) {
  const clientRect = element.getBoundingClientRect();
  let scaleX = 1, scaleY = 1;
  if (includeScale && isHTMLElement(element)) {
    scaleX = element.offsetWidth > 0 ? round(clientRect.width) / element.offsetWidth || 1 : 1;
    scaleY = element.offsetHeight > 0 ? round(clientRect.height) / element.offsetHeight || 1 : 1;
  }
  const visualViewport = (isElement(element) ? getWindow(element) : window).visualViewport;
  const addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
  const x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
  const y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;
  return { width: clientRect.width / scaleX, height: clientRect.height / scaleY, top: y, right: x + clientRect.width / scaleX, bottom: y + clientRect.height / scaleY, left: x, x, y };
}

function getWindowScroll(node) {
  const win = getWindow(node);
  return { scrollLeft: win.pageXOffset, scrollTop: win.pageYOffset };
}

function getHTMLElementScroll(element) {
  return { scrollLeft: element.scrollLeft, scrollTop: element.scrollTop };
}

function getNodeScroll(node) {
  return (node === getWindow(node) || !isHTMLElement(node)) ? getWindowScroll(node) : getHTMLElementScroll(node);
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

function isElementScaled(element) {
  const rect = element.getBoundingClientRect();
  const scaleX = round(rect.width) / element.offsetWidth || 1;
  const scaleY = round(rect.height) / element.offsetHeight || 1;
  return scaleX !== 1 || scaleY !== 1;
}

function getCompositeRect(elementOrVirtualElement, offsetParent, isFixed = false) {
  const isOffsetParentAnElement = isHTMLElement(offsetParent);
  const offsetParentIsScaled = isHTMLElement(offsetParent) && isElementScaled(offsetParent);
  const documentElement = getDocumentElement(offsetParent);
  const rect = getBoundingClientRect(elementOrVirtualElement, offsetParentIsScaled, isFixed);
  let { scrollLeft: scrollLeft = 0, scrollTop: scrollTop = 0 } = {};
  let { x: offsetsX = 0, y: offsetsY = 0 } = {};

  if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
    if (getNodeName(offsetParent) !== 'body' || isScrollParent(documentElement)) {
      ({ scrollLeft, scrollTop } = getNodeScroll(offsetParent));
    }
    if (isHTMLElement(offsetParent)) {
      const offsets = getBoundingClientRect(offsetParent, true);
      offsetsX = offsets.x + offsetParent.clientLeft;
      offsetsY = offsets.y + offsetParent.clientTop;
    } else if (documentElement) {
      offsetsX = getWindowScrollBarX(documentElement);
    }
  }

  return { x: rect.left + scrollLeft - offsetsX, y: rect.top + scrollTop - offsetsY, width: rect.width, height: rect.height };
}

function getLayoutRect(element) {
  let { width, height } = element.getBoundingClientRect();
  if (Math.abs(width - element.offsetWidth) <= 1) width = element.offsetWidth;
  if (Math.abs(height - element.offsetHeight) <= 1) height = element.offsetHeight;
  return { x: element.offsetLeft, y: element.offsetTop, width, height };
}

function getParentNode(element) {
  return getNodeName(element) === 'html' 
    ? element 
    : element.assignedSlot || element.parentNode || (isShadowRoot(element) ? element.host : null) || getDocumentElement(element);
}

function getScrollParent(node) {
  if (['html', 'body', '#document'].indexOf(getNodeName(node)) >= 0) {
    return node.ownerDocument.body;
  }
  return isHTMLElement(node) && isScrollParent(node) ? node : getScrollParent(getParentNode(node));
}

function listScrollParents(element, list = []) {
  const scrollParent = getScrollParent(element);
  const isBody = scrollParent === (element.ownerDocument?.body);
  const win = getWindow(scrollParent);
  const target = isBody ? [win, ...(win.visualViewport ? [win.visualViewport] : []), isScrollParent(scrollParent) ? scrollParent : []] : scrollParent;
  return isBody ? list.concat(target) : list.concat(listScrollParents(getParentNode(target)));
}

function isTableElement(element) {
  return ['table', 'td', 'th'].includes(getNodeName(element));
}

function getTrueOffsetParent(element) {
  return !isHTMLElement(element) || getComputedStyle(element).position === 'fixed' ? null : element.offsetParent;
}

function getContainingBlock(element) {
  const isFirefox = /firefox/i.test(getUAString());
  const isIE = /Trident/i.test(getUAString());

  if (isIE && isHTMLElement(element)) {
    const css = getComputedStyle(element);
    if (css.position === 'fixed') return null;
  }
  
  let currentNode = getParentNode(element);
  if (isShadowRoot(currentNode)) currentNode = currentNode.host;

  while (isHTMLElement(currentNode) && !['html', 'body'].includes(getNodeName(currentNode))) {
    const css = getComputedStyle(currentNode);
    if (css.transform !== 'none' || css.perspective !== 'none' || css.contain === 'paint' ||
        ['transform', 'perspective'].includes(css.willChange) || 
        (isFirefox && css.willChange === 'filter') || 
        (isFirefox && css.filter && css.filter !== 'none')) 
    {
      return currentNode;
    }
    currentNode = currentNode.parentNode;
  }
  return null;
}

function getOffsetParent(element) {
  const offsetParent = getTrueOffsetParent(element);
  const win = getWindow(element);

  while (offsetParent && isTableElement(offsetParent) && getComputedStyle(offsetParent).position === 'static') {
    offsetParent = getTrueOffsetParent(offsetParent);
  }

  return offsetParent && ['html', 'body'].includes(getNodeName(offsetParent)) && getComputedStyle(offsetParent).position === 'static'
    ? win
    : offsetParent || getContainingBlock(element) || win;
}

const basePlacements = ['top', 'bottom', 'right', 'left'];
const variationPlacements = basePlacements.reduce((acc, placement) => acc.concat([`${placement}-start`, `${placement}-end`]), []);
const placements = [...basePlacements, 'auto'].reduce((acc, placement) => acc.concat([placement, `${placement}-start`, `${placement}-end`]), []);
const modifierPhases = ['beforeRead', 'read', 'afterRead', 'beforeMain', 'main', 'afterMain', 'beforeWrite', 'write', 'afterWrite'];

function order(modifiers) {
  const map = new Map();
  const visited = new Set();
  const result = [];

  modifiers.forEach(modifier => map.set(modifier.name, modifier));

  function sort(modifier) {
    visited.add(modifier.name);
    const requires = (modifier.requires || []).concat(modifier.requiresIfExists || []);
    requires.forEach(dep => {
      if (!visited.has(dep)) {
        const depModifier = map.get(dep);
        if (depModifier) sort(depModifier);
      }
    });
    result.push(modifier);
  }

  modifiers.forEach(modifier => {
    if (!visited.has(modifier.name)) sort(modifier);
  });

  return result;
}

function orderModifiers(modifiers) {
  const orderedModifiers = order(modifiers);
  return modifierPhases.reduce((acc, phase) => acc.concat(orderedModifiers.filter(modifier => modifier.phase === phase)), []);
}

function debounce(fn) {
  let pending;
  return function () {
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

function mergeByName(modifiers) {
  const merged = modifiers.reduce((acc, current) => {
    const existing = acc[current.name];
    acc[current.name] = existing ? { ...existing, ...current, options: { ...existing.options, ...current.options }, data: { ...existing.data, ...current.data } } : current;
    return acc;
  }, {});

  return Object.keys(merged).map(key => merged[key]);
}

function getViewportRect(element, strategy) {
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
    const layoutViewport = isLayoutViewport();

    if (layoutViewport || (!layoutViewport && strategy === 'fixed')) {
      x = visualViewport.offsetLeft;
      y = visualViewport.offsetTop;
    }
  }

  return { width, height, x: x + getWindowScrollBarX(element), y };
}

function getDocumentRect(element) {
  const html = getDocumentElement(element);
  const winScroll = getWindowScroll(element);
  const body = element.ownerDocument?.body;
  const width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
  const height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
  const x = -winScroll.scrollLeft + getWindowScrollBarX(element);
  const y = -winScroll.scrollTop;

  if (getComputedStyle(body || html).direction === 'rtl') {
    const clientWidth = max(html.clientWidth, body ? body.clientWidth : 0);
    x += clientWidth - width;
  }

  return { width, height, x, y };
}

function contains(parent, child) {
  const rootNode = child.getRootNode && child.getRootNode();
  if (parent.contains(child)) return true;
  if (rootNode && isShadowRoot(rootNode)) {
    let next = child;
    while (next) {
      if (parent.isSameNode(next)) return true;
      next = next.parentNode || next.host;
    }
  }
  return false;
}

function rectToClientRect(rect) {
  return { ...rect, left: rect.x, top: rect.y, right: rect.x + rect.width, bottom: rect.y + rect.height };
}

function getInnerBoundingClientRect(element, strategy) {
  const rect = getBoundingClientRect(element, false, strategy === 'fixed');
  rect.top += element.clientTop;
  rect.left += element.clientLeft;
  rect.bottom = rect.top + element.clientHeight;
  rect.right = rect.left + element.clientWidth;
  rect.width = element.clientWidth;
  rect.height = element.clientHeight;
  return { ...rect, x: rect.left, y: rect.top };
}

function getClientRectFromMixedType(element, clippingParent, strategy) {
  return clippingParent === 'viewport' ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
}

function getClippingParents(element) {
  const clippingParents = listScrollParents(getParentNode(element));
  const canEscapeClipping = ['absolute', 'fixed'].includes(getComputedStyle(element).position);
  const clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;

  if (!isElement(clipperElement)) {
    return [];
  }

  return clippingParents.filter(clippingParent => isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== 'body');
}

function getClippingRect(element, boundary, rootBoundary, strategy) {
  const mainClippingParents = boundary === 'clippingParents' ? getClippingParents(element) : [boundary];
  const clippingParents = [...mainClippingParents, rootBoundary];
  const firstClippingParent = clippingParents[0];
  const clippingRect = clippingParents.reduce((accRect, clippingParent) => {
    const rect = getClientRectFromMixedType(element, clippingParent, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromMixedType(element, firstClippingParent, strategy));

  clippingRect.width = clippingRect.right - clippingRect.left;
  clippingRect.height = clippingRect.bottom - clippingRect.top;
  clippingRect.x = clippingRect.left;
  clippingRect.y = clippingRect.top;
  return clippingRect;
}

function getBasePlacement(placement) {
  return placement.split('-')[0];
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
    case 'top':
      offsets = { x: commonX, y: reference.y - element.height };
      break;
    case 'bottom':
      offsets = { x: commonX, y: reference.y + reference.height };
      break;
    case 'right':
      offsets = { x: reference.x + reference.width, y: commonY };
      break;
    case 'left':
      offsets = { x: reference.x - element.width, y: commonY };
      break;
    default:
      offsets = { x: reference.x, y: reference.y };
  }

  const mainAxis = basePlacement ? getMainAxisFromPlacement(basePlacement) : null;
  if (mainAxis) {
    const len = mainAxis === 'y' ? 'height' : 'width';
    switch (variation) {
      case 'start':
        offsets[mainAxis] = offsets[mainAxis] - (reference[len] / 2 - element[len] / 2);
        break;
      case 'end':
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
  const { placement = state.placement, strategy = state.strategy, boundary = 'clippingParents', rootBoundary = 'viewport',
    elementContext = 'popper', altBoundary = false, padding = 0 } = options;

  const paddingObject = mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
  const altContext = elementContext === 'popper' ? 'reference' : 'popper';
  const popperRect = state.rects.popper;
  const element = state.elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
  const referenceClientRect = getBoundingClientRect(state.elements.reference);
  const popperOffsets = computeOffsets({ reference: referenceClientRect, element: popperRect, strategy: 'absolute', placement });
  const popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets));
  const elementClientRect = elementContext === 'popper' ? popperClientRect : referenceClientRect;

  const overflowOffsets = {
    top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
    bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
    left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
    right: elementClientRect.right - clippingClientRect.right + paddingObject.right
  };

  if (elementContext === 'popper' && state.modifiersData.offset) {
    const offset = state.modifiersData.offset[placement];
    Object.keys(overflowOffsets).forEach((key) => {
      const multiply = ['right', 'bottom'].includes(key) ? 1 : -1;
      const axis = ['top', 'bottom'].includes(key) ? 'y' : 'x';
      overflowOffsets[key] += (offset[axis] || 0) * multiply;
    });
  }

  return overflowOffsets;
}

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
      options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions, options),
      modifiersData: {},
      elements: { reference, popper },
      attributes: {},
      styles: {}
    };

    let effectCleanupFns = [];
    let isDestroyed = false;

    const instance = {
      state,
      setOptions(setOptionsAction) {
        const options = typeof setOptionsAction === 'function' ? setOptionsAction(state.options) : setOptionsAction;
        cleanupModifierEffects();
        state.options = Object.assign({}, defaultOptions, state.options, options);
        state.scrollParents = {
          reference: isElement(reference) ? listScrollParents(reference) : reference.contextElement ? listScrollParents(reference.contextElement) : [],
          popper: listScrollParents(popper)
        };
        state.orderedModifiers = orderModifiers(mergeByName([...defaultModifiers, ...state.options.modifiers]));
        state.orderedModifiers = state.orderedModifiers.filter(m => m.enabled);
        runModifierEffects();
        return instance.update();
      },
      forceUpdate() {
        if (isDestroyed) return;

        const { reference, popper } = state.elements;

        if (!areValidElements(reference, popper)) return;

        state.rects = {
          reference: getCompositeRect(reference, getOffsetParent(popper), state.options.strategy === 'fixed'),
          popper: getLayoutRect(popper)
        };

        state.reset = false;
        state.placement = state.options.placement;

        state.orderedModifiers.forEach(modifier => {
          state.modifiersData[modifier.name] = Object.assign({}, modifier.data);
        });

        for (let index = 0; index < state.orderedModifiers.length; index++) {
          if (state.reset === true) {
            state.reset = false;
            index = -1;
            continue;
          }

          const { fn, options: modifierOptions = {}, name } = state.orderedModifiers[index];
          if (typeof fn === 'function') {
            state = fn({ state, options: modifierOptions, name, instance }) || state;
          }
        }
      },
      update: debounce(() => new Promise((resolve) => {
        instance.forceUpdate();
        resolve(state);
      })),
      destroy() {
        cleanupModifierEffects();
        isDestroyed = true;
      }
    };

    if (!areValidElements(reference, popper)) {
      return instance;
    }

    instance.setOptions(options).then((state) => {
      if (!isDestroyed && options.onFirstUpdate) {
        options.onFirstUpdate(state);
      }
    });

    function runModifierEffects() {
      state.orderedModifiers.forEach(({ name, options = {}, effect }) => {
        if (typeof effect === 'function') {
          const cleanupFn = effect({ state, name, instance, options });
          effectCleanupFns.push(cleanupFn || (() => {}));
        }
      });
    }

    function cleanupModifierEffects() {
      effectCleanupFns.forEach(fn => fn());
      effectCleanupFns = [];
    }

    return instance;
  };
}

const passive = { passive: true };

function effect$2({ state, instance, options }) {
  const { scroll = true, resize = true } = options;
  const win = getWindow(state.elements.popper);
  const scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);

  if (scroll) {
    scrollParents.forEach(scrollParent => {
      scrollParent.addEventListener('scroll', instance.update, passive);
    });
  }

  if (resize) {
    win.addEventListener('resize', instance.update, passive);
  }

  return function () {
    if (scroll) {
      scrollParents.forEach(scrollParent => {
        scrollParent.removeEventListener('scroll', instance.update, passive);
      });
    }

    if (resize) {
      win.removeEventListener('resize', instance.update, passive);
    }
  };
}

export const eventListeners = {
  name: 'eventListeners',
  enabled: true,
  phase: 'write',
  fn() {},
  effect: effect$2,
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

export const popperOffsets = {
  name: 'popperOffsets',
  enabled: true,
  phase: 'read',
  fn: popperOffsets,
  data: {}
};

const unsetSides = { top: 'auto', right: 'auto', bottom: 'auto', left: 'auto' };

function roundOffsetsByDPR({ x, y }, win) {
  const dpr = win.devicePixelRatio || 1;
  return { x: round(x * dpr) / dpr || 0, y: round(y * dpr) / dpr || 0 };
}

function mapToStyles({ popper, popperRect, placement, variation, offsets, position, gpuAcceleration, adaptive, roundOffsets, isFixed }) {
  let { x = 0, y = 0 } = offsets;
  const { x: roundedX, y: roundedY } = typeof roundOffsets === 'function' ? roundOffsets({ x, y }) : { x, y };
  x = roundedX;
  y = roundedY;

  let hasX = offsets.hasOwnProperty('x');
  let hasY = offsets.hasOwnProperty('y');
  let sideX = 'left';
  let sideY = 'top';
  const win = window;

  if (adaptive) {
    let offsetParent = getOffsetParent(popper);
    let heightProp = 'clientHeight';
    let widthProp = 'clientWidth';

    if (offsetParent === getWindow(popper)) {
      offsetParent = getDocumentElement(popper);

      if (getComputedStyle(offsetParent).position !== 'static' && position === 'absolute') {
        heightProp = 'scrollHeight';
        widthProp = 'scrollWidth';
      }
    }

    if (placement === 'top' || (placement === 'left' || placement === 'right') && variation === 'end') {
      sideY = 'bottom';
      y -= (isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : offsetParent[heightProp]) - popperRect.height;
      y *= gpuAcceleration ? 1 : -1;
    }
    if (placement === 'left' || (placement === 'top' || placement === 'bottom') && variation === 'end') {
      sideX = 'right';
      x -= (isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : offsetParent[widthProp]) - popperRect.width;
      x *= gpuAcceleration ? 1 : -1;
    }
  }

  const commonStyles = Object.assign({ position }, adaptive && unsetSides);

  return gpuAcceleration
    ? Object.assign(commonStyles, { [sideY]: hasY ? '0' : '', [sideX]: hasX ? '0' : '', transform: (win.devicePixelRatio || 1) <= 1 ? `translate(${x}px, ${y}px)` : `translate3d(${x}px, ${y}px, 0)` })
    : Object.assign(commonStyles, { [sideY]: hasY ? `${y}px` : '', [sideX]: hasX ? `${x}px` : '', transform: '' });
}

function computeStyles({ state, options }) {
  const { gpuAcceleration = true, adaptive = true, roundOffsets = true } = options;
  const commonStyles = { placement: getBasePlacement(state.placement), variation: getVariation(state.placement), popper: state.elements.popper, popperRect: state.rects.popper, gpuAcceleration, isFixed: state.options.strategy === 'fixed' };

  if (state.modifiersData.popperOffsets != null) {
    state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, { offsets: state.modifiersData.popperOffsets, position: state.options.strategy, adaptive, roundOffsets })));
  }
  if (state.modifiersData.arrow != null) {
    state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, { offsets: state.modifiersData.arrow, position: 'absolute', adaptive: false, roundOffsets })));
  }

  state.attributes.popper = Object.assign({}, state.attributes.popper, { 'data-popper-placement': state.placement });
}

export const computeStyles = {
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

    if (!isHTMLElement(element) || !getNodeName(element)) return;

    Object.assign(element.style, style);
    Object.keys(attributes).forEach(name => {
      const value = attributes[name];
      value === false ? element.removeAttribute(name) : element.setAttribute(name, value === true ? '' : value);
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
  state.styles = initialStyles;

  if (state.elements.arrow) {
    Object.assign(state.elements.arrow.style, initialStyles.arrow);
  }

  return function () {
    Object.keys(state.elements).forEach(name => {
      const element = state.elements[name];
      const attributes = state.attributes[name] || {};
      const styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]);
      const style = styleProperties.reduce((style, property) => (style[property] = '', style), {});

      if (!isHTMLElement(element) || !getNodeName(element)) return;

      Object.assign(element.style, style);
      Object.keys(attributes).forEach(attribute => {
        element.removeAttribute(attribute);
      });
    });
  };
}

export const applyStyles = {
  name: 'applyStyles',
  enabled: true,
  phase: 'write',
  fn: applyStyles,
  effect: effect$1,
  requires: ['computeStyles']
};

function distanceAndSkiddingToXY(placement, rects, offset) {
  const basePlacement = getBasePlacement(placement);
  const invertDistance = ['left', 'top'].includes(basePlacement) ? -1 : 1;
  const [skidding, distance] = typeof offset === 'function' ? offset(Object.assign({}, rects, { placement })) : offset;
  const skiddingOffset = skidding || 0;
  const distanceOffset = (distance || 0) * invertDistance;

  return ['left', 'right'].includes(basePlacement) ? { x: distanceOffset, y: skiddingOffset } : { x: skiddingOffset, y: distanceOffset };
}

function offset({ state, options, name }) {
  const offset = options.offset || [0, 0];
  const data = placements.reduce((acc, placement) => {
    acc[placement] = distanceAndSkiddingToXY(placement, state.rects, offset);
    return acc;
  }, {});

  const { x, y } = data[state.placement];

  if (state.modifiersData.popperOffsets) {
    state.modifiersData.popperOffsets.x += x;
    state.modifiersData.popperOffsets.y += y;
  }

  state.modifiersData[name] = data;
}

export const offset = {
  name: 'offset',
  enabled: true,
  phase: 'main',
  requires: ['popperOffsets'],
  fn: offset
};

function getOppositePlacement(placement) {
  const hash = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' };
  return placement.replace(/left|right|bottom|top/g, matched => hash[matched]);
}

function getOppositeVariationPlacement(placement) {
  const hash = { start: 'end', end: 'start' };
  return placement.replace(/start|end/g, matched => hash[matched]);
}

function computeAutoPlacement(state, options = {}) {
  const { placement, boundary, rootBoundary, padding, flipVariations, allowedAutoPlacements = placements } = options;
  const variation = getVariation(placement);
  const placementsList = variation ? (flipVariations ? variationPlacements : variationPlacements.filter(plc => getVariation(plc) === variation)) : basePlacements;
  let allowedPlacements = placementsList.filter(plc => allowedAutoPlacements.includes(plc));

  if (!allowedPlacements.length) {
    console.error(['Popper: The `allowedAutoPlacements` option did not allow any', 'placements. Ensure that it matches the variation of the allowed placements'].join(' '));
    allowedPlacements = placementsList;
  }

  const overflows = allowedPlacements.reduce((acc, plc) => {
    acc[plc] = detectOverflow(state, { placement: plc, boundary, rootBoundary, padding })[getBasePlacement(plc)];
    return acc;
  }, {});

  return Object.keys(overflows).sort((a, b) => overflows[a] - overflows[b]);
}

function getExpandedFallbackPlacements(placement) {
  if (getBasePlacement(placement) === 'auto') return [];
  const oppositePlacement = getOppositePlacement(placement);
  return [getOppositeVariationPlacement(placement), oppositePlacement, getOppositeVariationPlacement(oppositePlacement)];
}

function flip({ state, options, name }) {
  if (state.modifiersData[name]._skip) {
    return;
  }

  const { mainAxis = true, altAxis = true, fallbackPlacements, padding, boundary, rootBoundary, altBoundary, flipVariations = true, allowedAutoPlacements } = options;
  const preferredPlacement = state.options.placement;
  const basePlacement = getBasePlacement(preferredPlacement);
  const isBasePlacement = basePlacement === preferredPlacement;
  const flipFallbackPlacements = fallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
  const allPlacements = [preferredPlacement, ...flipFallbackPlacements].reduce((acc, placement) => acc.concat(getBasePlacement(placement) === 'auto' ? computeAutoPlacement(state, { placement, boundary, rootBoundary, padding, flipVariations, allowedAutoPlacements }) : placement), []);
  const referenceRect = state.rects.reference;
  const popperRect = state.rects.popper;

  let firstFittingPlacement = allPlacements[0];
  let makeFallbackChecks = true;
  const checksMap = new Map();

  for (let i = 0; i < allPlacements.length; i++) {
    const placement = allPlacements[i];
    const basePlc = getBasePlacement(placement);
    const isStartVar = getVariation(placement) === 'start';
    const isVertical = ['top', 'bottom'].includes(basePlc);
    const len = isVertical ? 'width' : 'height';
    const overflow = detectOverflow(state, { placement, boundary, rootBoundary, altBoundary, padding });

    if (referenceRect[len] > popperRect[len]) {
      checksMap.set(placement, [overflow[basePlc], overflow[getOppositePlacement(getBasePlacement(placement))]]);
    }

    if (!checksMap.get(placement).every(val => val <= 0)) {
      checksMap.set(placement, [Infinity, Infinity, Infinity]);
      break;
    }

    firstFittingPlacement = placement;
    makeFallbackChecks = false;
    break;
  }

  if (makeFallbackChecks) {
    for (var i = (flipVariations ? 3 : 1); i > 0; i--) {
      const fittingPlacement = allPlacements.find(placement => {
        const checks = checksMap.get(placement);
        return checks
          && checks.slice(0, i).every(check => check >= 0);
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

export const flip = {
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
  return max(min, min(value, max));
}

function withinMaxClamp(min, value, max) {
  const v = within(min, value, max);
  return v > max ? max : v;
}

function preventOverflow({ state, options, name }) {
  const { mainAxis = true, altAxis = false, boundary, rootBoundary, altBoundary, padding, tether = true, tetherOffset = 0 } = options;
  const overflow = detectOverflow(state, { boundary, rootBoundary, padding, altBoundary });

  const basePlacement = getBasePlacement(state.placement);
  const variation = getVariation(state.placement);
  const isBasePlacement = !variation;
  const mainAxis = getMainAxisFromPlacement(basePlacement);
  const altAxis = getAltAxis(mainAxis);
  const popperOffsets = state.modifiersData.popperOffsets;
  const referenceRect = state.rects.reference;
  const popperRect = state.rects.popper;
  const tetherOffsetValue = typeof tetherOffset === 'function' ? tetherOffset({ ...state.rects, placement: state.placement }) : tetherOffset;
  const normalizedTetherOffsetValue = typeof tetherOffsetValue === 'number' ? { mainAxis: tetherOffsetValue, altAxis: tetherOffsetValue } : { ...tetherOffsetValue };

  const offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;
  const data = { x: 0, y: 0 };

  if (!popperOffsets) return;

  if (mainAxis) {
    const mainSide = mainAxis === 'y' ? 'top' : 'left';
    const altSide = mainAxis === 'y' ? 'bottom' : 'right';
    const len = mainAxis === 'y' ? 'height' : 'width';
    const offset = popperOffsets[mainAxis];
    const min = offset + overflow[mainSide];
    const max = offset - overflow[altSide];
    const additive = tether ? -popperRect[len] / 2 : 0;
    const minLen = variation === 'start' ? referenceRect[len] : popperRect[len];
    const maxLen = variation === 'start' ? -popperRect[len] : -referenceRect[len];

    const arrowPaddingMin = (state.modifiersData['arrow#persistent'] ? state.modifiersData['arrow#persistent'].padding : getFreshSideObject())[mainSide];
    const arrowPaddingMax = (state.modifiersData['arrow#persistent'] ? state.modifiersData['arrow#persistent'].padding : getFreshSideObject())[altSide];

    const arrowElement = (state.elements.arrow || getOffsetParent(offsetModifierState.arrowOffsetParent));
    const clientOffset = (arrowElement && (mainAxis === 'y' ? arrowElement.clientTop || 0 : arrowElement.clientLeft || 0)) || 0;

    const arrowLen = within(0, referenceRect[len], (arrowElement || {}).len || 0);
    const minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
    const maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;
    const popperOffsetValue = (offsetModifierState ? offsetModifierState.mainAxis || 0 : 0);
    const tetherMin = (offset + minOffset - popperOffsetValue - clientOffset);
    const tetherMax = (offset + maxOffset - popperOffsetValue);
    const preventedOffset = within(tether ? min(min, tetherMin) : min, offset, tether ? max(max, tetherMax) : max);

    popperOffsets[mainAxis] = preventedOffset;
    data[mainAxis] = preventedOffset - offset;
  }

  if (altAxis) {
    const mainSideAlt = mainAxis === 'x' ? 'top' : 'left';
    const altSideAlt = mainAxis === 'x' ? 'bottom' : 'right';
    const lenAlt = altAxis === 'y' ? 'height' : 'width';
    const offsetAlt = popperOffsets[altAxis];
    const minAlt = offsetAlt + overflow[mainSideAlt];
    const maxAlt = offsetAlt - overflow[altSideAlt];
    const isOriginSide = [mainSideAlt, mainSideAlt === 'right' ? 'left' : 'right'].includes(basePlacement);
    const altSide = mainAxis === 'y' ? 'height' : 'width';
    const baseOffset = (offsetModifierState ? offsetModifierState.altAxis || 0 : 0);
    const offsetClient = ((arrowElement = null) && arrowElement.clientLeft || 0);
    const minOffsetAlt = isOriginSide ? minAlt : offsetAlt - referenceRect[lenAlt] - popperRect[lenAlt] - baseOffset + normalizedTetherOffsetValue.altAxis;
    const maxOffsetAlt = isOriginSide ? offsetAlt + referenceRect[lenAlt] + popperRect[lenAlt] - baseOffset - normalizedTetherOffsetValue.altAxis : maxAlt;

    const offsetOldAlt = withinMaxClamp(minOffsetAlt, offsetAlt, maxOffsetAlt);
    const preventedOffsetAlt = tetherAlt ? within(tether ? minOffsetAlt : minAlt, offsetOldAlt, tether ? maxOffsetAlt : maxAlt) : offsetOldAlt;

    popperOffsets[altAxis] = preventedOffsetAlt;
    data[altAxis] = preventedOffsetAlt - offsetAlt;
  }

  state.modifiersData[name] = data;
}

export const preventOverflow = {
  name: 'preventOverflow',
  enabled: true,
  phase: 'main',
  fn: preventOverflow,
  requiresIfExists: ['offset']
};

const toPaddingObject = (padding, state) => {
  padding = typeof padding === 'function' ? padding({ ...state.rects, placement: state.placement }) : padding;
  return mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
};

function arrow({ state, name, options }) {
  const arrowElement = state.elements.arrow;
  const popperOffsets = state.modifiersData.popperOffsets;
  const basePlacement = getBasePlacement(state.placement);
  const axis = getMainAxisFromPlacement(basePlacement);
  const isVertical = basePlacement === 'left' || basePlacement === 'right';

  if (!arrowElement || !popperOffsets) {
    return;
  }

  const paddingObject = toPaddingObject(options.padding, state);
  const arrowRect = getLayoutRect(arrowElement);
  const minProp = axis === 'y' ? 'top' : 'left';
  const maxProp = axis === 'y' ? 'bottom' : 'right';
  const endDiff = (state.rects.reference[axis] + state.rects.reference[isVertical ? 'height' : 'width']) - popperOffsets[axis] - state.rects.popper[isVertical ? 'height' : 'width'];
  const startDiff = popperOffsets[axis] - (state.rects.reference[axis]);
  const arrowOffsetParentRects = getOffsetParent(arrowElement);
  const clientSize = (arrowOffsetParentRects || axis === 'x' ? arrowElement.clientWidth || 0 : arrowElement.clientHeight || 0);
  const centerToReference = endDiff / 2 - startDiff / 2;
  const min = paddingObject[minProp];
  const max = clientSize - arrowRect[isVertical ? 'height' : 'width'] - paddingObject[maxProp];
  const center = clientSize / 2 - arrowRect[isVertical ? 'height' : 'width'] / 2 + centerToReference;
  const offsetCenter = within(min, center, max);
  const axisProp = axis;

  state.modifiersData[name] = { [axisProp]: offsetCenter, centerOffset: offsetCenter - center };
}

function effect({ state, options }) {
  let arrowElement = options.element || '[data-popper-arrow]';

  if (arrowElement === null) {
    return;
  }

  if (typeof arrowElement === 'string') {
    arrowElement = state.elements.popper.querySelector(arrowElement);

    if (!arrowElement) {
      return;
    }
  }

  if (!contains(state.elements.popper, arrowElement)) {
    return;
  }

  state.elements.arrow = arrowElement;
}

export const arrow = {
  name: 'arrow',
  enabled: true,
  phase: 'main',
  fn: arrow,
  effect,
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
  return ['top', 'right', 'bottom', 'left'].some(side => overflow[side] >= 0);
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

  state.modifiersData[name] = { referenceClippingOffsets, popperEscapeOffsets, isReferenceHidden, hasPopperEscaped };
  state.attributes.popper = Object.assign({}, state.attributes.popper, { 'data-popper-reference-hidden': isReferenceHidden, 'data-popper-escaped': hasPopperEscaped });
}

export const hide = {
  name: 'hide',
  enabled: true,
  phase: 'main',
  requiresIfExists: ['preventOverflow'],
  fn: hide
};

const defaultModifiers$1 = [eventListeners, popperOffsets, computeStyles, applyStyles];
const createPopper$1 = popperGenerator({ defaultModifiers: defaultModifiers$1 });

const defaultModifiers = [eventListeners, popperOffsets, computeStyles, applyStyles, offset, flip, preventOverflow, arrow, hide];
const createPopper = popperGenerator({ defaultModifiers });

export { applyStyles, arrow, computeStyles, createPopper, createPopper$1, defaultModifiers, detectOverflow, eventListeners, flip, hide, offset, popperGenerator, popperOffsets, preventOverflow };
