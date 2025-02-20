(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory(exports, require('@floating-ui/core'));
  } else if (typeof define === 'function' && define.amd) {
    define(['exports', '@floating-ui/core'], factory);
  } else {
    global = typeof globalThis !== 'undefined' ? globalThis : global || self;
    factory(global.FloatingUIDOM = {}, global.FloatingUICore);
  }
})(this, function (exports, core) {
  'use strict';

  // Helper to create coordinate objects
  const createCoords = v => ({ x: v, y: v });

  // DOM utility functions
  function hasWindow() {
    return typeof window !== 'undefined';
  }

  function isNode(value) {
    if (!hasWindow()) {
      return false;
    }
    const win = getWindow(value);
    return value instanceof Node || value instanceof win.Node;
  }

  function getWindow(node) {
    return (node && node.ownerDocument && node.ownerDocument.defaultView) || window;
  }

  function getDocumentElement(node) {
    return (isNode(node) ? node.ownerDocument : node.document || window.document).documentElement;
  }

  // Floating element utilities
  function getBoundingClientRect(element, includeScale = false, isFixedStrategy = false, offsetParent) {
    const clientRect = element.getBoundingClientRect();
    const scale = includeScale ? getScale(offsetParent || element) : createCoords(1);
    const visualOffsets = shouldAddVisualOffsets(unwrapElement(element), isFixedStrategy, offsetParent)
      ? getVisualOffsets(element)
      : createCoords(0);
    return core.rectToClientRect({
      width: clientRect.width / scale.x,
      height: clientRect.height / scale.y,
      x: (clientRect.left + visualOffsets.x) / scale.x,
      y: (clientRect.top + visualOffsets.y) / scale.y
    });
  }

  // Determines if visual offsets should be added
  function shouldAddVisualOffsets(element, isFixed, floatingOffsetParent) {
    return floatingOffsetParent && isFixed;
  }

  // Main export functions related to positioning
  const computePosition = (reference, floating, options) => {
    const cache = new Map();
    const platform = { ...options.platform, _c: cache };
    return core.computePosition(reference, floating, { ...options, platform });
  };

  // Automatically updates the position of the floating element
  function autoUpdate(reference, floating, update, options = {}) {
    const { ancestorScroll = true, ancestorResize = true, elementResize = typeof ResizeObserver === 'function' } = options;
    const referenceEl = unwrapElement(reference);
    const ancestors = ancestorScroll || ancestorResize ? [...getOverflowAncestors(referenceEl), ...getOverflowAncestors(floating)] : [];

    ancestors.forEach(ancestor => {
      if (ancestorScroll) ancestor.addEventListener('scroll', update, { passive: true });
      if (ancestorResize) ancestor.addEventListener('resize', update);
    });

    let resizeObserver = null;
    if (elementResize) {
      resizeObserver = new ResizeObserver(() => update());
      if (referenceEl) {
        resizeObserver.observe(referenceEl);
      }
      resizeObserver.observe(floating);
    }

    update();
    return () => {
      ancestors.forEach(ancestor => {
        if (ancestorScroll) ancestor.removeEventListener('scroll', update);
        if (ancestorResize) ancestor.removeEventListener('resize', update);
      });
      resizeObserver && resizeObserver.disconnect();
    };
  }

  // Exporting functions and variables
  exports.computePosition = computePosition;
  exports.autoUpdate = autoUpdate;
  exports.getBoundingClientRect = getBoundingClientRect;
});
