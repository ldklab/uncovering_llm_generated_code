// index.js

const babel = require('@babel/core');
const transformESModulesToCommonJS = require('./transformESModulesToCommonJS');

// Sample ES6 module code to be transformed
const es6Code = `
import { example } from './exampleModule';
export const myFunction = () => {
  return example();
};
`;

// Use Babel to transform the ES6 module code to CommonJS format
const transformedCode = babel.transformSync(es6Code, {
  plugins: [transformESModulesToCommonJS]
});

console.log(transformedCode.code);

// transformESModulesToCommonJS.js

module.exports = function transformESModulesToCommonJS() {
  return {
    visitor: {
      ImportDeclaration(path) {
        const source = path.node.source.value;
        const specifiers = path.node.specifiers.map(specifier => specifier.local.name);
        // Construct a CommonJS require statement
        let requireStatement = `const { ${specifiers.join(', ')} } = require('${source}');`;
        // Replace the import statement with the require statement
        path.replaceWithSourceString(requireStatement);
      },
      ExportNamedDeclaration(path) {
        const declarations = path.node.declaration.declarations.map(declaration => {
          const { name } = declaration.id;
          // Export the named declarations as CommonJS exports
          return `exports.${name} = ${name};`;
        });
        // Replace the export statement with the exports assignment
        path.replaceWithSourceString(declarations.join('\n'));
      }
    }
  };
};
