// index.js

const babel = require('@babel/core');
const transformESModulesToCommonJS = require('./transformESModulesToCommonJS');

// Sample ES6 module code to be converted
const es6ModuleCode = `
import { example } from './exampleModule';
export const myFunction = () => {
  return example();
};
`;

// Convert the ES6 module code to CommonJS using Babel with custom plugin
const convertedCode = babel.transformSync(es6ModuleCode, {
  plugins: [transformESModulesToCommonJS]
});

console.log(convertedCode.code);

// transformESModulesToCommonJS.js

module.exports = function transformESModulesToCommonJS() {
  return {
    visitor: {
      ImportDeclaration(path) {
        // Extract import source and local names of imported variables
        const importSource = path.node.source.value;
        const importedIdentifiers = path.node.specifiers.map(specifier => specifier.local.name);

        // Create a require statement to replace import
        const requireStatement = `const { ${importedIdentifiers.join(', ')} } = require('${importSource}');`;
        path.replaceWithSourceString(requireStatement);
      },
      ExportNamedDeclaration(path) {
        // Extract exported variable names and create CommonJS export statements
        const exportsStatements = path.node.declaration.declarations.map(declaration => {
          const { name } = declaration.id;
          return `exports.${name} = ${name};`;
        });

        // Replace export statement with exports
        path.replaceWithSourceString(exportsStatements.join('\n'));
      }
    }
  };
};
