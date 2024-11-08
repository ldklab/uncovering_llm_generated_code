// props-validator.js
import PropTypes from 'prop-types';

// Define prop types for a hypothetical component
const MyComponentPropTypes = {
  // Primitive types
  optionalString: PropTypes.string,
  optionalNumber: PropTypes.number.isRequired, // Required prop

  // Instance of specific class
  optionalInstance: PropTypes.instanceOf(Date),

  // Enum of specific values
  optionalEnum: PropTypes.oneOf(['News', 'Photos']),

  // Union of multiple types
  optionalUnion: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),

  // Array of a certain type
  optionalArrayOfNumbers: PropTypes.arrayOf(PropTypes.number),

  // Object with specific shape
  optionalObjectWithShape: PropTypes.shape({
    optionalProperty: PropTypes.string,
    requiredProperty: PropTypes.number.isRequired
  }),

  // Custom validation
  customProp: (props, propName, componentName) => {
    if (!/matchme/.test(props[propName])) {
      return new Error(`Invalid prop \`${propName}\` supplied to \`${componentName}\`. Validation failed.`);
    }
  }
};

// Utility function to check prop types manually (for non-React usage)
function checkProps(props) {
  PropTypes.checkPropTypes(MyComponentPropTypes, props, 'prop', 'MyComponent');
}

export { MyComponentPropTypes, checkProps };

// Example usage in a React component
import React from 'react';

class MyComponent extends React.Component {
  render() {
    // Use props in component logic
    return <div>{this.props.optionalString}</div>;
  }
}

MyComponent.propTypes = MyComponentPropTypes;

export default MyComponent;
