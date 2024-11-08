// index.js
const babel = require('@babel/core');

// Babel plugin to transform JSX into `React.createElement` calls
function jsxTransformPlugin() {
  return {
    visitor: {
      JSXElement(path) {
        const reactCreateElement = transformJSXToCreateElement(path.node);
        path.replaceWith(reactCreateElement);
      },
    },
  };
}

// Function to convert a JSX node into a `React.createElement` structure
function transformJSXToCreateElement(jsxNode) {
  const elementType = jsxNode.openingElement.name.name;
  const attributes = jsxNode.openingElement.attributes.reduce((acc, attr) => {
    const key = attr.name.name;
    const value = (attr.value.type === 'JSXExpressionContainer') ? attr.value.expression : attr.value;
    acc[key] = value;
    return acc;
  }, {});
  
  const children = jsxNode.children.map(child => {
    if (child.type === 'JSXText') return child.value.trim();
    return transformJSXToCreateElement(child);
  }).filter(Boolean);

  return {
    type: 'CallExpression',
    callee: {
      type: 'MemberExpression',
      object: { type: 'Identifier', name: 'React' },
      property: { type: 'Identifier', name: 'createElement' },
    },
    arguments: [
      { type: 'StringLiteral', value: elementType },
      { type: 'ObjectExpression', properties: 
        Object.entries(attributes).map(([key, value]) => ({
          type: 'ObjectProperty',
          key: { type: 'Identifier', name: key },
          value: value.type ? value : { type: 'StringLiteral', value },
      }))},
      ...children,
    ],
  };
}

// Example code to demonstrate transformation
const inputCode = `
  const element = (
    <div className="container">
      Hello, <strong>world!</strong>
    </div>
  );
`;

// Perform the transformation using Babel
const transformedCode = babel.transformSync(inputCode, {
  plugins: [jsxTransformPlugin],
});

// Output the transformed code
console.log(transformedCode.code);
