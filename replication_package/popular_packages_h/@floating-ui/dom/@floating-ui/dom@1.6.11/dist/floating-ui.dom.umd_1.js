(function(root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports, require('@floating-ui/core'));
  } else if (typeof define === 'function' && define.amd) {
    define(['exports', '@floating-ui/core'], factory);
  } else {
    root = typeof globalThis !== 'undefined' ? globalThis : root || self;
    factory(root.FloatingUIDOM = {}, root.FloatingUICore);
  }
})(this, (function(exports, core) {
  'use strict';

  const min = Math.min, max = Math.max, round = Math.round, floor = Math.floor;
  const createCoords = v => ({ x: v, y: v });

  function hasWindow() {
    return typeof window !== 'undefined';
  }
  function getNodeName(node) {
    return isNode(node) ? (node.nodeName || '').toLowerCase() : '#document';
  }
  function getWindow(node) {
    return node?.ownerDocument?.defaultView || window;
  }
  function getDocumentElement(node) {
    return (isNode(node) ? node.ownerDocument : node.document) || window.document.documentElement;
  }
  function isNode(value) {
    return hasWindow() && (value instanceof Node || value instanceof getWindow(value).Node);
  }
  function isElement(value) {
    return hasWindow() && (value instanceof Element || value instanceof getWindow(value).Element);
  }
  function isHTMLElement(value) {
    return hasWindow() && (value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement);
  }
  function isShadowRoot(value) {
    return hasWindow() && typeof ShadowRoot !== 'undefined' &&
           (value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot);
  }
  function isOverflowElement(element) {
    const { overflow, overflowX, overflowY, display } = getComputedStyle(element);
    return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowY + overflowX) &&
           !['inline', 'contents'].includes(display);
  }
  function isTableElement(element) {
    return ['table', 'td', 'th'].includes(getNodeName(element));
  }
  function isTopLayer(element) {
    return [':popover-open', ':modal'].some(selector => {
      try { return element.matches(selector); } catch { return false; }
    });
  }
  function isContainingBlock(elementOrCss) {
    const webkit = isWebKit();
    const css = isElement(elementOrCss) ? getComputedStyle(elementOrCss) : elementOrCss;
    return css.transform !== 'none' || css.perspective !== 'none' || 
           (css.containerType ? css.containerType !== 'normal' : false) ||
           !webkit && (css.backdropFilter ? css.backdropFilter !== 'none' : false) || 
           !webkit && (css.filter ? css.filter !== 'none' : false) ||
           ['transform', 'perspective', 'filter'].some(value => (css.willChange || '').includes(value)) || 
           ['paint', 'layout', 'strict', 'content'].some(value => (css.contain || '').includes(value));
  }
  function getContainingBlock(element) {
    let currentNode = getParentNode(element);
    while (isHTMLElement(currentNode) && !isLastTraversableNode(currentNode)) {
      if (isContainingBlock(currentNode)) return currentNode;
      else if (isTopLayer(currentNode)) return null;
      currentNode = getParentNode(currentNode);
    }
    return null;
  }
  function isWebKit() {
    return typeof CSS !== 'undefined' && CSS.supports && CSS.supports('-webkit-backdrop-filter', 'none');
  }
  function isLastTraversableNode(node) {
    return ['html', 'body', '#document'].includes(getNodeName(node));
  }
  function getComputedStyle(element) {
    return getWindow(element).getComputedStyle(element);
  }
  function getNodeScroll(element) {
    if (isElement(element)) {
      return { scrollLeft: element.scrollLeft, scrollTop: element.scrollTop };
    }
    return { scrollLeft: element.scrollX, scrollTop: element.scrollY };
  }
  function getParentNode(node) {
    if (getNodeName(node) === 'html') {
      return node;
    }
    const result = node.assignedSlot || node.parentNode || 
                   (isShadowRoot(node) && node.host) || getDocumentElement(node);
    return isShadowRoot(result) ? result.host : result;
  }
  function getNearestOverflowAncestor(node) {
    const parentNode = getParentNode(node);
    if (isLastTraversableNode(parentNode)) {
      return node.ownerDocument ? node.ownerDocument.body : node.body;
    }
    if (isHTMLElement(parentNode) && isOverflowElement(parentNode)) {
      return parentNode;
    }
    return getNearestOverflowAncestor(parentNode);
  }
  function getOverflowAncestors(node, list = [], traverseIframes = true) {
    const scrollableAncestor = getNearestOverflowAncestor(node);
    const isBody = scrollableAncestor === node.ownerDocument?.body;
    if (isBody) {
      const frameElement = getFrameElement(getWindow(scrollableAncestor));
      return list.concat(getWindow(scrollableAncestor), (getWindow(scrollableAncestor).visualViewport || []), 
                         (isOverflowElement(scrollableAncestor) ? scrollableAncestor : []), 
                         (frameElement && traverseIframes) ? getOverflowAncestors(frameElement) : []);
    }
    return list.concat(scrollableAncestor, getOverflowAncestors(scrollableAncestor, [], traverseIframes));
  }
  function getFrameElement(win) {
    return win.parent && Object.getPrototypeOf(win.parent) ? win.frameElement : null;
  }

  function getCssDimensions(element) {
    const css = getComputedStyle(element);
    let width = parseFloat(css.width) || 0;
    let height = parseFloat(css.height) || 0;
    const hasOffset = isHTMLElement(element);
    const offsetWidth = hasOffset ? element.offsetWidth : width;
    const offsetHeight = hasOffset ? element.offsetHeight : height;
    const shouldFallback = round(width) !== offsetWidth || round(height) !== offsetHeight;
    if (shouldFallback) {
      width = offsetWidth;
      height = offsetHeight;
    }
    return { width, height, $: shouldFallback };
  }

  function unwrapElement(element) {
    return !isElement(element) ? element.contextElement : element;
  }

  function getScale(element) {
    const domElement = unwrapElement(element);
    if (!isHTMLElement(domElement)) {
      return createCoords(1);
    }
    const rect = domElement.getBoundingClientRect();
    const { width, height, $ } = getCssDimensions(domElement);
    let x = ($ ? round(rect.width) : rect.width) / width;
    let y = ($ ? round(rect.height) : rect.height) / height;
    if (!x || !Number.isFinite(x)) x = 1;
    if (!y || !Number.isFinite(y)) y = 1;
    return { x, y };
  }

  const noOffsets = createCoords(0);
  function getVisualOffsets(element) {
    const win = getWindow(element);
    if (!isWebKit() || !win.visualViewport) {
      return noOffsets;
    }
    return { x: win.visualViewport.offsetLeft, y: win.visualViewport.offsetTop };
  }
  function shouldAddVisualOffsets(element, isFixed = false, floatingOffsetParent) {
    if (!floatingOffsetParent || isFixed && floatingOffsetParent !== getWindow(element)) {
      return false;
    }
    return isFixed;
  }

  function getBoundingClientRect(element, includeScale = false, isFixedStrategy = false, offsetParent) {
    const clientRect = element.getBoundingClientRect();
    const domElement = unwrapElement(element);
    let scale = createCoords(1);
    if (includeScale) {
      scale = offsetParent ? (isElement(offsetParent) ? getScale(offsetParent) : createCoords(1)) : getScale(element);
    }
    const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? 
                          getVisualOffsets(domElement) : createCoords(0);
    let x = (clientRect.left + visualOffsets.x) / scale.x;
    let y = (clientRect.top + visualOffsets.y) / scale.y;
    let width = clientRect.width / scale.x;
    let height = clientRect.height / scale.y;
    if (domElement) {
      let currentIFrame = getFrameElement(getWindow(domElement));
      let currentWin = getWindow(domElement);
      while (currentIFrame && offsetParent && getWindow(offsetParent) !== currentWin) {
        const iframeScale = getScale(currentIFrame);
        const iframeRect = currentIFrame.getBoundingClientRect();
        const css = getComputedStyle(currentIFrame);
        x *= iframeScale.x;
        y *= iframeScale.y;
        width *= iframeScale.x;
        height *= iframeScale.y;
        x += iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
        y += iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
        currentWin = getWindow(currentIFrame);
        currentIFrame = getFrameElement(currentWin);
      }
    }
    return core.rectToClientRect({ width, height, x, y });
  }

  function convertOffsetParentRelativeRectToViewportRelativeRect({ elements, rect, offsetParent, strategy }) {
    const isFixed = strategy === 'fixed';
    const documentElement = getDocumentElement(offsetParent);
    const topLayer = elements ? isTopLayer(elements.floating) : false;
    if (offsetParent === documentElement || topLayer && isFixed) {
      return rect;
    }
    let scroll = { scrollLeft: 0, scrollTop: 0 };
    let scale = createCoords(1);
    const offsets = createCoords(0);
    const isOffsetParentAnElement = isHTMLElement(offsetParent);
    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isHTMLElement(offsetParent)) {
        const offsetRect = getBoundingClientRect(offsetParent);
        scale = getScale(offsetParent);
        offsets.x = offsetRect.x + offsetParent.clientLeft;
        offsets.y = offsetRect.y + offsetParent.clientTop;
      }
    }
    return {
      width: rect.width * scale.x,
      height: rect.height * scale.y,
      x: rect.x * scale.x - scroll.scrollLeft * scale.x + offsets.x,
      y: rect.y * scale.y - scroll.scrollTop * scale.y + offsets.y
    };
  }

  function getClientRects(element) {
    return Array.from(element.getClientRects());
  }

  function getWindowScrollBarX(element, rect) {
    const leftScroll = getNodeScroll(element).scrollLeft;
    return rect ? rect.left + leftScroll : getBoundingClientRect(getDocumentElement(element)).left + leftScroll;
  }

  function getDocumentRect(element) {
    const html = getDocumentElement(element);
    const scroll = getNodeScroll(element);
    const body = element.ownerDocument.body;
    const width = max(html.scrollWidth, html.clientWidth, body.scrollWidth, body.clientWidth);
    const height = max(html.scrollHeight, html.clientHeight, body.scrollHeight, body.clientHeight);
    let x = -scroll.scrollLeft + getWindowScrollBarX(element);
    const y = -scroll.scrollTop;
    if (getComputedStyle(body).direction === 'rtl') {
      x += max(html.clientWidth, body.clientWidth) - width;
    }
    return { width, height, x, y };
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
      const visualViewportBased = isWebKit();
      if (!visualViewportBased || (visualViewportBased && strategy === 'fixed')) {
        x = visualViewport.offsetLeft;
        y = visualViewport.offsetTop;
      }
    }
    return { width, height, x, y };
  }

  function getInnerBoundingClientRect(element, strategy) {
    const clientRect = getBoundingClientRect(element, true, strategy === 'fixed');
    const top = clientRect.top + element.clientTop;
    const left = clientRect.left + element.clientLeft;
    const scale = isHTMLElement(element) ? getScale(element) : createCoords(1);
    const width = element.clientWidth * scale.x;
    const height = element.clientHeight * scale.y;
    const x = left * scale.x;
    const y = top * scale.y;
    return { width, height, x, y };
  }

  function getClientRectFromClippingAncestor(element, clippingAncestor, strategy) {
    let rect;
    if (clippingAncestor === 'viewport') {
      rect = getViewportRect(element, strategy);
    } else if (clippingAncestor === 'document') {
      rect = getDocumentRect(getDocumentElement(element));
    } else if (isElement(clippingAncestor)) {
      rect = getInnerBoundingClientRect(clippingAncestor, strategy);
    } else {
      const visualOffsets = getVisualOffsets(element);
      rect = { ...clippingAncestor, x: clippingAncestor.x - visualOffsets.x, y: clippingAncestor.y - visualOffsets.y };
    }
    return core.rectToClientRect(rect);
  }

  function hasFixedPositionAncestor(element, stopNode) {
    const parentNode = getParentNode(element);
    if (parentNode === stopNode || !isElement(parentNode) || isLastTraversableNode(parentNode)) {
      return false;
    }
    return getComputedStyle(parentNode).position === 'fixed' || hasFixedPositionAncestor(parentNode, stopNode);
  }

  function getClippingElementAncestors(element, cache) {
    const cachedResult = cache.get(element);
    if (cachedResult) {
      return cachedResult;
    }
    let result = getOverflowAncestors(element, [], false).filter(el => isElement(el) && getNodeName(el) !== 'body');
    let currentContainingBlockComputedStyle = null;
    const elementIsFixed = getComputedStyle(element).position === 'fixed';
    let currentNode = elementIsFixed ? getParentNode(element) : element;
    while (isElement(currentNode) && !isLastTraversableNode(currentNode)) {
      const computedStyle = getComputedStyle(currentNode);
      const currentNodeIsContaining = isContainingBlock(currentNode);
      if (!currentNodeIsContaining && computedStyle.position === 'fixed') {
        currentContainingBlockComputedStyle = null;
      }
      const shouldDropCurrentNode = elementIsFixed ? 
                                    !currentNodeIsContaining && !currentContainingBlockComputedStyle : 
                                    !currentNodeIsContaining && computedStyle.position === 'static' && !!currentContainingBlockComputedStyle &&
                                    ['absolute', 'fixed'].includes(currentContainingBlockComputedStyle.position) || 
                                    isOverflowElement(currentNode) && !currentNodeIsContaining && hasFixedPositionAncestor(element, currentNode);
      if (shouldDropCurrentNode) {
        result = result.filter(ancestor => ancestor !== currentNode);
      } else {
        currentContainingBlockComputedStyle = computedStyle;
      }
      currentNode = getParentNode(currentNode);
    }
    cache.set(element, result);
    return result;
  }

  function getClippingRect({ element, boundary, rootBoundary, strategy }) {
    const elementClippingAncestors = boundary === 'clippingAncestors' ? 
                                     (isTopLayer(element) ? [] : getClippingElementAncestors(element, this._c)) :
                                     [...boundary];
    const clippingAncestors = [...elementClippingAncestors, rootBoundary];
    const firstClippingAncestor = clippingAncestors[0];
    const clippingRect = clippingAncestors.reduce((accRect, clippingAncestor) => {
      const rect = getClientRectFromClippingAncestor(element, clippingAncestor, strategy);
      accRect.top = max(rect.top, accRect.top);
      accRect.right = min(rect.right, accRect.right);
      accRect.bottom = min(rect.bottom, accRect.bottom);
      accRect.left = max(rect.left, accRect.left);
      return accRect;
    }, getClientRectFromClippingAncestor(element, firstClippingAncestor, strategy));
    return { width: clippingRect.right - clippingRect.left, height: clippingRect.bottom - clippingRect.top, x: clippingRect.left, y: clippingRect.top };
  }

  function getDimensions(element) {
    const { width, height } = getCssDimensions(element);
    return { width, height };
  }

  function getRectRelativeToOffsetParent(element, offsetParent, strategy) {
    const isOffsetParentAnElement = isHTMLElement(offsetParent);
    const documentElement = getDocumentElement(offsetParent);
    const isFixed = strategy === 'fixed';
    const rect = getBoundingClientRect(element, true, isFixed, offsetParent);
    let scroll = { scrollLeft: 0, scrollTop: 0 };
    const offsets = createCoords(0);
    if (isOffsetParentAnElement || !isOffsetParentAnElement && !isFixed) {
      if (getNodeName(offsetParent) !== 'body' || isOverflowElement(documentElement)) {
        scroll = getNodeScroll(offsetParent);
      }
      if (isOffsetParentAnElement) {
        const offsetRect = getBoundingClientRect(offsetParent, true, isFixed, offsetParent);
        offsets.x = offsetRect.x + offsetParent.clientLeft;
        offsets.y = offsetRect.y + offsetParent.clientTop;
      } else if (documentElement) {
        offsets.x = getWindowScrollBarX(documentElement);
      }
    }
    const htmlRect = documentElement ? documentElement.getBoundingClientRect() : { top: 0, left: 0 };
    const htmlX = documentElement && !isOffsetParentAnElement && !isFixed ? htmlRect.left + scroll.scrollLeft - getWindowScrollBarX(documentElement, htmlRect) : 0;
    const htmlY = documentElement && !isOffsetParentAnElement && !isFixed ? htmlRect.top + scroll.scrollTop : 0;
    const x = rect.left + scroll.scrollLeft - offsets.x - htmlX;
    const y = rect.top + scroll.scrollTop - offsets.y - htmlY;
    return { x, y, width: rect.width, height: rect.height };
  }

  function isStaticPositioned(element) {
    return getComputedStyle(element).position === 'static';
  }

  function getTrueOffsetParent(element, polyfill) {
    if (!isHTMLElement(element) || getComputedStyle(element).position === 'fixed') {
      return null;
    }
    if (polyfill) {
      return polyfill(element);
    }
    let rawOffsetParent = element.offsetParent;
    if (getDocumentElement(element) === rawOffsetParent) {
      rawOffsetParent = rawOffsetParent.ownerDocument.body;
    }
    return rawOffsetParent;
  }

  function getOffsetParent(element, polyfill) {
    const win = getWindow(element);
    if (isTopLayer(element)) {
      return win;
    }
    if (!isHTMLElement(element)) {
      let svgOffsetParent = getParentNode(element);
      while (svgOffsetParent && !isLastTraversableNode(svgOffsetParent)) {
        if (isElement(svgOffsetParent) && !isStaticPositioned(svgOffsetParent)) {
          return svgOffsetParent;
        }
        svgOffsetParent = getParentNode(svgOffsetParent);
      }
      return win;
    }
    let offsetParent = getTrueOffsetParent(element, polyfill);
    while (offsetParent && isTableElement(offsetParent) && isStaticPositioned(offsetParent)) {
      offsetParent = getTrueOffsetParent(offsetParent, polyfill);
    }
    if (offsetParent && isLastTraversableNode(offsetParent) && isStaticPositioned(offsetParent) && !isContainingBlock(offsetParent)) {
      return win;
    }
    return offsetParent || getContainingBlock(element) || win;
  }

  async function getElementRects(data) {
    const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
    const getDimensionsFn = this.getDimensions;
    const floatingDimensions = await getDimensionsFn(data.floating);
    return {
      reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
      floating: { x: 0, y: 0, width: floatingDimensions.width, height: floatingDimensions.height }
    };
  }

  function isRTL(element) {
    return getComputedStyle(element).direction === 'rtl';
  }

  const platform = {
    convertOffsetParentRelativeRectToViewportRelativeRect,
    getDocumentElement,
    getClippingRect,
    getOffsetParent,
    getElementRects,
    getClientRects,
    getDimensions,
    getScale,
    isElement,
    isRTL
  };

  function observeMove(element, onMove) {
    let io = null;
    let timeoutId;
    const root = getDocumentElement(element);
    function cleanup() {
      clearTimeout(timeoutId);
      io?.disconnect();
      io = null;
    }
    function refresh(skip = false, threshold = 1) {
      cleanup();
      const { left, top, width, height } = element.getBoundingClientRect();
      if (!skip) { onMove(); }
      if (!width || !height) { return; }
      const insetTop = floor(top);
      const insetRight = floor(root.clientWidth - (left + width));
      const insetBottom = floor(root.clientHeight - (top + height));
      const insetLeft = floor(left);
      const rootMargin = `${-insetTop}px ${-insetRight}px ${-insetBottom}px ${-insetLeft}px`;
      const options = { rootMargin, threshold: max(0, min(1, threshold)) || 1 };
      let isFirstUpdate = true;
      function handleObserve(entries) {
        const ratio = entries[0].intersectionRatio;
        if (ratio !== threshold) {
          if (!isFirstUpdate) return refresh();
          if (!ratio) {
            timeoutId = setTimeout(() => refresh(false, 1e-7), 1000);
          } else {
            refresh(false, ratio);
          }
        }
        isFirstUpdate = false;
      }
      try {
        io = new IntersectionObserver(handleObserve, { ...options, root: root.ownerDocument });
      } catch {
        io = new IntersectionObserver(handleObserve, options);
      }
      io.observe(element);
    }
    refresh(true);
    return cleanup;
  }

  function autoUpdate(reference, floating, update, { ancestorScroll = true, ancestorResize = true, elementResize = typeof ResizeObserver === 'function', layoutShift = typeof IntersectionObserver === 'function', animationFrame = false } = {}) {
    const referenceEl = unwrapElement(reference);
    const ancestors = (ancestorScroll || ancestorResize) ? [...(referenceEl ? getOverflowAncestors(referenceEl) : []), ...getOverflowAncestors(floating)] : [];
    ancestors.forEach(ancestor => {
      ancestorScroll && ancestor.addEventListener('scroll', update, { passive: true });
      ancestorResize && ancestor.addEventListener('resize', update);
    });
    const cleanupIo = referenceEl && layoutShift ? observeMove(referenceEl, update) : null;
    let resizeObserver = null;
    let reobserveFrame = -1;
    if (elementResize) {
      resizeObserver = new ResizeObserver(([firstEntry]) => {
        if (firstEntry && firstEntry.target === referenceEl && resizeObserver) {
          resizeObserver.unobserve(floating);
          cancelAnimationFrame(reobserveFrame);
          reobserveFrame = requestAnimationFrame(() => {
            resizeObserver?.observe(floating);
          });
          update();
        }
      });
      if (referenceEl && !animationFrame) {
        resizeObserver.observe(referenceEl);
      }
      resizeObserver.observe(floating);
    }
    let frameId;
    let prevRefRect = animationFrame ? getBoundingClientRect(reference) : null;
    if (animationFrame) {
      frameLoop();
    }
    function frameLoop() {
      const nextRefRect = getBoundingClientRect(reference);
      if (prevRefRect && (nextRefRect.x !== prevRefRect.x || nextRefRect.y !== prevRefRect.y || nextRefRect.width !== prevRefRect.width || nextRefRect.height !== prevRefRect.height)) {
        update();
      }
      prevRefRect = nextRefRect;
      frameId = requestAnimationFrame(frameLoop);
    }
    update();
    return () => {
      ancestors.forEach(ancestor => {
        ancestorScroll && ancestor.removeEventListener('scroll', update);
        ancestorResize && ancestor.removeEventListener('resize', update);
      });
      cleanupIo?.();
      resizeObserver?.disconnect();
      if (animationFrame) {
        cancelAnimationFrame(frameId);
      }
    };
  }

  const {
    detectOverflow,
    offset,
    autoPlacement,
    shift,
    flip,
    size,
    hide,
    arrow,
    inline,
    limitShift,
    computePosition
  } = core;

  exports.arrow = arrow;
  exports.autoPlacement = autoPlacement;
  exports.autoUpdate = autoUpdate;
  exports.computePosition = computePosition;
  exports.detectOverflow = detectOverflow;
  exports.flip = flip;
  exports.getOverflowAncestors = getOverflowAncestors;
  exports.hide = hide;
  exports.inline = inline;
  exports.limitShift = limitShift;
  exports.offset = offset;
  exports.platform = platform;
  exports.shift = shift;
  exports.size = size;
  
}));
