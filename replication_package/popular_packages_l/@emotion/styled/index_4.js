// Mock Emotion Styled Implementation

// Function to create a styled component
function styled(tag) {
  return function(stylesOrStatic, ...dynamicStyles) {
    let styleFunction;
    
    if (typeof stylesOrStatic === 'object') {
      styleFunction = () => stylesOrStatic;
    } else if (typeof stylesOrStatic === 'string') {
      styleFunction = (props) => {
        let finalStyleString = stylesOrStatic[0];
        
        dynamicStyles.forEach((dynamicStyle, index) => {
          finalStyleString += typeof dynamicStyle === 'function' 
            ? dynamicStyle(props)
            : dynamicStyle;
          finalStyleString += stylesOrStatic[index + 1];
        });

        return { style: finalStyleString.trim() };
      };
    }

    return function StyledComponent(props) {
      const calculatedStyles = styleFunction(props);
      return `<${tag} style="${calculatedStyles.style}" >${props.children || ''}</${tag}>`;
    };
  };
}

// Examples of using the mock implementation
const SomeComp = styled('div')({
  color: 'hotpink',
});

const AnotherComp = styled('div')`
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
