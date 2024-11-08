// index.js
const babel = require('@babel/core');

// This is a simple Babel plugin that mimics transforming JSX into React.createElement calls
function jsxTransformPlugin() {
  return {
    visitor: {
      JSXElement(path) {
        // Simplified transformation from JSX to React.createElement
        const reactCreateElement = createElementFromJSX(path.node);
        path.replaceWith(reactCreateElement);
      },
    },
  };
}

// Utility function to mock `React.createElement`
function createElementFromJSX(jsxNode) {
  const type = jsxNode.openingElement.name.name;
  const props = jsxNode.openingElement.attributes.reduce((acc, attr) => {
    acc[attr.name.name] = attr.value.type === 'JSXExpressionContainer' ? attr.value.expression : attr.value;
    return acc;
  }, {});
  const children = jsxNode.children.map(child => {
    if (child.type === 'JSXText') {
      return child.value;
    }
    return createElementFromJSX(child);
  });

  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'React' },
      property: { type: 'Identifier', name: 'createElement' },
    },
    arguments: [
      { type: 'StringLiteral', value: type },
      { type: 'ObjectExpression', properties: Object.entries(props).map(([key, value]) => ({
          type: 'ObjectProperty',
          key: { type: 'Identifier', name: key },
          value: value.type ? value : { type: 'StringLiteral', value },
        })),
      },
      ...children,
    ],
  };
}

// Example usage
const code = `
  const element = (
    <div className="container">
      Hello, <strong>world!</strong>
    </div>
  );
`;

const output = babel.transformSync(code, {
  plugins: [jsxTransformPlugin],
});

console.log(output.code);
