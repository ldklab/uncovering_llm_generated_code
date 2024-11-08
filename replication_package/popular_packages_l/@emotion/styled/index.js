// Mock Emotion Styled Implementation

// Function to create a styled component
function styled(tag) {
  return function(styles, ...dynamicStyles) {
    let styleFn;
    if (typeof styles === 'object') {
      styleFn = () => styles;
    } else if (typeof styles === 'string') {
      styleFn = (props) => {
        let styleStr = styles[0];
        dynamicStyles.forEach((dynamicStyle, i) => {
          styleStr += typeof dynamicStyle === 'function' ? dynamicStyle(props) : dynamicStyle;
          styleStr += styles[i + 1];
        });
        return `{"style": "${styleStr.trim()}"}`;
      };
    }

    return function StyledComponent(props) {
      const finalStyles = styleFn(props);
      return `<${tag} style="${finalStyles.style}" >${props.children || ''}</${tag}>`;
    };
  };
}

// Examples of using the mock implementation
let SomeComp = styled('div')({
  color: 'hotpink',
});

let AnotherComp = styled('div')`
  color: ${props => props.color};
`;

// Mock render function that displays components as strings
function render(...components) {
  components.forEach(comp => console.log(comp()));
}

// Usage
render(
  SomeComp(),
  AnotherComp({ color: 'green', children: '' })
);
