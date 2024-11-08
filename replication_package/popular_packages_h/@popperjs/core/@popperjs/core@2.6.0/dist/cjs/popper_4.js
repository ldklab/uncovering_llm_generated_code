'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

// Utility function to get bounding rect of an element
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

// Retrieve window object associated with a node
function getWindow(node) {
  if (node.toString() !== '[object Window]') {
    const ownerDocument = node.ownerDocument;
    return ownerDocument ? ownerDocument.defaultView || window : window;
  }
  return node;
}

// Get scroll positions of the window
function getWindowScroll(node) {
  const win = getWindow(node);
  return { scrollLeft: win.pageXOffset, scrollTop: win.pageYOffset };
}

// Check if a node is an Element
function isElement(node) {
  const OwnElement = getWindow(node).Element;
  return node instanceof OwnElement || node instanceof Element;
}

// Check if a node is an HTMLElement
function isHTMLElement(node) {
  const OwnElement = getWindow(node).HTMLElement;
  return node instanceof OwnElement || node instanceof HTMLElement;
}

// Retrieve the scrollable parent of a node
function getScrollParent(node) {
  if (['html', 'body', '#document'].includes(getNodeName(node))) {
    return node.ownerDocument.body;
  }
  if (isHTMLElement(node) && isScrollParent(node)) {
    return node;
  }
  return getScrollParent(getParentNode(node));
}

// Popper generator function that creates and manages poppers
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

    const instance = {
      state,
      setOptions(newOptions) {
        state.options = { ...defaultOptions, ...newOptions };
        state.scrollParents = {
          reference: isElement(reference) ? listScrollParents(reference) : reference.contextElement ? listScrollParents(reference.contextElement) : [],
          popper: listScrollParents(popper)
        };
        state.orderedModifiers = orderModifiers(mergeByName([...defaultModifiers, state.options.modifiers])).filter(m => m.enabled);
        runModifierEffects();
        return instance.update();
      },
      forceUpdate() {
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
            state = modifier.fn({ state, options: modifier.options || {}, name: modifier.name, instance }) || state;
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

    instance.setOptions(options).then(state => {
      if (!isDestroyed && options.onFirstUpdate) {
        options.onFirstUpdate(state);
      }
    });

    return instance;
  };
}

exports.createPopper = popperGenerator({ defaultModifiers });
exports.createPopperLite = popperGenerator({ defaultModifiers: defaultModifiers.slice(0, 4) });
//# sourceMappingURL=popper.js.map
