// Mock Style Component Creator Function
function styled(elementTag) {
  // This function returns another function for handling styles
  return function(styles, ...dynamicValues) {
    let generateStyles;

    // Handling static object style definition
    if (typeof styles === 'object') {
      generateStyles = () => styles;
    } 
    // Handling template literal style strings with possible dynamic values
    else if (typeof styles === 'string') {
      generateStyles = (props) => {
        let completeStyleStr = styles[0];
        dynamicValues.forEach((dynamicValue, index) => {
          completeStyleStr += typeof dynamicValue === 'function' ? dynamicValue(props) : dynamicValue;
          completeStyleStr += styles[index + 1];
        });
        return `{"style": "${completeStyleStr.trim()}"}`;
      };
    }

    // This function returns a styled HTML component as a string
    return function StyledComponent(props) {
      const finalStyles = generateStyles(props);
      return `<${elementTag} style="${finalStyles.style}" >${props.children || ''}</${elementTag}>`;
    };
  };
}

// Examples showing usage of the mock implementation
let SomeComp = styled('div')({
  color: 'hotpink',
});

let AnotherComp = styled('div')`
  color: ${props => props.color};
`;

// Mock function to mimic rendering of components
function render(...components) {
  components.forEach(component => console.log(component()));
}

// Using the mock styled components
render(
  SomeComp(),
  AnotherComp({ color: 'green', children: '' })
);
