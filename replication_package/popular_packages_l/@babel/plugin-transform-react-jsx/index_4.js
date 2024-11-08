// index.js
const babel = require('@babel/core');

// Define a straightforward Babel plugin to transform JSX into React.createElement calls
function jsxToReactCreateElement() {
  return {
    visitor: {
      JSXElement(path) {
        const reactElementCall = convertJSXToCreateElement(path.node);
        path.replaceWith(reactElementCall);
      },
    },
  };
}

// Helper function simulating `React.createElement` conversion
function convertJSXToCreateElement(jsxNode) {
  const elementType = jsxNode.openingElement.name.name;
  const elementProps = jsxNode.openingElement.attributes.reduce((props, attr) => {
    const value = attr.value.type === 'JSXExpressionContainer' ? attr.value.expression : attr.value;
    props[attr.name.name] = value;
    return props;
  }, {});
  const elementChildren = jsxNode.children.map(child => {
    return child.type === 'JSXText' ? child.value : convertJSXToCreateElement(child);
  });

  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'React' },
      property: { type: 'Identifier', name: 'createElement' },
    },
    arguments: [
      { type: 'StringLiteral', value: elementType },
      { type: 'ObjectExpression', properties: Object.entries(elementProps).map(([key, value]) => ({
        type: 'ObjectProperty',
        key: { type: 'Identifier', name: key },
        value: value.type ? value : { type: 'StringLiteral', value },
      }))},
      ...elementChildren,
    ],
  };
}

// Sample input code with JSX
const inputCode = `
  const element = (
    <div className="container">
      Hello, <strong>world!</strong>
    </div>
  );
`;

// Transform the JSX code using the custom plugin
const transformedOutput = babel.transformSync(inputCode, {
  plugins: [jsxToReactCreateElement],
});

// Output the transformed code
console.log(transformedOutput.code);
