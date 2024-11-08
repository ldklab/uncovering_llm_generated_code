// Mock implementation simulating a basic styled-components or similar library for styling components

// Function to create a styled version of an HTML tag
function styled(tag) {
  return function(styles, ...dynamicStyles) {
    let styleFn;
    if (typeof styles === 'object') {
      // If styles is an object, directly return it when invoked
      styleFn = () => styles;
    } else if (typeof styles === 'string') {
      // If styles is a template literal, handle dynamic styles
      styleFn = (props) => {
        let styleStr = styles[0];
        dynamicStyles.forEach((dynamicStyle, i) => {
          styleStr += typeof dynamicStyle === 'function' ? dynamicStyle(props) : dynamicStyle;
          styleStr += styles[i + 1];
        });
        // Return a stringified style for inline style usage
        return `{"style": "${styleStr.trim()}"}`;
      };
    }

    // Return a component with the computed styles
    return function StyledComponent(props) {
      const finalStyles = styleFn(props);
      // Wrap content within the specified HTML tag
      return `<${tag} style="${finalStyles.style}" >${props.children || ''}</${tag}>`;
    };
  };
}

// Examples of defining styled components
let SomeComp = styled('div')({
  color: 'hotpink',
});

let AnotherComp = styled('div')`
  color: ${props => props.color};
`;

// Function to simulate rendering components by logging their string representations
function render(...components) {
  components.forEach(comp => console.log(comp()));
}

// Usage example of rendering the components with props
render(
  SomeComp(),
  AnotherComp({ color: 'green', children: '' })
);
