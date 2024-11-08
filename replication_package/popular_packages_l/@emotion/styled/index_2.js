// Function to create a styled component
function styled(tag) {
  return function(styles, ...dynamicStyles) {
    // Function to generate styles from static object or from template string with dynamic values
    let styleFn;
    // Handle object-based styles
    if (typeof styles === 'object') {
      styleFn = () => styles;
    } // Handle string and dynamic styles
    else if (typeof styles === 'string') {
      styleFn = (props) => {
        let styleStr = styles[0]; // Start with the first static part of the template string
        dynamicStyles.forEach((dynamicStyle, i) => {
          // Append dynamic value (processed with props if it's a function) and next static part
          styleStr += typeof dynamicStyle === 'function' ? dynamicStyle(props) : dynamicStyle;
          styleStr += styles[i + 1];
        });
        return `{"style": "${styleStr.trim()}"}`; // Return a JSON-like style property
      };
    }

    // Return styled component as a function
    return function StyledComponent(props) {
      const finalStyles = styleFn(props); // Generate final styles
      return `<${tag} style="${finalStyles.style}" >${props.children || ''}</${tag}>`; // Output as a string representation
    };
  };
}

// Example: Create a styled component with static object styles
let SomeComp = styled('div')({
  color: 'hotpink',
});

// Example: Create a styled component with dynamic template string styles
let AnotherComp = styled('div')`
  color: ${props => props.color}; // Dynamic color depending on props
`;

// Function to simulate rendering of components
function render(...components) {
  components.forEach(comp => console.log(comp())); // Log component representation
}

// Usage: Render components as strings
render(
  SomeComp(), // Renders component with static styles
  AnotherComp({ color: 'green', children: '' }) // Renders component with dynamic color
);
