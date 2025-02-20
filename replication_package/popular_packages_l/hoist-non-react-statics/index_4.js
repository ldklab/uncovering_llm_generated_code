// hoist-non-react-statics.js

function hoistNonReactStatics(targetComponent, sourceComponent, exclusions = {}) {
  // List of React-specific static properties that should not be copied to avoid conflicts
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
    type: true,
  };

  // Combine React static properties with custom exclusions provided by the user
  const KNOWN_STATICS = Object.assign({}, REACT_STATICS, exclusions);

  // Retrieve all property names from the source component
  const sourceKeys = Object.getOwnPropertyNames(sourceComponent);

  // Copy each property unless it's in the known statics that shouldn't be copied
  sourceKeys.forEach(key => {
    if (!KNOWN_STATICS[key]) {
      try {
        // Get the property descriptor from the source component
        const descriptor = Object.getOwnPropertyDescriptor(sourceComponent, key);
        // Define the same property on the target component
        Object.defineProperty(targetComponent, key, descriptor);
      } catch (e) {
        // Handle error if unable to copy property descriptor
      }
    }
  });

  // Return the augmented target component
  return targetComponent;
}

// Export the function as a module
module.exports = hoistNonReactStatics;

// Example usage
/*
const React = require('react');
const hoistNonReactStatics = require('./hoist-non-react-statics');

class MyComponent extends React.Component {}
class MyOtherComponent extends React.Component {
  static myStatic = "a static property";
}

// Hoist non-React static properties from MyOtherComponent to MyComponent
hoistNonReactStatics(MyComponent, MyOtherComponent);

console.log(MyComponent.myStatic); // Outputs: "a static property"
*/
