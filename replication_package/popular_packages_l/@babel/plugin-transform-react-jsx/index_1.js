// index.js
const babel = require('@babel/core');

// A Babel plugin that transforms JSX syntax into React.createElement calls
function jsxTransformPlugin() {
  return {
    visitor: {
      JSXElement(path) {
        // Convert the JSX element to a React.createElement function call
        const reactCreateElement = transformJSXToReactCreateElement(path.node);
        path.replaceWith(reactCreateElement);
      },
    }
  };
}

// Utility function to simulate `React.createElement`
function transformJSXToReactCreateElement(jsxNode) {
  const type = jsxNode.openingElement.name.name;
  const props = jsxNode.openingElement.attributes.reduce((accumulatedProps, attribute) => {
    accumulatedProps[attribute.name.name] = attribute.value.type === 'JSXExpressionContainer'
      ? attribute.value.expression
      : attribute.value;
    return accumulatedProps;
  }, {});
  
  const children = jsxNode.children.map(child => {
    if (child.type === 'JSXText') {
      return child.value;
    }
    return transformJSXToReactCreateElement(child);
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
      {
        type: 'ObjectExpression',
        properties: Object.entries(props).map(([key, value]) => ({
          type: 'ObjectProperty',
          key: { type: 'Identifier', name: key },
          value: value.type ? value : { type: 'StringLiteral', value },
        })),
      },
      ...children,
    ],
  };
}

// Example usage of the Babel transformation
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
