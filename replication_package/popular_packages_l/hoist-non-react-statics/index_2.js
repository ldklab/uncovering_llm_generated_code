// hoist-non-react-statics.js

function hoistNonReactStatics(targetComponent, sourceComponent, exclusions = {}) {
  // React-specific static properties that we want to avoid copying
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

  // Merge React statics with user-defined exclusions
  const KNOWN_STATICS = { ...REACT_STATICS, ...exclusions };

  // Retrieve property names from sourceComponent
  const sourceKeys = Object.getOwnPropertyNames(sourceComponent);

  // Copy properties from sourceComponent to targetComponent
  sourceKeys.forEach((key) => {
    if (!KNOWN_STATICS[key]) { // Avoid copying excluded properties
      try {
        const descriptor = Object.getOwnPropertyDescriptor(sourceComponent, key);
        Object.defineProperty(targetComponent, key, descriptor);
      } catch (e) {
        // Handle errors in property copying if necessary
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
