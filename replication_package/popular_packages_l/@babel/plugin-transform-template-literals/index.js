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
        const expressions = path.node.expressions;
        const quasis = path.node.quasis;

        let nodes = [];

        // Iterate over the quasis and expressions, interleaving them
        for (let i = 0; i < quasis.length; i++) {
          const elem = quasis[i];

          if (elem.value.cooked) {
            nodes.push(t.stringLiteral(elem.value.cooked));
          }

          if (i < expressions.length) {
            const expr = expressions[i];
            // Convert expression to a String or to be concatenated
            nodes.push(t.callExpression(t.identifier("String"), [expr]));
          }
        }

        // If there's only one node, no concatenation is needed
        if (nodes.length === 1) {
          path.replaceWith(nodes[0]);
          return;
        }

        // Use the + operator to concatenate all the parts
        let root = nodes[0];
        for (let i = 1; i < nodes.length; i++) {
          root = t.binaryExpression("+", root, nodes[i]);
        }

        path.replaceWith(root);
      }
    }
  };
}
