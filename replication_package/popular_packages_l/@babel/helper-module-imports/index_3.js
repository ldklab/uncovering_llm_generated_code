// Import necessary module from Babel
const { types: t } = require('@babel/core');

class ModuleImportsHelper {
  constructor() {
    // Initialize a map to keep track of imported modules
    this.importedModules = new Map();
  }

  // Method to add an import statement to the provided path
  addImport(path, source, importedName, localName) {
    // Check if the module has already been imported
    if (!this.importedModules.has(source)) {
      // Create a new import declaration for the module
      const importDeclaration = t.importDeclaration(
        [t.importSpecifier(t.identifier(localName), t.identifier(importedName))],
        t.stringLiteral(source)
      );

      // Insert the import declaration at the beginning of the body
      path.unshiftContainer('body', importDeclaration);
      // Record the imported module and its local name in the map
      this.importedModules.set(source, localName);
    }

    // Return the local name identifier for the imported module
    return t.identifier(this.importedModules.get(source));
  }

  // Method to check if a module is already imported
  isModuleImported(source) {
    return this.importedModules.has(source);
  }
}

module.exports = function () {
  return {
    visitor: {
      Program(path) {
        // Create an instance of the ModuleImportsHelper class
        const moduleHelper = new ModuleImportsHelper();

        // Ensure 'lodash' is imported under the local name '_'
        if (!moduleHelper.isModuleImported('lodash')) {
          moduleHelper.addImport(path, 'lodash', 'default', '_');
        }

        // Further processing of the AST can be performed here...
      }
    }
  };
};
