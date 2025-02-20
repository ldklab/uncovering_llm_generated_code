// react-is.js

// This code defines and exports utility functions and constants to identify React elements
// and their corresponding types. It uses symbols to represent different React types and provides
// functions to determine if an object is a valid React component or matches a specific React type.

const ReactTypes = {
  // Symbols are unique and used to represent various React component types
  ContextConsumer: Symbol.for('react.context'),
  ContextProvider: Symbol.for('react.provider'),
  Element: Symbol.for('react.element'),
  Fragment: Symbol.for('react.fragment'),
  Portal: Symbol.for('react.portal'),
  StrictMode: Symbol.for('react.strict_mode')
};

// Function to check if a type represents a valid React element type
function isValidElementType(type) {
  return typeof type === 'string' || // If type is a string (custom HTML elements)
         typeof type === 'function' || // If type is a function (React components)
         type === ReactTypes.Fragment || // React Fragment
         type === ReactTypes.StrictMode || // React StrictMode
         (!!type &&
          (type.$$typeof === ReactTypes.ContextProvider || // React ContextProvider
           type.$$typeof === ReactTypes.ContextConsumer)); // React ContextConsumer
}

// Function to determine the type of a React object based on its $$typeof property
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
      return type; // Return the matched React type
    default:
      return undefined;
  }
}

// Functions to check whether an object is a specific type of React element or component
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

// Export the utility functions and ReactTypes object
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
