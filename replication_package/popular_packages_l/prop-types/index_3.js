// props-validator.js
import PropTypes from 'prop-types';
import React from 'react';

// Define prop types for 'MyComponent'
const MyComponentPropTypes = {
  optionalString: PropTypes.string,
  optionalNumber: PropTypes.number.isRequired, // Required number type

  optionalInstance: PropTypes.instanceOf(Date), // Instance of Date class

  optionalEnum: PropTypes.oneOf(['News', 'Photos']), // Enum type

  optionalUnion: PropTypes.oneOfType([ // Union of string or number
    PropTypes.string,
    PropTypes.number
  ]),

  optionalArrayOfNumbers: PropTypes.arrayOf(PropTypes.number), // Array of numbers

  optionalObjectWithShape: PropTypes.shape({ // Object with specified shape
    optionalProperty: PropTypes.string,
    requiredProperty: PropTypes.number.isRequired
  }),

  // Custom validation for a prop
  customProp: (props, propName, componentName) => {
    if (!/matchme/.test(props[propName])) {
      return new Error(`Invalid prop \`${propName}\` supplied to \`${componentName}\`. Validation failed.`);
    }
  }
};

// Utility function for manual prop validation
function checkProps(props) {
  PropTypes.checkPropTypes(MyComponentPropTypes, props, 'prop', 'MyComponent');
}

// React component definition
class MyComponent extends React.Component {
  render() {
    return <div>{this.props.optionalString}</div>;
  }
}

MyComponent.propTypes = MyComponentPropTypes;

export { MyComponentPropTypes, checkProps };
export default MyComponent;
