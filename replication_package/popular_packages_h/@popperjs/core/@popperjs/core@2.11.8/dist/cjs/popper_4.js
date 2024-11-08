'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function getWindow(node) {
  if (node == null) return window;
  if (node.toString() !== '[object Window]') {
    const ownerDocument = node.ownerDocument;
    return ownerDocument ? ownerDocument.defaultView || window : window;
  }
  return node;
}

function isElement(node) {
  const OwnElement = getWindow(node).Element;
  return node instanceof OwnElement || node instanceof Element;
}

function isHTMLElement(node) {
  const OwnElement = getWindow(node).HTMLElement;
  return node instanceof OwnElement || node instanceof HTMLElement;
}

function isShadowRoot(node) {
  if (typeof ShadowRoot === 'undefined') return false;
  const OwnElement = getWindow(node).ShadowRoot;
  return node instanceof OwnElement || node instanceof ShadowRoot;
}

function getUAString() {
  const uaData = navigator.userAgentData;
  if (uaData != null && uaData.brands && Array.isArray(uaData.brands)) {
    return uaData.brands.map(item => `${item.brand}/${item.version}`).join(' ');
  }
  return navigator.userAgent;
}

function isLayoutViewport() {
  return !/^((?!chrome|android).)*safari/i.test(getUAString());
}

function getBoundingClientRect(element, includeScale = false, isFixedStrategy = false) {
  const clientRect = element.getBoundingClientRect();
  let scaleX = 1, scaleY = 1;

  if (includeScale && isHTMLElement(element)) {
    scaleX = element.offsetWidth > 0 ? Math.round(clientRect.width) / element.offsetWidth || 1 : 1;
    scaleY = element.offsetHeight > 0 ? Math.round(clientRect.height) / element.offsetHeight || 1 : 1;
  }

  const { visualViewport } = isElement(element) ? getWindow(element) : window;
  const addVisualOffsets = !isLayoutViewport() && isFixedStrategy;
  const x = (clientRect.left + (addVisualOffsets && visualViewport ? visualViewport.offsetLeft : 0)) / scaleX;
  const y = (clientRect.top + (addVisualOffsets && visualViewport ? visualViewport.offsetTop : 0)) / scaleY;

  return {
    width: clientRect.width / scaleX,
    height: clientRect.height / scaleY,
    top: y,
    right: x + clientRect.width / scaleX,
    bottom: y + clientRect.height / scaleY,
    left: x,
    x: x,
    y: y
  };
}

function getWindowScroll(node) {
  const win = getWindow(node);
  const scrollLeft = win.pageXOffset;
  const scrollTop = win.pageYOffset;
  return { scrollLeft, scrollTop };
}

function getHTMLElementScroll(element) {
  return { scrollLeft: element.scrollLeft, scrollTop: element.scrollTop };
}

function getNodeScroll(node) {
  return node === getWindow(node) || !isHTMLElement(node) ? getWindowScroll(node) : getHTMLElementScroll(node);
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

const max = Math.max;
const min = Math.min;
const round = Math.round;

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
  let scroll = { scrollLeft: 0, scrollTop: 0 };
  let offsets = { x: 0, y: 0 };

  if (isOffsetParentAnElement || (!isOffsetParentAnElement && !isFixed)) {
    if (getNodeName(offsetParent) !== 'body') {
      scroll = getNodeScroll(offsetParent);
    }
    if (isHTMLElement(offsetParent)) {
      offsets = getBoundingClientRect(offsetParent, true);
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
  const clientRect = getBoundingClientRect(element);
  let width = element.offsetWidth;
  let height = element.offsetHeight;

  if (Math.abs(clientRect.width - width) <= 1) width = clientRect.width;
  if (Math.abs(clientRect.height - height) <= 1) height = clientRect.height;

  return { x: element.offsetLeft, y: element.offsetTop, width, height };
}

function getParentNode(element) {
  if (getNodeName(element) === 'html') return element;
  return element.assignedSlot || element.parentNode || (isShadowRoot(element) ? element.host : null) || getDocumentElement(element);
}

function getScrollParent(node) {
  if (['html', 'body', '#document'].includes(getNodeName(node))) {
    return node.ownerDocument.body;
  }
  if (isHTMLElement(node) && isScrollParent(node)) {
    return node;
  }
  return getScrollParent(getParentNode(node));
}

function listScrollParents(element, list = []) {
  const scrollParent = getScrollParent(element);
  const isBody = scrollParent === (element.ownerDocument ? element.ownerDocument.body : undefined);
  const win = getWindow(scrollParent);
  const target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
  const updatedList = list.concat(target);
  return isBody ? updatedList : updatedList.concat(listScrollParents(getParentNode(target)));
}

function isTableElement(element) {
  return ['table', 'td', 'th'].includes(getNodeName(element));
}

function getTrueOffsetParent(element) {
  if (!isHTMLElement(element) || getComputedStyle(element).position === 'fixed') {
    return null;
  }
  return element.offsetParent;
}

function getContainingBlock(element) {
  const isFirefox = /firefox/i.test(getUAString());
  const isIE = /Trident/i.test(getUAString());

  if (isIE && isHTMLElement(element)) {
    const elementCss = getComputedStyle(element);
    if (elementCss.position === 'fixed') return null;
  }

  let currentNode = getParentNode(element);
  if (isShadowRoot(currentNode)) currentNode = currentNode.host;

  while (isHTMLElement(currentNode) && !['html', 'body'].includes(getNodeName(currentNode))) {
    const css = getComputedStyle(currentNode);
    if (css.transform !== 'none' || css.perspective !== 'none' || css.contain === 'paint' || ['transform', 'perspective'].includes(css.willChange) || isFirefox && (css.willChange === 'filter' || css.filter && css.filter !== 'none')) {
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

  if (offsetParent && (getNodeName(offsetParent) === 'html' || getNodeName(offsetParent) === 'body' && getComputedStyle(offsetParent).position === 'static')) {
    return window;
  }

  return offsetParent || getContainingBlock(element) || window;
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
    const requires = [].concat(modifier.requires || [], modifier.requiresIfExists || []);
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
  return function() {
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
  const merged = modifiers.reduce((merged, current) => {
    const existing = merged[current.name];
    merged[current.name] = existing ? Object.assign({}, existing, current, { options: Object.assign({}, existing.options, current.options), data: Object.assign({}, existing.data, current.data) }) : current;
    return merged;
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

  return {
    width: width,
    height: height,
    x: x + getWindowScrollBarX(element),
    y: y
  };
}

function getDocumentRect(element) {
  const html = getDocumentElement(element);
  const winScroll = getWindowScroll(element);
  const body = element.ownerDocument ? element.ownerDocument.body : undefined;
  const width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
  const height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
  const x = -winScroll.scrollLeft + getWindowScrollBarX(element);
  const y = -winScroll.scrollTop;

  if (getComputedStyle(body || html).direction === 'rtl') {
    const rtlAdjust = max(html.clientWidth, body ? body.clientWidth : 0) - width;
    x += rtlAdjust;
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
  return Object.assign({}, rect, {
    left: rect.x,
    top: rect.y,
    right: rect.x + rect.width,
    bottom: rect.y + rect.height
  });
}

function getInnerBoundingClientRect(element, strategy) {
  const rect = getBoundingClientRect(element, false, strategy === 'fixed');
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

function getClientRectFromMixedType(element, clippingParent, strategy) {
  return clippingParent === 'viewport' ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
}

function getClippingParents(element) {
  const mainClippingParents = listScrollParents(getParentNode(element));
  const canEscapeClipping = ['absolute', 'fixed'].includes(getComputedStyle(element).position);
  const clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;

  if (!isElement(clipperElement)) return [];
  return mainClippingParents.filter(clippingParent => isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== 'body');
}

function getClippingRect(element, boundary, rootBoundary, strategy) {
  const mainClippingParents = boundary === 'clippingParents' ? getClippingParents(element) : [].concat(boundary);
  const clippingParents = [].concat(mainClippingParents, [rootBoundary]);
  const firstClippingParent = clippingParents[0];
  return clippingParents.reduce((accRect, clippingParent) => {
    const rect = getClientRectFromMixedType(element, clippingParent, strategy);
    accRect.top = max(rect.top, accRect.top);
    accRect.right = min(rect.right, accRect.right);
    accRect.bottom = min(rect.bottom, accRect.bottom);
    accRect.left = max(rect.left, accRect.left);
    return accRect;
  }, getClientRectFromMixedType(element, firstClippingParent, strategy));
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
  if (mainAxis != null) {
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
  return Object.assign({}, getFreshSideObject(), paddingObject);
}

function expandToHashMap(value, keys) {
  return keys.reduce((hashMap, key) => {
    hashMap[key] = value;
    return hashMap;
  }, {});
}

function detectOverflow(state, options = {}) {
  const {
    placement = state.placement,
    strategy = state.strategy,
    boundary = 'clippingParents',
    rootBoundary = 'viewport',
    elementContext = 'popper',
    altBoundary = false,
    padding = 0
  } = options;

  const paddingObject = mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
  const altContext = elementContext === 'popper' ? 'reference' : 'popper';
  const popperRect = state.rects.popper;
  const element = state.elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
  const referenceClientRect = getBoundingClientRect(state.elements.reference);
  
  const popperOffsets = computeOffsets({
    reference: referenceClientRect,
    element: popperRect,
    strategy: 'absolute',
    placement: placement
  });
  
  const popperClientRect = rectToClientRect(Object.assign({}, popperRect, popperOffsets));
  const elementClientRect = elementContext === 'popper' ? popperClientRect : referenceClientRect;

  const overflowOffsets = {
    top: clippingClientRect.top - elementClientRect.top + paddingObject.top,
    bottom: elementClientRect.bottom - clippingClientRect.bottom + paddingObject.bottom,
    left: clippingClientRect.left - elementClientRect.left + paddingObject.left,
    right: elementClientRect.right - clippingClientRect.right + paddingObject.right
  };

  const offsetData = state.modifiersData.offset;
  if (elementContext === 'popper' && offsetData) {
    const offset = offsetData[placement];
    Object.keys(overflowOffsets).forEach(key => {
      const multiply = ['right', 'bottom'].includes(key) ? 1 : -1;
      const axis = ['top', 'bottom'].includes(key) ? 'y' : 'x';
      overflowOffsets[key] += offset[axis] * multiply;
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
      options: Object.assign({}, DEFAULT_OPTIONS, defaultOptions),
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

        const orderedModifiers = orderModifiers(mergeByName([...defaultModifiers, state.options.modifiers]));
        state.orderedModifiers = orderedModifiers.filter(m => m.enabled);
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
          if (state.reset) {
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
      update: debounce(function() {
        return new Promise(resolve => {
          instance.forceUpdate();
          resolve(state);
        });
      }),
      destroy() {
        cleanupModifierEffects();
        isDestroyed = true;
      }
    };

    if (!areValidElements(reference, popper)) {
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
          const cleanupFn = effect({ state, name, instance, options }) || (() => {});
          effectCleanupFns.push(cleanupFn);
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
  const window = getWindow(state.elements.popper);
  const scrollParents = [].concat(state.scrollParents.reference, state.scrollParents.popper);

  if (scroll) {
    scrollParents.forEach(scrollParent => scrollParent.addEventListener('scroll', instance.update, passive));
  }
  if (resize) {
    window.addEventListener('resize', instance.update, passive);
  }

  return function() {
    if (scroll) {
      scrollParents.forEach(scrollParent => scrollParent.removeEventListener('scroll', instance.update, passive));
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
  fn: () => {},
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

const popperOffsets$1 = {
  name: 'popperOffsets',
  enabled: true,
  phase: 'read',
  fn: popperOffsets,
  data: {}
};

const unsetSides = { top: 'auto', right: 'auto', bottom: 'auto', left: 'auto' };

function roundOffsetsByDPR({ x, y }, win) {
  const dpr = win.devicePixelRatio || 1;
  return {
    x: Math.round(x * dpr) / dpr || 0,
    y: Math.round(y * dpr) / dpr || 0
  };
}

function mapToStyles({
  popper, popperRect, placement, variation, offsets, position,
  gpuAcceleration, adaptive, roundOffsets, isFixed
}) {
  let { x = 0, y = 0 } = offsets;
  const { x: offsetX, y: offsetY } = typeof roundOffsets === 'function' ? roundOffsets({ x, y }) : { x, y };

  const hasX = offsets.hasOwnProperty('x');
  const hasY = offsets.hasOwnProperty('y');
  const sideX = 'left';
  const sideY = 'top';
  const win = window;

  if (adaptive) {
    let offsetParent = getOffsetParent(popper);
    const heightProp = 'clientHeight';
    const widthProp = 'clientWidth';

    if (offsetParent === getWindow(popper)) {
      offsetParent = getDocumentElement(popper);
      if (getComputedStyle(offsetParent).position !== 'static' && position === 'absolute') {
        heightProp = 'scrollHeight';
        widthProp = 'scrollWidth';
      }
    }
    offsetParent = offsetParent;

    if (placement === 'top' || (placement === 'left' || placement === 'right') && variation === 'end') {
      sideY = 'bottom';
      const offsetY = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : offsetParent[heightProp];
      y -= offsetY - popperRect.height;
      y *= gpuAcceleration ? 1 : -1;
    }

    if (placement === 'left' || (placement === 'top' || placement === 'bottom') && variation === 'end') {
      sideX = 'right';
      const offsetX = isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : offsetParent[widthProp];
      x -= offsetX - popperRect.width;
      x *= gpuAcceleration ? 1 : -1;
    }
  }

  const commonStyles = Object.assign({ position }, adaptive && unsetSides);

  x = offsetX;
  y = offsetY;

  if (gpuAcceleration) {
    return Object.assign({}, commonStyles, {
      [sideY]: hasY ? '0' : '',
      [sideX]: hasX ? '0' : '',
      transform: win.devicePixelRatio <= 1 ? `translate(${x}px, ${y}px)` : `translate3d(${x}px, ${y}px, 0)`
    });
  }

  return Object.assign({}, commonStyles, {
    [sideY]: hasY ? `${y}px` : '',
    [sideX]: hasX ? `${x}px` : '',
    transform: ''
  });
}

function computeStyles({ state, options }) {
  const { gpuAcceleration = true, adaptive = true, roundOffsets = true } = options;
  const commonStyles = {
    placement: getBasePlacement(state.placement),
    variation: getVariation(state.placement),
    popper: state.elements.popper,
    popperRect: state.rects.popper,
    gpuAcceleration,
    isFixed: state.options.strategy === 'fixed'
  };

  if (state.modifiersData.popperOffsets != null) {
    state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.popperOffsets,
      position: state.options.strategy,
      adaptive,
      roundOffsets
    })));
  }

  if (state.modifiersData.arrow != null) {
    state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles(Object.assign({}, commonStyles, {
      offsets: state.modifiersData.arrow,
      position: 'absolute',
      adaptive: false,
      roundOffsets
    })));
  }

  state.attributes.popper = Object.assign({}, state.attributes.popper, {
    'data-popper-placement': state.placement
  });
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
  state.styles = initialStyles;

  if (state.elements.arrow) {
    Object.assign(state.elements.arrow.style, initialStyles.arrow);
  }

  return function() {
    Object.keys(state.elements).forEach(name => {
      const element = state.elements[name];
      const attributes = state.attributes[name] || {};
      const styleProperties = Object.keys(state.styles.hasOwnProperty(name) ? state.styles[name] : initialStyles[name]);

      const style = styleProperties.reduce((style, property) => {
        style[property] = '';
        return style;
      }, {});

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
  const invertDistance = ['left', 'top'].includes(basePlacement) ? -1 : 1;
  const { skidding, distance } = typeof offset === 'function' ? offset(Object.assign({}, rects, { placement })) : offset;
  return ['left', 'right'].includes(basePlacement) ? { x: skidding || 0, y: distance * invertDistance || 0 } : { x: distance * invertDistance || 0, y: skidding || 0 };
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

const hash$1 = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' };
function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, matched => hash$1[matched]);
}

const hash = { start: 'end', end: 'start' };
function getOppositeVariationPlacement(placement) {
  return placement.replace(/start|end/g, matched => hash[matched]);
}

function computeAutoPlacement(state, options = {}) {
  const {
    placement = state.placement,
    boundary = 'clippingParents',
    rootBoundary = 'viewport',
    padding = 0,
    flipVariations = true,
    allowedAutoPlacements = placements
  } = options;

  const variation = getVariation(placement);
  const placements$1 = variation ? flipVariations ? variationPlacements : variationPlacements.filter(plc => getVariation(plc) === variation) : basePlacements;
  const allowedPlacements = placements$1.filter(plc => allowedAutoPlacements.includes(plc));

  if (allowedPlacements.length === 0) {
    allowedPlacements = placements$1;
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
  if (state.modifiersData[name]._skip) return;

  const {
    mainAxis = true,
    altAxis = true,
    fallbackPlacements: specifiedFallbackPlacements,
    padding,
    boundary,
    rootBoundary,
    altBoundary,
    flipVariations = true,
    allowedAutoPlacements
  } = options;

  const preferredPlacement = state.options.placement;
  const basePlacement = getBasePlacement(preferredPlacement);
  const isBasePlacement = basePlacement === preferredPlacement;
  const fallbackPlacements = specifiedFallbackPlacements || (isBasePlacement || !flipVariations ? [getOppositePlacement(preferredPlacement)] : getExpandedFallbackPlacements(preferredPlacement));
  const placements = [preferredPlacement, ...fallbackPlacements].reduce((acc, plc) => acc.concat(getBasePlacement(plc) === 'auto' ? computeAutoPlacement(state, { placement: plc, boundary, rootBoundary, padding, flipVariations, allowedAutoPlacements }) : plc), []);
  const referenceRect = state.rects.reference;
  const popperRect = state.rects.popper;
  const checksMap = new Map();
  let makeFallbackChecks = true;
  let firstFittingPlacement = placements[0];

  for (let i = 0; i < placements.length; i++) {
    const placement = placements[i];
    const _basePlacement = getBasePlacement(placement);
    const isStartVariation = getVariation(placement) === 'start';
    const isVertical = ['top', 'bottom'].includes(_basePlacement);
    const len = isVertical ? 'width' : 'height';
    const overflow = detectOverflow(state, { placement, boundary, rootBoundary, altBoundary, padding });
    const mainVariationSide = isVertical ? isStartVariation ? 'right' : 'left' : isStartVariation ? 'bottom' : 'top';

    if (referenceRect[len] > popperRect[len]) {
      mainVariationSide = getOppositePlacement(mainVariationSide);
    }

    const altVariationSide = getOppositePlacement(mainVariationSide);
    const checks = [];

    if (mainAxis) {
      checks.push(overflow[_basePlacement] <= 0);
    }
    if (altAxis) {
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
        if (checks) {
          return checks.slice(0, i).every(check => check);
        }
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

function withinMaxClamp(min, value, max) {
  const v = within(min, value, max);
  return v > max ? max : v;
}

function preventOverflow({ state, options, name }) {
  const {
    mainAxis = true,
    altAxis = false,
    boundary = 'clippingParents',
    rootBoundary = 'viewport',
    altBoundary = false,
    padding = 0,
    tether = true,
    tetherOffset = 0
  } = options;

  const overflow = detectOverflow(state, { boundary, rootBoundary, padding, altBoundary });
  const basePlacement = getBasePlacement(state.placement);
  const variation = getVariation(state.placement);
  const isBasePlacement = !variation;
  const mainAxis = getMainAxisFromPlacement(basePlacement);
  const altAxis = getAltAxis(mainAxis);
  const popperOffsets = state.modifiersData.popperOffsets;
  const referenceRect = state.rects.reference;
  const popperRect = state.rects.popper;
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
    let additive = tether ? -popperRect[len] / 2 : 0;
    const minLen = variation === 'start' ? referenceRect[len] : popperRect[len];
    const maxLen = variation === 'start' ? -popperRect[len] : -referenceRect[len];
    const arrowElement = state.elements.arrow;
    const arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : { width: 0, height: 0 };
    const arrowPaddingObject = state.modifiersData['arrow#persistent'] ? state.modifiersData['arrow#persistent'].padding : getFreshSideObject();
    const arrowPaddingMin = arrowPaddingObject[mainSide];
    const arrowPaddingMax = arrowPaddingObject[altSide];
    const arrowLen = within(0, referenceRect[len], arrowRect[len]);
    const minOffset = isBasePlacement ? referenceRect[len] / 2 - additive - arrowLen - arrowPaddingMin - offset : minLen - arrowLen - arrowPaddingMin - offset;
    const maxOffset = isBasePlacement ? -referenceRect[len] / 2 + additive + arrowLen + arrowPaddingMax + offset : maxLen + arrowLen + arrowPaddingMax + offset;

    if (state.modifiersData.offset) {
      const offsetValue = state.modifiersData.offset[state.placement];
      Object.keys(data).forEach(axis => {
        data[axis] += offsetValue[axis];
      });
    }

    data[mainAxis] = within(mainAxis === 'x' ? mainSide === 'left' ? 0 : 0 : maxLen, offset + (mainAxis === 'x' ? minMax(0, state.modifiersData.offset[minAxis]) : 0), maxOffset);

    data.altAxis = withinMinMax(mainAxis === 'x' ? mainLen - offset : offset - maxOffset, offset - minOffset, mainAxis === 'x' ? maxOffset : minMax(mainAxis === 'x' ? offset : -offset, maxAxis));
    state.modifiersData[name] = data;
  }

  if (altAxis) {
    const mainSide = mainAxis === 'x' ? 'top' : 'left';
    const altSide = mainAxis === 'x' ? 'bottom' : 'right';
    const offset = popperOffsets[altAxis];
    const min = offset + overflow[mainSide];
    const max = offset - overflow[altSide];
    const additive = tether ? -popperRect[getSideAxis(mainAxis)] / 2 : 0;

    data.altAxis = within(getSideAxis(mainAxis), referenceRect[getSideAxis(mainAxis)] / 2 - offset - additive - max - popperRect[getSideAxis(mainAxis)] - overflow[sideSide], offset - min - (tether ? -getSideAxis(additive) : arrowPaddingMax), offset + min - (tether ? -overflow[sideSide] : max - arrowPaddingMax));
  }

  state.modifiersData[name] = data;
}

function arrow({ state, name, options }) {
  const { element } = options;
  const arrowElement = element ? state.elements[element] : '[data-popper-arrow]';

  if (!arrowElement || popperOffsets === undefined) {
    return;
  }

  const padding = typeof arrowPadding === 'function' ? arrowPadding(Object.assign({}, state.rects, { placement: state.placement })) : arrowPadding(getBasePlacement(state.placement), state.modifiersData, getUAString(state));
  const arrowRect = getLayoutRect(arrowElement);
  const axis = getMainAxis(getBasePlacement(state.placement));
  const isVertical = axis === 'y';
  const len = isVertical ? 'height' : 'width';
  const minProps = axis === 'y' ? 'top' : 'left';
  const maxProps = axis === 'y' ? 'bottom' : 'right';
  const popperOffsets = state.modifiersData.popperOffsets[getThreshold(min)];
  const cldThreshold = axis === 'y' ? getAssociativeAxis() : getThreshold();
  const referenceDimensions = state.rects.reference[getThreshold(0, min, referenceDimensions) + state.rects.popper[getThreshold(xRect)] + popperOffsets[0] + state.rects.popper.cldThreshold];

  if (!offsetMap[state.placement]) {
    offsetMap[state.placement] = getArrowOffsetMap(state.rects.reference);
    offsetMap[state.placement].edges = [{ min: minProps }, { max: maxProps }];
  }

  const boundaries = state.rects[state.rects.reference[projection]];

  const toOffsets = function toOffsets(rects) {
    const padding = getPaddingValue(padding);
    let arrowX = state.arrows[axis][bottom] - arrowX - arrowToReference.bottom;
    let arrowY = axis === 'y' ? popperX - rects.arrowToReference.left - arrowX : popperY - arrowToReference.right;

    return { x: maxValue(0, offsetWidth ? rects.popper.left : 0) - boundingBoundaryWidth - arrowYOffset, y: base = popperOffsets.x - arrowX - left + popperOffsets.y - state.rects.popper[getMinThreshold(axis)] - state.rects.popper.yAxis - 0 - arrowY + getArrowShiftY(popperX - x, state.rects.reference.left) * left, marginRight: popperOffsets.x };

    if (!offsetMap[state.placement][position][arrowXOffset] || !popperX) {
      const arrowOffsetMap = offsetMap[state.placement];
      const projection = axis === 'x' ? minProps : maxProps;
      const base = offset.offset[state.placement];
      const left = popperRect.width / 2 - axis === 'x' ? toOffsets.x : toOffsets.y;
      const minY = axis === 'y' ? 0 : arrowRect.y;

      return canOverflowX ? { x: minY, y: popperX, marginRight: popperX } : { x: state.arrows[axis][0] - 0, y: arrowOffset - bottom + arrowX - 0, xOffset: Math.round(getThreshold(minProps)) - arrowYOffset + getArrowShiftX(getArrowShiftX(maxX, left)) + popperYOffset - top };

      offset.set({ target: state.elements.reference, arrowTarget: popperOffsets.x, arrowTime: arrowRect[getMinPinHeight(state, arrowY)] - maxY });
    }
  }

  const collapsibleElement = {
    xTether: {
      minProps,
      minLeft,
      axis: getMainAxisFromPlacement(popperOffsets),
      maxTop: [state.modifiersData.popperOffsets.x, left]
    }
  };

  state.modifiersData.offsets = Object.assign({}, boundsToFitX, toOffsets(toOffsets);

  state.getMinPinHeight(state.rects.reference, offsetX) == null; //jslint error
  if (!allowedParams || options.maxWidth === maxBounds) {
    state.modifiersData.minPinHeight = minBounds;
  } else {
    state.modifiersData.minPinHeight = width;
    state.modifiersData.maxPinWidth = minSize.y.state.rects.reference[getMaxThreshold(axis, left)].offsetWidth + popperYOffset;

    state.modifiersData.maxPinWidth = double(state.arrows[axis.left], minProps + (state.arrows[minProps][left] * maxLeft), left);

    state.modifiersData.toY = popperWidth;
    state.modifiersData.popperOffsets.s = minMargin;

    return baseToThreshold;
  }

  state.rects.tray[minProps] += bottom;
} // eslint-disable-next-line import/no-unused-modules


exports.applyStyles = applyStyles$1;
exports.arrow = arrow$1;
exports.computeStyles = computeStyles$1;
exports.createPopper = popperGenerator({ defaultModifiers });
exports.createPopperLite = popperGenerator({ defaultModifiers: [eventListeners, popperOffsets$1, computeStyles$1, applyStyles$1] });
exports.defaultModifiers = defaultModifiers;
exports.detectOverflow = detectOverflow;
exports.eventListeners = eventListeners;
exports.flip = flip$1;
exports.hide = hide$1;
exports.offset = offset$1;
exports.popperGenerator = popperGenerator;
exports.popperOffsets = popperOffsets$1;
exports.preventOverflow = preventOverflow$1;
