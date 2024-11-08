// index.js

const babel = require('@babel/core');
const transformESModulesToCommonJS = require('./transformESModulesToCommonJS');

// Sample ES6 module code to be transformed into CommonJS
const es6CodeExample = `
import { example } from './exampleModule';
export const myFunction = () => {
  return example();
};
`;

// Perform the transformation using Babel with the custom plugin
const outputCode = babel.transformSync(es6CodeExample, {
  plugins: [transformESModulesToCommonJS]
});

console.log(outputCode.code);

// transformESModulesToCommonJS.js

module.exports = function transformESModulesToCommonJS() {
  return {
    visitor: {
      // Transform ES6 ImportDeclaration to CommonJS require
      ImportDeclaration(path) {
        const moduleSource = path.node.source.value;
        const importedSpecifiers = path.node.specifiers.map(specifier => specifier.local.name);
        
        // Construct the CommonJS require statement
        const commonJSImport = `const { ${importedSpecifiers.join(', ')} } = require('${moduleSource}');`;
        path.replaceWithSourceString(commonJSImport);
      },

      // Transform ES6 ExportNamedDeclaration to CommonJS exports
      ExportNamedDeclaration(path) {
        const exportStatements = path.node.declaration.declarations.map(declaration => {
          const exportedName = declaration.id.name;
          return `exports.${exportedName} = ${exportedName};`;
        });

        // Replace the ES6 export with the constructed CommonJS export
        path.replaceWithSourceString(exportStatements.join('\n'));
      }
    }
  };
};
