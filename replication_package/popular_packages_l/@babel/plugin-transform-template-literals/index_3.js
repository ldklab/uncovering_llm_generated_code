markdown
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
module.exports = function ({ types: t }) {
  return {
    visitor: {
      TemplateLiteral(path) {
        const { expressions, quasis } = path.node;

        const nodes = quasis.map((elem, i) => {
          const nodeParts = [];
          if (elem.value.cooked) {
            nodeParts.push(t.stringLiteral(elem.value.cooked));
          }
          if (i < expressions.length) {
            nodeParts.push(t.callExpression(t.identifier("String"), [expressions[i]]));
          }
          return nodeParts;
        }).flat();

        if (nodes.length === 1) {
          path.replaceWith(nodes[0]);
        } else {
          const concatenated = nodes.reduce((prev, curr) => t.binaryExpression("+", prev, curr));
          path.replaceWith(concatenated);
        }
      }
    }
  };
}
