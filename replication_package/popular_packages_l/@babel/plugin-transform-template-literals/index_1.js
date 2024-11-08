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
module.exports = function ({ types: t }) {
  return {
    visitor: {
      TemplateLiteral(path) {
        const { expressions, quasis } = path.node;
        let nodes = [];

        for (let i = 0; i < quasis.length; i++) {
          const element = quasis[i];

          if (element.value.cooked) {
            nodes.push(t.stringLiteral(element.value.cooked));
          }

          if (i < expressions.length) {
            const expression = expressions[i];
            nodes.push(t.callExpression(t.identifier("String"), [expression]));
          }
        }

        if (nodes.length === 1) {
          path.replaceWith(nodes[0]);
        } else {
          let concatenated = nodes[0];

          for (let i = 1; i < nodes.length; i++) {
            concatenated = t.binaryExpression("+", concatenated, nodes[i]);
          }

          path.replaceWith(concatenated);
        }
      }
    }
  };
}
