// Popper.js-like implementation to handle positioning of elements

'use strict';

function getWindow(node) {
  if (node == null) {
    return window;
  }
  if (node.toString() !== '[object Window]') {
    return node.ownerDocument?.defaultView || window;
  }
  return node;
}

function isElement(node) {
  return node instanceof (getWindow(node).Element || Element);
}

function isHTMLElement(node) {
  return node instanceof (getWindow(node).HTMLElement || HTMLElement);
}

function getBoundingClientRect(element, includeScale = false, isFixedStrategy = false) {
  const clientRect = element.getBoundingClientRect();
  const scaleX = includeScale && isHTMLElement(element) ? round(clientRect.width) / element.offsetWidth || 1 : 1;
  const scaleY = includeScale && isHTMLElement(element) ? round(clientRect.height) / element.offsetHeight || 1 : 1;

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
  return node === getWindow(node) || !isHTMLElement(node) ? getWindowScroll(node) : getHTMLElementScroll(node);
}

function getDocumentElement(element) {
  return ((isElement(element) ? element.ownerDocument : // $FlowFixMe[prop-missing]
    element.document) || window.document).documentElement;
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

function getOffsetParent(element) {
  const window = getWindow(element);
  let offsetParent = element.offsetParent;
  while (offsetParent && (isTableElement(offsetParent) && getComputedStyle(offsetParent).position === 'static')) {
    offsetParent = offsetParent.offsetParent;
  }
  return offsetParent || window;
}

function popperGenerator(generatorOptions = {}) {
  const { defaultModifiers = [], defaultOptions = DEFAULT_OPTIONS } = generatorOptions;
  return function createPopper(reference, popper, options = defaultOptions) {
    const state = {
      placement: 'bottom',
      orderedModifiers: [],
      options: { ...DEFAULT_OPTIONS, ...defaultOptions, ...options },
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
        const orderedModifiers = orderModifiers(mergeByName([...defaultModifiers, ...state.options.modifiers]));

        state.orderedModifiers = orderedModifiers.filter(m => m.enabled);
        runModifierEffects();
        return instance.update();
      },
      forceUpdate() {
        if (isDestroyed) return;
        if (!areValidElements(state.elements.reference, state.elements.popper)) return;

        state.rects = {
          reference: getCompositeRect(state.elements.reference, getOffsetParent(state.elements.popper), state.options.strategy === 'fixed'),
          popper: getLayoutRect(state.elements.popper)
        };
        state.reset = false;
        state.placement = state.options.placement;
        state.orderedModifiers.forEach(modifier => state.modifiersData[modifier.name] = { ...modifier.data });

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
      update: debounce(() => new Promise(resolve => {
        instance.forceUpdate();
        resolve(state);
      })),
      destroy() {
        cleanupModifierEffects();
        isDestroyed = true;
      }
    };

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
      effectCleanupFns.length = 0;
    }

    if (!areValidElements(reference, popper)) return instance;

    instance.setOptions(options).then(state => {
      if (!isDestroyed && options.onFirstUpdate) {
        options.onFirstUpdate(state);
      }
    });

    return instance;
  };
}

const DEFAULT_OPTIONS = {
  placement: 'bottom',
  modifiers: [],
  strategy: 'absolute'
};

function areValidElements(...args) {
  return !args.some(element => !(element && typeof element.getBoundingClientRect === 'function'));
}

function listScrollParents(element, list = []) {
  const scrollParent = getScrollParent(element);
  const isBody = scrollParent === element.ownerDocument?.body;
  const win = getWindow(scrollParent);
  const target = isBody ? [win].concat(win.visualViewport || [], isScrollParent(scrollParent) ? scrollParent : []) : scrollParent;
  return isBody ? [...list, ...target] : listScrollParents(getParentNode(target), list.concat(target));
}

exports.createPopper = popperGenerator({
  defaultModifiers: [eventListeners, popperOffsets, computeStyles, applyStyles, offset, flip, preventOverflow, arrow, hide]
});
