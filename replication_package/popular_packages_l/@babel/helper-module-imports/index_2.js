// Implementation of a Babel plugin helper for handling module imports

// Import necessary functions from the Babel `core` module
const { types: t } = require('@babel/core');

// Class to assist with handling module imports in Babel transforms
class ModuleImportsHelper {
  constructor() {
    // Maintain a collection of imported modules to check for duplicates
    this.importedModules = new Map();
  }

  // Method to add an import statement to the AST, if not already present
  addImport(path, source, importedName, localName) {
    // Check if the module is already imported
    if (!this.importedModules.has(source)) {
      // Create new import declaration using Babel type helpers
      const importDeclaration = t.importDeclaration(
        // Create import specifier node with imported and local names
        [t.importSpecifier(t.identifier(localName), t.identifier(importedName))],
        t.stringLiteral(source) // Create string literal node for the module source
      );

      // Insert the new import declaration at the start of the program body
      path.unshiftContainer('body', importDeclaration);
      // Record the module as having been imported with its local name
      this.importedModules.set(source, localName);
    }

    // Return an identifier for the local name used for the imported module
    return t.identifier(this.importedModules.get(source));
  }

  // Method to verify if a module has already been imported
  isModuleImported(source) {
    return this.importedModules.has(source);
  }
}

// Export a function to be used as a Babel plugin
module.exports = function () {
  return {
    visitor: {
      Program(path) {
        // Create an instance of the ModuleImportsHelper to track imports
        const moduleHelper = new ModuleImportsHelper();

        // Example logic: Import 'lodash' with local name '_' if not already imported
        if (!moduleHelper.isModuleImported('lodash')) {
          moduleHelper.addImport(path, 'lodash', 'default', '_');
        }

        // Additional code can be added here to further process the AST...
      }
    }
  };
};
