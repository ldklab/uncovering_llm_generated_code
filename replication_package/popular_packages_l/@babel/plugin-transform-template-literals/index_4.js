json
// package.json
{
  "name": "@babel/plugin-transform-template-literals",
  "version": "1.0.0",
  "description": "A Babel plugin to transform ES2015 template literals to ES5.",
  "main": "index.js",
  "scripts": {
    "build": "babel src --out-dir lib",
    "test": "echo \"No tests specified\" && exit 0"
  },
  "devDependencies": {
    "@babel/core": "^7.0.0"
  },
  "dependencies": {},
  "author": "",
  "license": "MIT"
}

// index.js
const templateLiteralToConcat = ({ types: t }) => ({
  visitor: {
    TemplateLiteral(path) {
      const { expressions, quasis } = path.node;
      let transformedNodes = quasis.map((quasi, i) => {
        const nodes = [];
        if (quasi.value.cooked) {
          nodes.push(t.stringLiteral(quasi.value.cooked));
        }
        if (i < expressions.length) {
          nodes.push(t.callExpression(t.identifier("String"), [expressions[i]]));
        }
        return nodes;
      }).flat();
      
      if (transformedNodes.length === 1) {
        path.replaceWith(transformedNodes[0]);
      } else {
        const concatExpression = transformedNodes.reduce((acc, current) => t.binaryExpression("+", acc, current));
        path.replaceWith(concatExpression);
      }
    }
  }
});

module.exports = templateLiteralToConcat;
