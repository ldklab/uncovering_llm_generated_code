(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports, require('@floating-ui/core'));
  } else if (typeof define === 'function' && define.amd) {
    define(['exports', '@floating-ui/core'], factory);
  } else {
    global = typeof globalThis !== 'undefined' ? globalThis : global || self;
    factory(global.FloatingUIDOM = {}, global.FloatingUICore);
  }
})(this, (function (exports, core) {
  'use strict';

  // Utility functions for checking if environment supports windows or has specific node types
  function hasWindow() { return typeof window !== 'undefined'; }
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
    if (!hasWindow() || !window.ShadowRoot) return false;
    return value instanceof ShadowRoot || value instanceof getWindow(value).ShadowRoot;
  }

  // Function to get the bounding client rectangle of an element
  function getBoundingClientRect(element, includeScale = false, isFixedStrategy = false, offsetParent) {
    const clientRect = element.getBoundingClientRect();
    const domElement = unwrapElement(element);

    let scale = { x: 1, y: 1 };
    if (includeScale) {
      scale = offsetParent ? getScale(offsetParent) : getScale(element);
    }
    const visualOffsets = shouldAddVisualOffsets(domElement, isFixedStrategy, offsetParent)
      ? getVisualOffsets(domElement)
      : { x: 0, y: 0 };
    let x = (clientRect.left + visualOffsets.x) / scale.x;
    let y = (clientRect.top + visualOffsets.y) / scale.y;
    let width = clientRect.width / scale.x;
    let height = clientRect.height / scale.y;

    // Adjusts the coordinates in cases where iframes may affect positioning
    if (domElement) {
      const win = getWindow(domElement);
      const offsetWin = offsetParent && isElement(offsetParent) ? getWindow(offsetParent) : offsetParent;
      let currentWin = win;
      let currentIFrame = getFrameElement(currentWin);
      while (currentIFrame && offsetParent && offsetWin !== currentWin) {
        const iframeScale = getScale(currentIFrame);
        const iframeRect = currentIFrame.getBoundingClientRect();
        const css = getComputedStyle(currentIFrame);
        const left = iframeRect.left + (currentIFrame.clientLeft + parseFloat(css.paddingLeft)) * iframeScale.x;
        const top = iframeRect.top + (currentIFrame.clientTop + parseFloat(css.paddingTop)) * iframeScale.y;
        x *= iframeScale.x;
        y *= iframeScale.y;
        width *= iframeScale.x;
        height *= iframeScale.y;
        x += left;
        y += top;
        currentWin = getWindow(currentIFrame);
        currentIFrame = getFrameElement(currentWin);
      }
    }

    return core.rectToClientRect({ width, height, x, y });
  }

  // Defines the core functionality of the module
  const platform = {
    convertOffsetParentRelativeRectToViewportRelativeRect,
    getDocumentElement(node) {
      if (isNode(node)) {
        return node.ownerDocument || node.document;
      }
      return window.document;
    },
    getClippingRect,
    getOffsetParent,
    getElementRects: async function (data) {
      const getOffsetParentFn = this.getOffsetParent || getOffsetParent;
      const getDimensionsFn = this.getDimensions;
      const floatingDimensions = await getDimensionsFn(data.floating);
      return {
        reference: getRectRelativeToOffsetParent(data.reference, await getOffsetParentFn(data.floating), data.strategy),
        floating: { x: 0, y: 0, width: floatingDimensions.width, height: floatingDimensions.height }
      };
    },
    getClientRects(element) { return Array.from(element.getClientRects()); },
    getDimensions(element) {
      const { width, height } = getCssDimensions(element);
      return { width, height };
    },
    getScale,
    isElement,
    isRTL
  };

  // Initialization of various plugins from the floating-ui/core
  ['autoPlacement', 'autoUpdate', 'computePosition', 'detectOverflow', 'flip', 'getOverflowAncestors', 'hide', 'inline', 'limitShift', 'offset', 'platform', 'shift', 'size', 'arrow'].forEach(name => {
    exports[name] = core[name];
  });

}));
