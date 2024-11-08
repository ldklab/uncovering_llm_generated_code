// react-is.js

// Define a set of symbols that represent different types of React components and elements.
const ReactTypes = {
  ContextConsumer: Symbol.for('react.context'),
  ContextProvider: Symbol.for('react.provider'),
  Element: Symbol.for('react.element'),
  Fragment: Symbol.for('react.fragment'),
  Portal: Symbol.for('react.portal'),
  StrictMode: Symbol.for('react.strict_mode')
};

// Function to check if the given type is a valid React element type.
function isValidElementType(type) {
  // A valid type is either a string, a function, or a set of specific React type symbols.
  return typeof type === 'string' ||
    typeof type === 'function' ||
    type === ReactTypes.Fragment ||
    type === ReactTypes.StrictMode ||
    (!!type &&
      (type.$$typeof === ReactTypes.ContextProvider ||
        type.$$typeof === ReactTypes.ContextConsumer));
}

// Function to determine the type of a React element or component.
function typeOf(object) {
  // Return undefined if the object is null or not of object type.
  if (object === null || typeof object !== 'object') {
    return undefined;
  }
  // Check the object's $$typeof property against known React types.
  const type = object.$$typeof;
  switch (type) {
    case ReactTypes.ContextConsumer:
    case ReactTypes.ContextProvider:
    case ReactTypes.Element:
    case ReactTypes.Fragment:
    case ReactTypes.Portal:
    case ReactTypes.StrictMode:
      return type; // Return the matched type.
    default:
      return undefined; // Return undefined for unrecognized types.
  }
}

// Helper function to check if the object is a ContextConsumer.
function isContextConsumer(object) {
  return typeOf(object) === ReactTypes.ContextConsumer;
}

// Helper function to check if the object is a ContextProvider.
function isContextProvider(object) {
  return typeOf(object) === ReactTypes.ContextProvider;
}

// Helper function to check if the object is a standard React Element.
function isElement(object) {
  return typeOf(object) === ReactTypes.Element;
}

// Helper function to check if the object is a Fragment.
function isFragment(object) {
  return typeOf(object) === ReactTypes.Fragment;
}

// Helper function to check if the object is a Portal.
function isPortal(object) {
  return typeOf(object) === ReactTypes.Portal;
}

// Helper function to check if the object is using StrictMode.
function isStrictMode(object) {
  return typeOf(object) === ReactTypes.StrictMode;
}

// Export functions and ReactTypes as default for use in other modules.
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
