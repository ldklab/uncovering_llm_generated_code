// hoist-non-react-statics.js

function hoistNonReactStatics(targetComponent, sourceComponent, exclusions = {}) {
  // List of React-specific static properties that should not be copied over
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

  // Combine REACT_STATICS and user-provided exclusions
  const KNOWN_STATICS = Object.assign({}, REACT_STATICS, exclusions);

  // Get all property names from the sourceComponent
  const sourceKeys = Object.getOwnPropertyNames(sourceComponent);

  // Iterate and copy properties
  sourceKeys.forEach((key) => {
    if (!KNOWN_STATICS[key]) {
      try {
        // Attempt to copy the property descriptor from the source to the target
        const descriptor = Object.getOwnPropertyDescriptor(sourceComponent, key);
        Object.defineProperty(targetComponent, key, descriptor);
      } catch (e) {
        // if there's an issue with property definition, you can handle or log it here as needed
      }
    }
  });

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
