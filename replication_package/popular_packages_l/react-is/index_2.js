// react-is.js

// Define symbolic identifiers for various React types.
const ReactTypes = {
  ContextConsumer: Symbol.for('react.context'),
  ContextProvider: Symbol.for('react.provider'),
  Element: Symbol.for('react.element'),
  Fragment: Symbol.for('react.fragment'),
  Portal: Symbol.for('react.portal'),
  StrictMode: Symbol.for('react.strict_mode')
};

// Function to validate if a given type is a legitimate React element type.
function isValidElementType(type) {
  return typeof type === 'string' ||
         typeof type === 'function' ||
         type === ReactTypes.Fragment ||
         type === ReactTypes.StrictMode ||
         (!!type && 
          (type.$$typeof === ReactTypes.ContextProvider ||
           type.$$typeof === ReactTypes.ContextConsumer));
}

// Function to determine the specific React type of a given object.
function typeOf(object) {
  if (object === null || typeof object !== 'object') {
    return undefined;
  }
  const type = object.$$typeof;
  switch(type) {
    case ReactTypes.ContextConsumer:
    case ReactTypes.ContextProvider:
    case ReactTypes.Element:
    case ReactTypes.Fragment:
    case ReactTypes.Portal:
    case ReactTypes.StrictMode:
      return type;
    default:
      return undefined;
  }
}

// Utility functions to check specific React types.

function isContextConsumer(object) {
  return typeOf(object) === ReactTypes.ContextConsumer;
}

function isContextProvider(object) {
  return typeOf(object) === ReactTypes.ContextProvider;
}

function isElement(object) {
  return typeOf(object) === ReactTypes.Element;
}

function isFragment(object) {
  return typeOf(object) === ReactTypes.Fragment;
}

function isPortal(object) {
  return typeOf(object) === ReactTypes.Portal;
}

function isStrictMode(object) {
  return typeOf(object) === ReactTypes.StrictMode;
}

// Export functions and default ReactTypes.
export {
  isValidElementType,
  typeOf,
  isContextConsumer,
  isContextProvider,
  isElement,
  isFragment,
  isPortal,
  isStrictMode,
  ReactTypes as default
};
