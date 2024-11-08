const { types: t } = require('@babel/core');

class ModuleManager {
  constructor() {
    this.modules = new Map();
  }

  importModule(containerPath, moduleSource, importName, aliasName) {
    if (!this.modules.has(moduleSource)) {
      const newImport = t.importDeclaration(
        [t.importSpecifier(t.identifier(aliasName), t.identifier(importName))],
        t.stringLiteral(moduleSource)
      );

      containerPath.unshiftContainer('body', newImport);
      this.modules.set(moduleSource, aliasName);
    }

    return t.identifier(this.modules.get(moduleSource));
  }

  hasImportedModule(moduleSource) {
    return this.modules.has(moduleSource);
  }
}

module.exports = function () {
  return {
    visitor: {
      Program(programPath) {
        const manager = new ModuleManager();

        if (!manager.hasImportedModule('lodash')) {
          manager.importModule(programPath, 'lodash', 'default', '_');
        }

        // Additional AST transformations can be performed here.
      }
    }
  };
};
