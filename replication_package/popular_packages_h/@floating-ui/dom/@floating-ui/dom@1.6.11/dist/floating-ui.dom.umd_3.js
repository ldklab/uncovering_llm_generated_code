(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    // CommonJS
    factory(exports, require('@floating-ui/core'));
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(['exports', '@floating-ui/core'], factory);
  } else {
    // Browser globals
    const global = typeof globalThis !== 'undefined' ? globalThis : root || self;
    factory(global.FloatingUIDOM = {}, global.FloatingUICore);
  }
})(this, (function (exports, core) {
  'use strict';

  const min = Math.min;
  const max = Math.max;
  const round = Math.round;
  const floor = Math.floor;

  function createCoords(v) {
    return { x: v, y: v };
  }

  function hasWindow() {
    return typeof window !== 'undefined';
  }

  // DOM node utility functions
  function isNode(value) {
    return hasWindow() && (value instanceof Node || value instanceof getWindow(value).Node);
  }

  function isElement(value) {
    return hasWindow() && (value instanceof Element || value instanceof getWindow(value).Element);
  }

  function isHTMLElement(value) {
    return hasWindow() && (value instanceof HTMLElement || value instanceof getWindow(value).HTMLElement);
  }

  function getNodeName(node) {
    return isNode(node) ? (node.nodeName || '').toLowerCase() : '#document';
  }

  function getWindow(node) {
    return (node?.ownerDocument?.defaultView) || window;
  }

  function getDocumentElement(node) {
    return (isNode(node) ? node.ownerDocument : node.document || window.document)?.documentElement;
  }

  function getComputedStyle(element) {
    return getWindow(element).getComputedStyle(element);
  }

  // Overflow and scroll handling
  function isOverflowElement(element) {
    const { overflow, overflowX, overflowY, display } = getComputedStyle(element);
    return /auto|scroll|overlay|hidden|clip/.test(overflow + overflowX + overflowY) && 
           !['inline', 'contents'].includes(display);
  }

  function getNodeScroll(element) {
    return isElement(element) ? { scrollLeft: element.scrollLeft, scrollTop: element.scrollTop } :
                                { scrollLeft: element.scrollX, scrollTop: element.scrollY };
  }

  function getParentNode(node) {
    if (getNodeName(node) === 'html') {
      return node;
    }
    const result = node.assignedSlot || node.parentNode || 
                   (isShadowRoot(node) && node.host) || getDocumentElement(node);
    return isShadowRoot(result) ? result.host : result;
  }

  // WebKit detection
  function isWebKit() {
    return typeof CSS !== 'undefined' && CSS.supports('-webkit-backdrop-filter', 'none');
  }

  function isContainingBlock(elementOrCss) {
    const webkit = isWebKit();
    const css = isElement(elementOrCss) ? getComputedStyle(elementOrCss) : elementOrCss;
    return css.transform !== 'none' || css.perspective !== 'none' || 
           (css.containerType && css.containerType !== 'normal') || 
           (!webkit && (css.backdropFilter !== 'none' || css.filter !== 'none')) || 
           ['transform', 'perspective', 'filter'].some(value => 
             (css.willChange || '').includes(value)) || 
           ['paint', 'layout', 'strict', 'content'].some(value => 
             (css.contain || '').includes(value));
  }
  
  function getBoundingClientRect(element, includeScale = false, isFixedStrategy = false, offsetParent) {
    const clientRect = element.getBoundingClientRect();
    const domElement = unwrapElement(element);
    let scale = createCoords(1);
    if (includeScale) {
      if (offsetParent) {
        scale = isElement(offsetParent) ? getScale(offsetParent) : createCoords(1);
      } else {
        scale = getScale(element);
      }
    }
    const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent) ? 
                          getVisualOffsets(domElement) : createCoords(0);
    let x = (clientRect.left + visualOffsets.x) / scale.x;
    let y = (clientRect.top + visualOffsets.y) / scale.y;
    let width = clientRect.width / scale.x;
    let height = clientRect.height / scale.y;
    if (domElement) {
      let win = getWindow(domElement);
      let currentIFrame = getFrameElement(win);
      while (currentIFrame && offsetParent && getWindow(offsetParent) !== win) {
        const iframeScale = getScale(currentIFrame);
        const iframeRect = currentIFrame.getBoundingClientRect();
        const css = getComputedStyle(currentIFrame);
        x *= iframeScale.x;
        y *= iframeScale.y;
        width *= iframeScale.x;
        height *= iframeScale.y;
        x += iframeRect.left + 
             (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
        y += iframeRect.top + 
             (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
        win = getWindow(currentIFrame);
        currentIFrame = getFrameElement(win);
      }
    }
    return core.rectToClientRect({ width, height, x, y });
  }

  function getElementRects(data) {
    const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
    const getDimensionsFn = this.getDimensions;
    const floatingDimensions = getDimensionsFn(data.floating);
    return {
      reference: getRectRelativeToOffsetParent(data.reference, getOffsetParentFn(data.floating), data.strategy),
      floating: {
        x: 0,
        y: 0,
        width: floatingDimensions.width,
        height: floatingDimensions.height
      }
    };
  }

  // Other utility functions and constants...

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

  // Export functionalities
  exports.arrow = core.arrow;
  exports.autoPlacement = core.autoPlacement;
  exports.autoUpdate = autoUpdate;
  exports.computePosition = core.computePosition;
  exports.detectOverflow = core.detectOverflow;
  exports.flip = core.flip;
  exports.getOverflowAncestors = getOverflowAncestors;
  exports.hide = core.hide;
  exports.inline = core.inline;
  exports.limitShift = core.limitShift;
  exports.offset = core.offset;
  exports.platform = platform;
  exports.shift = core.shift;
  exports.size = core.size;

}));
