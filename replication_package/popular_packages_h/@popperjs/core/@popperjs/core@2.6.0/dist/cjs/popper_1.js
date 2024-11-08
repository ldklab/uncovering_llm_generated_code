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
  return node.toString() !== '[object Window]' ? node.ownerDocument.defaultView || window : node;
}

function getWindowScroll(node) {
  const win = getWindow(node);
  return {
    scrollLeft: win.pageXOffset,
    scrollTop: win.pageYOffset
  };
}

function isElement(node) {
  const OwnElement = getWindow(node).Element;
  return node instanceof OwnElement || node instanceof Element;
}

function getDocumentElement(element) {
  return isElement(element) ? element.ownerDocument.documentElement : element.document.documentElement;
}

function getWindowScrollBarX(element) {
  return getBoundingClientRect(getDocumentElement(element)).left + getWindowScroll(element).scrollLeft;
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

function createPopper(reference, popper, options = {}) {
  const state = {
    placement: 'bottom',
    orderedModifiers: [],
    options: { ...DEFAULT_OPTIONS, ...options },
    modifiersData: {},
    elements: { reference, popper },
    attributes: {},
    styles: {}
  };

  const instance = {
    state,
    setOptions(options) {
      state.options = { ...DEFAULT_OPTIONS, ...options };
      state.orderedModifiers = orderModifiers([...defaultModifiers, ...state.options.modifiers])
                              .filter(mod => mod.enabled);
      runModifierEffects();
      return instance.update();
    },
    forceUpdate() {
      const { reference, popper } = state.elements;
      if (!areValidElements(reference, popper)) {
        console.error(INVALID_ELEMENT_ERROR);
        return;
      }
      state.rects = {
        reference: getCompositeRect(reference, getOffsetParent(popper), state.options.strategy === 'fixed'),
        popper: getLayoutRect(popper)
      };
      state.reset = false;
      state.placement = state.options.placement;
      state.orderedModifiers.forEach(modifier => {
        if (typeof modifier.fn === 'function') {
          state = modifier.fn({...state, name: modifier.name, instance}) || state;
        }
      });
    },
    update: debounce(() => {
      return new Promise(resolve => {
        instance.forceUpdate();
        resolve(state);
      });
    }),
    destroy() {
      isDestroyed = true;
    }
  };

  if (!areValidElements(reference, popper)) {
    console.error(INVALID_ELEMENT_ERROR);
    return instance;
  }

  instance.setOptions(options).then(state => {
    if (options.onFirstUpdate) {
      options.onFirstUpdate(state);
    }
  });
  
  return instance;
}

exports.createPopper = createPopper;
