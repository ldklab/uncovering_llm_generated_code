'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function getWindow(node) {
  if (!node) return window;
  return (node.toString() !== '[object Window]') ? (node.ownerDocument?.defaultView || window) : node;
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

const max = Math.max;
const min = Math.min;
const round = Math.round;

function getUAString() {
  const uaData = navigator.userAgentData;
  return (uaData && Array.isArray(uaData.brands)) ? 
    uaData.brands.map(item => `${item.brand}/${item.version}`).join(' ') :
    navigator.userAgent;
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

  const visualViewport = isElement(element) ? getWindow(element).visualViewport : window.visualViewport;
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
    x,
    y
  };
}

function getWindowScroll(node) {
  const win = getWindow(node);
  return {
    scrollLeft: win.pageXOffset,
    scrollTop: win.pageYOffset
  };
}

function getHTMLElementScroll(element) {
  return {
    scrollLeft: element.scrollLeft,
    scrollTop: element.scrollTop
  };
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
  return /auto|scroll|overlay|hidden/.test(`${overflow}${overflowY}${overflowX}`);
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
  let scroll = {scrollLeft: 0, scrollTop: 0}, offsets = {x: 0, y: 0};

  if (isOffsetParentAnElement || (!isOffsetParentAnElement && !isFixed)) {
    if (getNodeName(offsetParent) !== 'body' || isScrollParent(documentElement)) {
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
  
  if (Math.abs(clientRect.width - width) <= 1) {
    width = clientRect.width;
  }
  
  if (Math.abs(clientRect.height - height) <= 1) {
    height = clientRect.height;
  }

  return {
    x: element.offsetLeft,
    y: element.offsetTop,
    width,
    height
  };
}

function getParentNode(element) {
  if (getNodeName(element) === 'html') return element;
  return (element.assignedSlot || element.parentNode || (isShadowRoot(element) ? element.host : null) || getDocumentElement(element));
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
  const isBody = scrollParent === (element.ownerDocument?.body);
  const win = getWindow(scrollParent);
  const target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
  return isBody ? list.concat(target) : list.concat(listScrollParents(getParentNode(target)));
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

  if (isShadowRoot(currentNode)) {
    currentNode = currentNode.host;
  }

  while (isHTMLElement(currentNode) && !['html', 'body'].includes(getNodeName(currentNode))) {
    const css = getComputedStyle(currentNode);
    if (css.transform !== 'none' || css.perspective !== 'none' || css.contain === 'paint' || ['transform', 'perspective'].includes(css.willChange) || (isFirefox && css.willChange === 'filter') || (isFirefox && css.filter && css.filter !== 'none')) {
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

  return offsetParent && (getNodeName(offsetParent) === 'html' || (getNodeName(offsetParent) === 'body' && getComputedStyle(offsetParent).position === 'static')) ? window : offsetParent || getContainingBlock(element) || window;
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

const variationPlacements = basePlacements.reduce((acc, placement) => acc.concat([`${placement}-${start}`, `${placement}-${end}`]), []);
const placements = [].concat(basePlacements, [auto]).reduce((acc, placement) => acc.concat([placement, `${placement}-${start}`, `${placement}-${end}`]), []);

const beforeRead = 'beforeRead';
const read = 'read';
const afterRead = 'afterRead';

const beforeMain = 'beforeMain';
const main = 'main';
const afterMain = 'afterMain';

const beforeWrite = 'beforeWrite';
const write = 'write';
const afterWrite = 'afterWrite';

const modifierPhases = [beforeRead, read, afterRead, beforeMain, main, afterMain, beforeWrite, write, afterWrite];

function order(modifiers) {
  const map = new Map();
  const visited = new Set();
  const result = [];
  
  modifiers.forEach((modifier) => map.set(modifier.name, modifier));

  function sort(modifier) {
    visited.add(modifier.name);
    const requires = [].concat((modifier.requires || []), (modifier.requiresIfExists || []));
    requires.forEach((dep) => {
      if (!visited.has(dep)) {
        const depModifier = map.get(dep);
        if (depModifier) sort(depModifier);
      }
    });
    result.push(modifier);
  }

  modifiers.forEach((modifier) => {
    if (!visited.has(modifier.name)) sort(modifier);
  });
  
  return result;
}

function orderModifiers(modifiers) {
  const orderedModifiers = order(modifiers);
  
  return modifierPhases.reduce((acc, phase) => acc.concat(orderedModifiers.filter((modifier) => modifier.phase === phase)), []);
}

function debounce(fn) {
  let pending;
  
  return function() {
    if (!pending) {
      pending = new Promise((resolve) => {
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
    merged[current.name] = existing ? Object.assign({}, existing, current, {
      options: Object.assign({}, existing.options, current.options),
      data: Object.assign({}, existing.data, current.data)
    }) : current;
    return merged;
  }, {});
  
  return Object.keys(merged).map((key) => merged[key]);
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
    if (layoutViewport || (strategy === 'fixed' && !layoutViewport)) {
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
  const body = element.ownerDocument?.body;
  const width = max(html.scrollWidth, html.clientWidth, body ? body.scrollWidth : 0, body ? body.clientWidth : 0);
  const height = max(html.scrollHeight, html.clientHeight, body ? body.scrollHeight : 0, body ? body.clientHeight : 0);
  let x = -winScroll.scrollLeft + getWindowScrollBarX(element);
  let y = -winScroll.scrollTop;

  if (getComputedStyle(body || html).direction === 'rtl') {
    x += max(html.clientWidth, body ? body.clientWidth : 0) - width;
  }

  return {
    width,
    height,
    x,
    y
  };
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
  rect.top += element.clientTop;
  rect.left += element.clientLeft;
  rect.right = rect.left + element.clientWidth;
  rect.bottom = rect.top + element.clientHeight;
  rect.width = element.clientWidth;
  rect.height = element.clientHeight;
  rect.x = rect.left;
  rect.y = rect.top;
  return rect;
}

function getClientRectFromMixedType(element, clippingParent, strategy) {
  return clippingParent === viewport ? rectToClientRect(getViewportRect(element, strategy)) : isElement(clippingParent) ? getInnerBoundingClientRect(clippingParent, strategy) : rectToClientRect(getDocumentRect(getDocumentElement(element)));
}

function getClippingParents(element) {
  const clippingParents = listScrollParents(getParentNode(element));
  const canEscapeClipping = ['absolute', 'fixed'].includes(getComputedStyle(element).position);
  const clipperElement = canEscapeClipping && isHTMLElement(element) ? getOffsetParent(element) : element;
  
  if (!isElement(clipperElement)) {
    return [];
  }

  return clippingParents.filter((clippingParent) => isElement(clippingParent) && contains(clippingParent, clipperElement) && getNodeName(clippingParent) !== 'body');
}

function getClippingRect(element, boundary, rootBoundary, strategy) {
  const mainClippingParents = boundary === 'clippingParents' ? getClippingParents(element) : [].concat(boundary);
  const clippingParents = [].concat(mainClippingParents, [rootBoundary]);
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

  if (mainAxis) {
    const len = mainAxis === 'y' ? 'height' : 'width';
    switch (variation) {
      case start:
        offsets[mainAxis] -= (reference[len] / 2 - element[len] / 2);
        break;
      case end:
        offsets[mainAxis] += (reference[len] / 2 - element[len] / 2);
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
    boundary = clippingParents,
    rootBoundary = viewport,
    elementContext = popper,
    altBoundary = false,
    padding = 0
  } = options;
  
  const paddingObject = mergePaddingObject(typeof padding !== 'number' ? padding : expandToHashMap(padding, basePlacements));
  const altContext = elementContext === popper ? reference : popper;
  const popperRect = state.rects.popper;
  const element = state.elements[altBoundary ? altContext : elementContext];
  const clippingClientRect = getClippingRect(isElement(element) ? element : element.contextElement || getDocumentElement(state.elements.popper), boundary, rootBoundary, strategy);
  const referenceClientRect = getBoundingClientRect(state.elements.reference);
  
  const popperOffsets = computeOffsets({
    reference: referenceClientRect,
    element: popperRect,
    strategy: 'absolute',
    placement
  });
  
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
    Object.keys(overflowOffsets).forEach((key) => {
      const multiply = [right, bottom].includes(key) ? 1 : -1;
      const axis = [top, bottom].includes(key) ? 'y' : 'x';
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
  return !args.some((element) => !(element && typeof element.getBoundingClientRect === 'function'));
}

function popperGenerator(generatorOptions = {}) {
  const {
    defaultModifiers = [],
    defaultOptions = DEFAULT_OPTIONS
  } = generatorOptions;
  
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
      setOptions(setOptionsAction) {
        const options = typeof setOptionsAction === 'function' ? setOptionsAction(state.options) : setOptionsAction;
        cleanupModifierEffects();
        state.options = { ...defaultOptions, ...state.options, ...options };
        state.scrollParents = {
          reference: isElement(reference) ? listScrollParents(reference) : reference.contextElement ? listScrollParents(reference.contextElement) : [],
          popper: listScrollParents(popper)
        };

        const orderedModifiers = orderModifiers(mergeByName([ ...defaultModifiers, ...state.options.modifiers ]));
        state.orderedModifiers = orderedModifiers.filter((m) => m.enabled);
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

        state.orderedModifiers.forEach((modifier) => {
          state.modifiersData[modifier.name] = { ...modifier.data };
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
          const noopFn = () => {};
          effectCleanupFns.push(cleanupFn || noopFn);
        }
      });
    }

    function cleanupModifierEffects() {
      effectCleanupFns.forEach((fn) => fn());
      effectCleanupFns = [];
    }

    return instance;
  };
}

const passive = { passive: true };

function effect$2({ state, instance, options }) {
  const { scroll = true, resize = true } = options;
  
  const window = getWindow(state.elements.popper);
  const scrollParents = [...state.scrollParents.reference, ...state.scrollParents.popper];

  if (scroll) {
    scrollParents.forEach((scrollParent) => {
      scrollParent.addEventListener('scroll', instance.update, passive);
    });
  }
  
  if (resize) {
    window.addEventListener('resize', instance.update, passive);
  }

  return function () {
    if (scroll) {
      scrollParents.forEach((scrollParent) => scrollParent.removeEventListener('scroll', instance.update, passive));
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
    x: round(x * dpr) / dpr || 0,
    y: round(y * dpr) / dpr || 0
  };
}

function mapToStyles({ popper, popperRect, placement, variation, offsets, position, gpuAcceleration, adaptive, roundOffsets, isFixed }) {
  let { x = 0, y = 0 } = offsets;

  const { left: sideX, top: sideY } = { left, top };
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
    
    if (placement === top || ((placement === left || placement === right) && variation === end)) {
      Object.assign(sideY, bottom);
      y -= (isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.height : offsetParent[heightProp]) - popperRect.height;
      y *= gpuAcceleration ? 1 : -1;
    }
    
    if (placement === left || ((placement === top || placement === bottom) && variation === end)) {
      Object.assign(sideX, right);
      x -= (isFixed && offsetParent === win && win.visualViewport ? win.visualViewport.width : offsetParent[widthProp]) - popperRect.width;
      x *= gpuAcceleration ? 1 : -1;
    }
  }

  Object.assign({
    position
  }, adaptive && unsetSides);

  ({ x, y } = (roundOffsets === true ? roundOffsetsByDPR({ x, y }, popper) : { x, y }));

  if (gpuAcceleration) {
    return {
      position,
      transform: ((win.devicePixelRatio || 1) <= 1) ? `translate(${x}px, ${y}px)` : `translate3d(${x}px, ${y}px, 0)`,
      [sideY]: y ? '0' : '',
      [sideX]: x ? '0' : ''
    };
  }

  return {
    position,
    transform: '',
    [sideY]: y ? `${y}px` : '',
    [sideX]: x ? `${x}px` : ''
  };
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

  if (state.modifiersData.popperOffsets) {
    state.styles.popper = Object.assign({}, state.styles.popper, mapToStyles({ ...commonStyles, offsets: state.modifiersData.popperOffsets, position: state.options.strategy, adaptive, roundOffsets }));
  }

  if (state.modifiersData.arrow) {
    state.styles.arrow = Object.assign({}, state.styles.arrow, mapToStyles({ ...commonStyles, offsets: state.modifiersData.arrow, position: 'absolute', adaptive: false, roundOffsets }));
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
  Object.keys(state.elements).forEach((name) => {
    const style = state.styles[name] || {};
    const attributes = state.attributes[name] || {};
    const element = state.elements[name];

    if (!isHTMLElement(element) || !getNodeName(element)) return;
    
    Object.assign(element.style, style);
    Object.keys(attributes).forEach((name) => {
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
    Object.keys(state.elements).forEach((name) => {
      const element = state.elements[name];
      const attributes = state.attributes[name] || {};
      const styleProperties = Object.keys(state.styles[name] || initialStyles[name]);
      
      const style = styleProperties.reduce((style, property) => {
        style[property] = '';
        return style;
      }, {});
      
      if (!isHTMLElement(element) || !getNodeName(element)) return;

      Object.assign(element.style, style);
      Object.keys(attributes).forEach((attribute) => element.removeAttribute(attribute));
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
  
  const { skidding = 0, distance = 0 } = (typeof offset === 'function' ? offset({ ...rects, placement }) : offset);

  const distanceModifier = distance * invertDistance;

  return [left, right].includes(basePlacement) ? 
    { x: distanceModifier, y: skidding } : 
    { x: skidding, y: distanceModifier };
}

function offset({ state, options, name }) {
  const { offset = [0, 0] } = options;
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

const offset$1 = {
  name: 'offset',
  enabled: true,
  phase: 'main',
  requires: ['popperOffsets'],
  fn: offset
};

const oppositePlacementHash = { left: 'right', right: 'left', bottom: 'top', top: 'bottom' };

function getOppositePlacement(placement) {
  return placement.replace(/left|right|bottom|top/g, (matched) => oppositePlacementHash[matched]);
}

const oppositeVariationPlacementHash = { start: 'end', end: 'start' };

function getOppositeVariationPlacement(placement) {
  return placement.replace(/start|end/g, (matched) => oppositeVariationPlacementHash[matched]);
}

function computeAutoPlacement(state, options = {}) {
  const { placement, boundary, rootBoundary, padding, flipVariations, allowedAutoPlacements = placements } = options;

  const variation = getVariation(placement);
  const placements$1 = variation ? (flipVariations ? variationPlacements : variationPlacements.filter((placement) => getVariation(placement) === variation)) : basePlacements;
  
  const allowedPlacements = placements$1.filter((placement) => allowedAutoPlacements.includes(placement));

  if (!allowedPlacements.length) {
    allowedPlacements = placements$1;
  }

  const overflows = allowedPlacements.reduce((acc, placement) => {
    acc[placement] = detectOverflow(state, {
      placement,
      boundary,
      rootBoundary,
      padding
    })[getBasePlacement(placement)];
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
  if (state.modifiersData[name]._skip) return;

  const {
    mainAxis: checkMainAxis = true,
    altAxis: checkAltAxis = true,
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

  const placements = [preferredPlacement, ...fallbackPlacements].reduce((acc, placement) => acc.concat(
    getBasePlacement(placement) === auto ? computeAutoPlacement(state, {placement, boundary, rootBoundary, padding, flipVariations, allowedAutoPlacements}) : placement
  ), []);

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

    let mainVariationSide = (isVertical ? (isStartVariation ? right : left) : (isStartVariation ? bottom : top));

    if (referenceRect[len] > popperRect[len]) {
      mainVariationSide = getOppositePlacement(mainVariationSide);
    }

    const altVariationSide = getOppositePlacement(mainVariationSide);

    const checks = [];
    if (checkMainAxis) checks.push(overflow[_basePlacement] <= 0);
    if (checkAltAxis) checks.push(overflow[mainVariationSide] <= 0, overflow[altVariationSide] <= 0);

    if (checks.every((check) => check)) {
      firstFittingPlacement = placement;
      makeFallbackChecks = false;
      break;
    }

    checksMap.set(placement, checks);
  }

  if (makeFallbackChecks) {
    const numberOfChecks = flipVariations ? 3 : 1;
    const reducedCheckLoop = (numberOfChecks) => {
      const fittingPlacement = placements.find((placement) => {
        const checks = checksMap.get(placement);
        return checks && checks.slice(0, numberOfChecks).every((check) => check);
      });
      
      if (fittingPlacement) firstFittingPlacement = fittingPlacement;
    };

    for (let i = numberOfChecks; i > 0; i--) reducedCheckLoop(i);
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

function within(min$1, value, max$1) {
  return max(min$1, min(value, max$1));
}

function withinMaxClamp(min, value, max) {
  const v = within(min, value, max);
  return v > max ? max : v;
}

function preventOverflow({ state, options, name }) {
  const {
    mainAxis: checkMainAxis = true,
    altAxis: checkAltAxis = false,
    boundary,
    rootBoundary,
    altBoundary,
    padding,
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

  const tetherOffsetValue = typeof tetherOffset === 'function' ? tetherOffset({ ...state.rects, placement: state.placement }) : tetherOffset;
  const normalizedTetherOffsetValue = typeof tetherOffsetValue === 'number' ? 
    { mainAxis: tetherOffsetValue, altAxis: tetherOffsetValue } : 
    { mainAxis: 0, altAxis: 0, ...tetherOffsetValue };

  const offsetModifierState = state.modifiersData.offset ? state.modifiersData.offset[state.placement] : null;

  if (!popperOffsets) return;

  const updatePlacementOffsets = (side, additive, minOffset, maxOffset, offset, offsetModifierValue, offsetParent, axis) => {
    const min$1 = offset + overflow[side];
    const max$1 = offset - overflow[side === right ? left : top];

    offsetParent = offsetParent || (mainAxis === 'y' ? 'height' : 'width');
    
    const len = mainAxis === 'y' ? 'height' : 'width';
    const offsetProp = offset + minOffset - offsetModifierValue - offsetParent;
    
    const tetherMin = offset + minOffset - offsetModifierValue - offsetParent;
    const tetherMax = offset + maxOffset - offsetModifierValue;

    const arrowElement = state.elements.arrow;
    const arrowRect = tether && arrowElement ? getLayoutRect(arrowElement) : { width: 0, height: 0 };
    const arrowPaddingObject = state.modifiersData['arrow#persistent'] ? state.modifiersData['arrow#persistent'].padding : getFreshSideObject();
    const arrowPaddingMin = arrowPaddingObject[side];
    const arrowPaddingMax = arrowPaddingObject[side === right ? left : top];
    const arrowLen = within(0, referenceRect[len], arrowRect[len]);

    const clientOffset = (axis === 'y' ? popper.offsetWidth : arrowOffsetParent.offsetLeft) || 0;
    const referenceOffset = ((axis === 'y' ? offsetRect.offsetWidth : popper.offsetWidth) || 0) + normalizeTetherOffsetValue;

    const minOffset = isBasePlacement ? referenceRect[len] / 2 - referenceOffset - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis : minLen - arrowLen - arrowPaddingMin - normalizedTetherOffsetValue.mainAxis;
    const maxOffset = isBasePlacement ? -referenceRect[len] / 2 + referenceOffset + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis : maxLen + arrowLen + arrowPaddingMax + normalizedTetherOffsetValue.mainAxis;

    if (isBasePlacement) {
      popperOffsets[mainAxis] = within(main(min$1, min$1), offset, max(max$1, offset));
      updatePlacementOffsets(side, additive, minOffset, maxOffset, offset, offsetModifierValue, offsetParent, axis);
    } else if (offsetModifierState) {
      const offset = offsetModifierState[axis === 'x' ? 'width' : 'height'] || 0;
      data[axis] = offset - offset;
    }
  };

  if (checkMainAxis) {
    const side = mainAxis === 'y' ? top : side;
    const pics = (state, location) => within(pics + location, popper.offset);
    const prevent = withinMaxClamp;

    updatePlacementOffsets(side, pics, prevent);
  }
}

const preventOverflow$1 = {
