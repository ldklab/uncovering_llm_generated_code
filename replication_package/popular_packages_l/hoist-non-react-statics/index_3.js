// hoist-non-react-statics.js

/**
 * Copies non-React-specific static properties from a source component to a target component.
 *
 * @param {Object} targetComponent - The component to which properties should be copied.
 * @param {Object} sourceComponent - The component from which properties should be copied.
 * @param {Object} exclusions - An object containing property names that should be excluded from copying.
 * @return {Object} The target component with copied properties.
 */
function hoistNonReactStatics(targetComponent, sourceComponent, exclusions = {}) {
  // Standard React-specific static properties that are excluded by default
  const REACT_STATICS = {
    childContextTypes: true,
    contextType: true,
    contextTypes: true,
    defaultProps: true,
    displayName: true,
    getDefaultProps: true,
    getDerivedStateFromError: true,
    getDerivedStateFromProps: true,
    mixins: true,
    propTypes: true,
    type: true
  };

  // Create a combined list of statics to exclude by merging default React statics with user-provided exclusions
  const KNOWN_STATICS = { ...REACT_STATICS, ...exclusions };

  // Retrieve all properties from the source component
  const sourceKeys = Object.getOwnPropertyNames(sourceComponent);

  // Copy each property unless it is in the KNOWN_STATICS list
  sourceKeys.forEach((key) => {
    if (!KNOWN_STATICS[key]) {
      try {
        const descriptor = Object.getOwnPropertyDescriptor(sourceComponent, key);
        Object.defineProperty(targetComponent, key, descriptor);
      } catch (e) {
        // Optionally handle errors (e.g. logging) if copying fails
      }
    }
  });

  // Return the target component now enriched with additional static properties
  return targetComponent;
}

module.exports = hoistNonReactStatics;

// Example usage
/*
const React = require('react');
const hoistNonReactStatics = require('./hoist-non-react-statics');

class MyComponent extends React.Component {}
class MyOtherComponent extends React.Component {
  static myStatic = "a static property";
}

hoistNonReactStatics(MyComponent, MyOtherComponent);

console.log(MyComponent.myStatic); // Outputs: "a static property"
*/
