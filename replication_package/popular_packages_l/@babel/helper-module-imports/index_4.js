// Import necessary modules from @babel/core
const { types: t } = require('@babel/core');

// ModuleImportsHelper class to manage module imports
class ModuleImportsHelper {
  constructor() {
    // Map to track imported modules and their local names
    this.importedModules = new Map();
  }

  // Method to add an import statement to the AST
  addImport(path, source, importedName, localName) {
    // Check if the module source is already imported
    if (!this.importedModules.has(source)) {
      // Create an import declaration
      const importDeclaration = t.importDeclaration(
        [t.importSpecifier(t.identifier(localName), t.identifier(importedName))],
        t.stringLiteral(source)
      );

      // Add the import declaration to the top of the program's body
      path.unshiftContainer('body', importDeclaration);

      // Record the imported module in the map
      this.importedModules.set(source, localName);
    }

    // Return the identifier for the imported module
    return t.identifier(this.importedModules.get(source));
  }

  // Method to check if a specific module has been imported
  isModuleImported(source) {
    return this.importedModules.has(source);
  }
}

// Export a function that defines a Babel plugin
module.exports = function () {
  return {
    // Visitor pattern for traversing and transforming AST nodes
    visitor: {
      // Handle the Program node, representing the entire file
      Program(path) {
        // Instantiate a ModuleImportsHelper to manage imports
        const moduleHelper = new ModuleImportsHelper();

        // Example: Conditionally add import for 'lodash' if not present
        if (!moduleHelper.isModuleImported('lodash')) {
          moduleHelper.addImport(path, 'lodash', 'default', '_');
        }

        // Additional AST processing can be done here...
      }
    }
  };
};
