// hoist-non-react-statics.js

function hoistNonReactStatics(targetComponent, sourceComponent, exclusions = {}) {
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

  const KNOWN_STATICS = Object.assign({}, REACT_STATICS, exclusions);
  const sourceKeys = Object.getOwnPropertyNames(sourceComponent);

  sourceKeys.forEach((key) => {
    if (!KNOWN_STATICS[key]) {
      try {
        const descriptor = Object.getOwnPropertyDescriptor(sourceComponent, key);
        Object.defineProperty(targetComponent, key, descriptor);
      } catch (e) {
        // Handle errors during property definition
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
