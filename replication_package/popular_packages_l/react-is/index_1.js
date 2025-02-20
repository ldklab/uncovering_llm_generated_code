// react-is.js

// Define an object to store symbols for various React types.
const ReactTypes = {
  ContextConsumer: Symbol.for('react.context'),
  ContextProvider: Symbol.for('react.provider'),
  Element: Symbol.for('react.element'),
  Fragment: Symbol.for('react.fragment'),
  Portal: Symbol.for('react.portal'),
  StrictMode: Symbol.for('react.strict_mode')
};

// Function to check if a given type is a valid React element type.
function isValidElementType(type) {
  return (
    typeof type === 'string' || // Check if type is a string (HTML tag names).
    typeof type === 'function' || // Check if type is a function (React component).
    type === ReactTypes.Fragment || // Check if type is a Fragment.
    type === ReactTypes.StrictMode || // Check if type is StrictMode.
    (!!type && // If type is an object, check its internal React type.
     (type.$$typeof === ReactTypes.ContextProvider || 
      type.$$typeof === ReactTypes.ContextConsumer))
  );
}

// Function to determine the type of a React object based on its internal symbol.
function typeOf(object) {
  if (object === null || typeof object !== 'object') {
    return undefined; // Return undefined for null or non-object values.
  }
  const type = object.$$typeof; // Get the internal React type symbol.
  switch(type) {
    case ReactTypes.ContextConsumer:
    case ReactTypes.ContextProvider:
    case ReactTypes.Element:
    case ReactTypes.Fragment:
    case ReactTypes.Portal:
    case ReactTypes.StrictMode:
      return type; // Return the matched type symbol.
    default:
      return undefined; // For unmatched types, return undefined.
  }
}

// Functions to check specific kinds of React objects.
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

// Export functions and ReactTypes object for external usage.
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
