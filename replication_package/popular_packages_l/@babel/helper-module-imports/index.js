// @babel/helper-module-imports Source Code Example

// Import necessary modules
const { types: t } = require('@babel/core');

class ModuleImportsHelper {
  constructor() {
    this.importedModules = new Map();
  }

  // Method to add an import statement
  addImport(path, source, importedName, localName) {
    if (!this.importedModules.has(source)) {
      const importDeclaration = t.importDeclaration(
        [t.importSpecifier(t.identifier(localName), t.identifier(importedName))],
        t.stringLiteral(source)
      );

      path.unshiftContainer('body', importDeclaration);
      this.importedModules.set(source, localName);
    }

    return t.identifier(this.importedModules.get(source));
  }

  // Method to check if a module has been imported
  isModuleImported(source) {
    return this.importedModules.has(source);
  }
}

module.exports = function () {
  return {
    visitor: {
      Program(path) {
        const moduleHelper = new ModuleImportsHelper();

        // Example usage: Insert a specific module import if it is not already included
        if (!moduleHelper.isModuleImported('lodash')) {
          moduleHelper.addImport(path, 'lodash', 'default', '_');
        }

        // More code to process the AST...
      }
    }
  };
};
