// index.js

const babel = require('@babel/core');
const commonJsPlugin = require('./transformESModulesToCommonJS');

// Sample code to be transformed
const es6Code = `
import { example } from './exampleModule';
export const myFunction = () => {
  return example();
};
`;

// Transform the ES6 module code to CommonJS
const transformedCode = babel.transformSync(es6Code, {
  plugins: [commonJsPlugin]
});

console.log(transformedCode.code);

// transformESModulesToCommonJS.js

module.exports = function transformESModulesToCommonJS() {
  return {
    visitor: {
      ImportDeclaration(path) {
        const source = path.node.source.value;
        const specifiers = path.node.specifiers.map(specifier => specifier.local.name);

        let requireStatement = `const { ${specifiers.join(', ')} } = require('${source}');`;
        path.replaceWithSourceString(requireStatement);
      },
      ExportNamedDeclaration(path) {
        const declarations = path.node.declaration.declarations.map(declaration => {
          const { name } = declaration.id;
          return `exports.${name} = ${name};`;
        });

        path.replaceWithSourceString(declarations.join('\n'));
      }
    }
  };
};
