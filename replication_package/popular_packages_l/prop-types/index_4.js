// props-validator.js
import PropTypes from 'prop-types';
import React from 'react';

// Define prop types for the component
const MyComponentPropTypes = {
  optionalString: PropTypes.string,
  optionalNumber: PropTypes.number.isRequired,
  optionalInstance: PropTypes.instanceOf(Date),
  optionalEnum: PropTypes.oneOf(['News', 'Photos']),
  optionalUnion: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  optionalArrayOfNumbers: PropTypes.arrayOf(PropTypes.number),
  optionalObjectWithShape: PropTypes.shape({
    optionalProperty: PropTypes.string,
    requiredProperty: PropTypes.number.isRequired
  }),
  customProp: (props, propName, componentName) => {
    if (!/matchme/.test(props[propName])) {
      return new Error(`Invalid prop \`${propName}\` supplied to \`${componentName}\`. Validation failed.`);
    }
  }
};

// Utility function to validate props
function checkProps(props) {
  PropTypes.checkPropTypes(MyComponentPropTypes, props, 'prop', 'MyComponent');
}

export { MyComponentPropTypes, checkProps };

// Implementing the React component
class MyComponent extends React.Component {
  render() {
    return <div>{this.props.optionalString}</div>;
  }
}

MyComponent.propTypes = MyComponentPropTypes;

export default MyComponent;