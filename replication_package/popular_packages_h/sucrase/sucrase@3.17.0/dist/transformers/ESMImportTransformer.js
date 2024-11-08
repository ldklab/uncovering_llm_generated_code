"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _keywords = require('../parser/tokenizer/keywords');
var _types = require('../parser/tokenizer/types');

var _elideImportEquals = require('../util/elideImportEquals'); var _elideImportEquals2 = _interopRequireDefault(_elideImportEquals);



var _getDeclarationInfo = require('../util/getDeclarationInfo'); var _getDeclarationInfo2 = _interopRequireDefault(_getDeclarationInfo);
var _getNonTypeIdentifiers = require('../util/getNonTypeIdentifiers');
var _shouldElideDefaultExport = require('../util/shouldElideDefaultExport'); var _shouldElideDefaultExport2 = _interopRequireDefault(_shouldElideDefaultExport);

var _Transformer = require('./Transformer'); var _Transformer2 = _interopRequireDefault(_Transformer);

/**
 * Class for editing import statements when we are keeping the code as ESM. We still need to remove
 * type-only imports in TypeScript and Flow.
 */
 class ESMImportTransformer extends _Transformer2.default {
  
  

  constructor(
     tokens,
     nameManager,
     reactHotLoaderTransformer,
     isTypeScriptTransformEnabled,
    options,
  ) {
    super();this.tokens = tokens;this.nameManager = nameManager;this.reactHotLoaderTransformer = reactHotLoaderTransformer;this.isTypeScriptTransformEnabled = isTypeScriptTransformEnabled;;
    this.nonTypeIdentifiers = isTypeScriptTransformEnabled
      ? _getNonTypeIdentifiers.getNonTypeIdentifiers.call(void 0, tokens, options)
      : new Set();
    this.declarationInfo = isTypeScriptTransformEnabled
      ? _getDeclarationInfo2.default.call(void 0, tokens)
      : _getDeclarationInfo.EMPTY_DECLARATION_INFO;
  }

  process() {
    // TypeScript `import foo = require('foo');` should always just be translated to plain require.
    if (this.tokens.matches3(_types.TokenType._import, _types.TokenType.name, _types.TokenType.eq)) {
      return this.processImportEquals();
    }
    if (this.tokens.matches2(_types.TokenType._export, _types.TokenType.eq)) {
      this.tokens.replaceToken("module.exports");
      return true;
    }
    if (this.tokens.matches1(_types.TokenType._import)) {
      return this.processImport();
    }
    if (this.tokens.matches2(_types.TokenType._export, _types.TokenType._default)) {
      return this.processExportDefault();
    }
    if (this.tokens.matches2(_types.TokenType._export, _types.TokenType.braceL)) {
      return this.processNamedExports();
    }
    if (
      this.tokens.matches3(_types.TokenType._export, _types.TokenType.name, _types.TokenType.braceL) &&
      this.tokens.matchesContextualAtIndex(this.tokens.currentIndex() + 1, _keywords.ContextualKeyword._type)
    ) {
      // TS `export type {` case: just remove the export entirely.
      this.tokens.removeInitialToken();
      while (!this.tokens.matches1(_types.TokenType.braceR)) {
        this.tokens.removeToken();
      }
      this.tokens.removeToken();

      // Remove type re-export `... } from './T'`
      if (
        this.tokens.matchesContextual(_keywords.ContextualKeyword._from) &&
        this.tokens.matches1AtIndex(this.tokens.currentIndex() + 1, _types.TokenType.string)
      ) {
        this.tokens.removeToken();
        this.tokens.removeToken();
      }
      return true;
    }
    return false;
  }

   processImportEquals() {
    const importName = this.tokens.identifierNameAtIndex(this.tokens.currentIndex() + 1);
    if (this.isTypeName(importName)) {
      // If this name is only used as a type, elide the whole import.
      _elideImportEquals2.default.call(void 0, this.tokens);
    } else {
      // Otherwise, switch `import` to `const`.
      this.tokens.replaceToken("const");
    }
    return true;
  }

   processImport() {
    if (this.tokens.matches2(_types.TokenType._import, _types.TokenType.parenL)) {
      // Dynamic imports don't need to be transformed.
      return false;
    }

    const snapshot = this.tokens.snapshot();
    const allImportsRemoved = this.removeImportTypeBindings();
    if (allImportsRemoved) {
      this.tokens.restoreToSnapshot(snapshot);
      while (!this.tokens.matches1(_types.TokenType.string)) {
        this.tokens.removeToken();
      }
      this.tokens.removeToken();
      if (this.tokens.matches1(_types.TokenType.semi)) {
        this.tokens.removeToken();
      }
    }
    return true;
  }

  /**
   * Remove type bindings from this import, leaving the rest of the import intact.
   *
   * Return true if this import was ONLY types, and thus is eligible for removal. This will bail out
   * of the replacement operation, so we can return early here.
   */
   removeImportTypeBindings() {
    this.tokens.copyExpectedToken(_types.TokenType._import);
    if (
      this.tokens.matchesContextual(_keywords.ContextualKeyword._type) &&
      !this.tokens.matches1AtIndex(this.tokens.currentIndex() + 1, _types.TokenType.comma) &&
      !this.tokens.matchesContextualAtIndex(this.tokens.currentIndex() + 1, _keywords.ContextualKeyword._from)
    ) {
      // This is an "import type" statement, so exit early.
      return true;
    }

    if (this.tokens.matches1(_types.TokenType.string)) {
      // This is a bare import, so we should proceed with the import.
      this.tokens.copyToken();
      return false;
    }

    let foundNonTypeImport = false;

    if (this.tokens.matches1(_types.TokenType.name)) {
      if (this.isTypeName(this.tokens.identifierName())) {
        this.tokens.removeToken();
        if (this.tokens.matches1(_types.TokenType.comma)) {
          this.tokens.removeToken();
        }
      } else {
        foundNonTypeImport = true;
        this.tokens.copyToken();
        if (this.tokens.matches1(_types.TokenType.comma)) {
          this.tokens.copyToken();
        }
      }
    }

    if (this.tokens.matches1(_types.TokenType.star)) {
      if (this.isTypeName(this.tokens.identifierNameAtIndex(this.tokens.currentIndex() + 2))) {
        this.tokens.removeToken();
        this.tokens.removeToken();
        this.tokens.removeToken();
      } else {
        foundNonTypeImport = true;
        this.tokens.copyExpectedToken(_types.TokenType.star);
        this.tokens.copyExpectedToken(_types.TokenType.name);
        this.tokens.copyExpectedToken(_types.TokenType.name);
      }
    } else if (this.tokens.matches1(_types.TokenType.braceL)) {
      this.tokens.copyToken();
      while (!this.tokens.matches1(_types.TokenType.braceR)) {
        if (
          this.tokens.matches3(_types.TokenType.name, _types.TokenType.name, _types.TokenType.comma) ||
          this.tokens.matches3(_types.TokenType.name, _types.TokenType.name, _types.TokenType.braceR)
        ) {
          // type foo
          this.tokens.removeToken();
          this.tokens.removeToken();
          if (this.tokens.matches1(_types.TokenType.comma)) {
            this.tokens.removeToken();
          }
        } else if (
          this.tokens.matches5(_types.TokenType.name, _types.TokenType.name, _types.TokenType.name, _types.TokenType.name, _types.TokenType.comma) ||
          this.tokens.matches5(_types.TokenType.name, _types.TokenType.name, _types.TokenType.name, _types.TokenType.name, _types.TokenType.braceR)
        ) {
          // type foo as bar
          this.tokens.removeToken();
          this.tokens.removeToken();
          this.tokens.removeToken();
          this.tokens.removeToken();
          if (this.tokens.matches1(_types.TokenType.comma)) {
            this.tokens.removeToken();
          }
        } else if (
          this.tokens.matches2(_types.TokenType.name, _types.TokenType.comma) ||
          this.tokens.matches2(_types.TokenType.name, _types.TokenType.braceR)
        ) {
          // foo
          if (this.isTypeName(this.tokens.identifierName())) {
            this.tokens.removeToken();
            if (this.tokens.matches1(_types.TokenType.comma)) {
              this.tokens.removeToken();
            }
          } else {
            foundNonTypeImport = true;
            this.tokens.copyToken();
            if (this.tokens.matches1(_types.TokenType.comma)) {
              this.tokens.copyToken();
            }
          }
        } else if (
          this.tokens.matches4(_types.TokenType.name, _types.TokenType.name, _types.TokenType.name, _types.TokenType.comma) ||
          this.tokens.matches4(_types.TokenType.name, _types.TokenType.name, _types.TokenType.name, _types.TokenType.braceR)
        ) {
          // foo as bar
          if (this.isTypeName(this.tokens.identifierNameAtIndex(this.tokens.currentIndex() + 2))) {
            this.tokens.removeToken();
            this.tokens.removeToken();
            this.tokens.removeToken();
            if (this.tokens.matches1(_types.TokenType.comma)) {
              this.tokens.removeToken();
            }
          } else {
            foundNonTypeImport = true;
            this.tokens.copyToken();
            this.tokens.copyToken();
            this.tokens.copyToken();
            if (this.tokens.matches1(_types.TokenType.comma)) {
              this.tokens.copyToken();
            }
          }
        } else {
          throw new Error("Unexpected import form.");
        }
      }
      this.tokens.copyExpectedToken(_types.TokenType.braceR);
    }

    return !foundNonTypeImport;
  }

   isTypeName(name) {
    return this.isTypeScriptTransformEnabled && !this.nonTypeIdentifiers.has(name);
  }

   processExportDefault() {
    if (
      _shouldElideDefaultExport2.default.call(void 0, this.isTypeScriptTransformEnabled, this.tokens, this.declarationInfo)
    ) {
      // If the exported value is just an identifier and should be elided by TypeScript
      // rules, then remove it entirely. It will always have the form `export default e`,
      // where `e` is an identifier.
      this.tokens.removeInitialToken();
      this.tokens.removeToken();
      this.tokens.removeToken();
      return true;
    }

    const alreadyHasName =
      this.tokens.matches4(_types.TokenType._export, _types.TokenType._default, _types.TokenType._function, _types.TokenType.name) ||
      // export default async function
      this.tokens.matches5(_types.TokenType._export, _types.TokenType._default, _types.TokenType.name, _types.TokenType._function, _types.TokenType.name) ||
      this.tokens.matches4(_types.TokenType._export, _types.TokenType._default, _types.TokenType._class, _types.TokenType.name) ||
      this.tokens.matches5(_types.TokenType._export, _types.TokenType._default, _types.TokenType._abstract, _types.TokenType._class, _types.TokenType.name);

    if (!alreadyHasName && this.reactHotLoaderTransformer) {
      // This is a plain "export default E" statement and we need to assign E to a variable.
      // Change "export default E" to "let _default; export default _default = E"
      const defaultVarName = this.nameManager.claimFreeName("_default");
      this.tokens.replaceToken(`let ${defaultVarName}; export`);
      this.tokens.copyToken();
      this.tokens.appendCode(` ${defaultVarName} =`);
      this.reactHotLoaderTransformer.setExtractedDefaultExportName(defaultVarName);
      return true;
    }
    return false;
  }

  /**
   * In TypeScript, we need to remove named exports that were never declared or only declared as a
   * type.
   */
   processNamedExports() {
    if (!this.isTypeScriptTransformEnabled) {
      return false;
    }
    this.tokens.copyExpectedToken(_types.TokenType._export);
    this.tokens.copyExpectedToken(_types.TokenType.braceL);

    while (!this.tokens.matches1(_types.TokenType.braceR)) {
      if (!this.tokens.matches1(_types.TokenType.name)) {
        throw new Error("Expected identifier at the start of named export.");
      }
      if (this.shouldElideExportedName(this.tokens.identifierName())) {
        while (
          !this.tokens.matches1(_types.TokenType.comma) &&
          !this.tokens.matches1(_types.TokenType.braceR) &&
          !this.tokens.isAtEnd()
        ) {
          this.tokens.removeToken();
        }
        if (this.tokens.matches1(_types.TokenType.comma)) {
          this.tokens.removeToken();
        }
      } else {
        while (
          !this.tokens.matches1(_types.TokenType.comma) &&
          !this.tokens.matches1(_types.TokenType.braceR) &&
          !this.tokens.isAtEnd()
        ) {
          this.tokens.copyToken();
        }
        if (this.tokens.matches1(_types.TokenType.comma)) {
          this.tokens.copyToken();
        }
      }
    }
    this.tokens.copyExpectedToken(_types.TokenType.braceR);
    return true;
  }

  /**
   * ESM elides all imports with the rule that we only elide if we see that it's
   * a type and never see it as a value. This is in contract to CJS, which
   * elides imports that are completely unknown.
   */
   shouldElideExportedName(name) {
    return (
      this.isTypeScriptTransformEnabled &&
      this.declarationInfo.typeDeclarations.has(name) &&
      !this.declarationInfo.valueDeclarations.has(name)
    );
  }
} exports.default = ESMImportTransformer;
