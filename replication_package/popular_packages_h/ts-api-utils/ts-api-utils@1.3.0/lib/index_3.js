// Utility functions for handling private access
function accessCheck(obj, member, msg) {
  if (!member.has(obj)) throw TypeError(`Cannot ${msg}`);
}
function privateGet(obj, member, getter) {
  accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
}
function privateAdd(obj, member, value) {
  if (member.has(obj)) throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
}
function privateSet(obj, member, value, setter) {
  accessCheck(obj, member, "write to private field");
  if (setter) setter.call(obj, value);
  else member.set(obj, value);
  return value;
}
function privateMethod(obj, member, method) {
  accessCheck(obj, member, "access private method");
  return method;
}

// Import the TypeScript library
import ts from 'typescript';

// Function to iterate over each token in an AST node
function forEachToken(node, callback, sourceFile = node.getSourceFile()) {
  const queue = [];
  while (true) {
    if (ts.isTokenKind(node.kind)) {
      callback(node);
    } else if (node.kind !== ts.SyntaxKind.JSDocComment) {
      const children = node.getChildren(sourceFile);
      if (children.length === 1) {
        node = children[0];
        continue;
      }
      for (let i = children.length - 1; i >= 0; --i) {
        queue.push(children[i]);
      }
    }
    if (queue.length === 0) break;
    node = queue.pop();
  }
}

// Handler to collect and traverse over comments in the source file
function forEachComment(node, callback, sourceFile = node.getSourceFile()) {
  const fullText = sourceFile.text;
  const notJsx = sourceFile.languageVariant !== ts.LanguageVariant.JSX;
  return forEachToken(
    node,
    (token) => {
      if (token.pos !== token.end) {
        if (token.kind !== ts.SyntaxKind.JsxText) {
          ts.forEachLeadingCommentRange(
            fullText,
            token.pos === 0 ? (ts.getShebang(fullText) ?? "").length : token.pos,
            commentCallback
          );
        }
        if (notJsx || canHaveTrailingTrivia(token)) {
          return ts.forEachTrailingCommentRange(fullText, token.end, commentCallback);
        }
      }
    }
  );
  function commentCallback(pos, end, kind) {
    callback(fullText, { end, kind, pos });
  }
}

// Function to check enabled compiler options
function isCompilerOptionEnabled(options, option) {
  switch (option) {
    case 'stripInternal':
    case 'declarationMap':
    case 'emitDeclarationOnly':
      return options[option] === true && isCompilerOptionEnabled(options, 'declaration');
    case 'declaration':
      return options.declaration || isCompilerOptionEnabled(options, 'composite');
    case 'incremental':
      return options.incremental === undefined ? isCompilerOptionEnabled(options, 'composite') : options.incremental;
    case 'allowJs':
      return options.allowJs === undefined ? isCompilerOptionEnabled(options, 'checkJs') : options.allowJs;
    case 'noImplicitAny':
    case 'noImplicitThis':
    case 'strictNullChecks':
    case 'strictFunctionTypes':
    case 'strictPropertyInitialization':
    case 'alwaysStrict':
    case 'strictBindCallApply':
      return isStrictCompilerOptionEnabled(options, option);
  }
  return options[option] === true;
}

// Scope and Usage Analysis
function collectVariableUsage(sourceFile) {
  return new UsageWalker().getUsage(sourceFile);
}

class UsageWalker {
  constructor() {
    this.result = new Map();
    this.scope = undefined;
  }

  getUsage(sourceFile) {
    const variableCallback = (variable, key) => {
      this.result.set(key, variable);
    };
    const isModule = ts.isExternalModule(sourceFile);
    this.scope = new RootScope(
      sourceFile.isDeclarationFile && isModule && !containsExportStatement(sourceFile),
      !isModule
    );

    const cb = (node) => {
      if (isBlockScopeBoundary(node)) {
        return continueWithScope(node, new BlockScope(this.scope.getFunctionScope(), this.scope), handleBlockScope);
      }
      // Handle different kinds of TypeScript AST nodes
      switch (node.kind) {
        case ts.SyntaxKind.ClassExpression:
          return continueWithScope(
            node,
            node.name !== undefined ? new ClassExpressionScope(node.name, this.scope) : new NonRootScope(this.scope, 1)
          );
        case ts.SyntaxKind.ClassDeclaration:
          this.handleDeclaration(node, true, 4 | 2);
          return continueWithScope(node, new NonRootScope(this.scope, 1));
        case ts.SyntaxKind.InterfaceDeclaration:
        case ts.SyntaxKind.EnumDeclaration:
          this.handleDeclaration(node, true, 7);
          return continueWithScope(
            node,
            this.scope.createOrReuseEnumScope(
              node.name.text,
              includesModifier(node.modifiers, ts.SyntaxKind.ExportKeyword)
            )
          );
        case ts.SyntaxKind.ModuleDeclaration:
          return this.handleModule(node, continueWithScope);
        case ts.SyntaxKind.MappedType:
          return continueWithScope(node, new NonRootScope(this.scope, 4));
        case ts.SyntaxKind.TypeAliasDeclaration:
          this.handleDeclaration(node, true, 2);
          return continueWithScope(node, new NonRootScope(this.scope, 4));
        case ts.SyntaxKind.FunctionExpression:
        case ts.SyntaxKind.ArrowFunction:
        case ts.SyntaxKind.MethodDeclaration:
        case ts.SyntaxKind.FunctionDeclaration:
          return this.handleFunctionLikeDeclaration(node, cb, variableCallback);
        case ts.SyntaxKind.VariableDeclarationList:
          this.handleVariableDeclaration(node);
          break;
        case ts.SyntaxKind.Parameter:
          if (node.parent.kind !== ts.SyntaxKind.IndexSignature && (node.name.kind !== ts.SyntaxKind.Identifier || identifierToKeywordKind(node.name) !== ts.SyntaxKind.ThisKeyword)) {
            this.handleBindingName(node.name, false, false);
          }
          break;
        case ts.SyntaxKind.EnumMember:
          this.scope.addVariable(
            getPropertyName(node.name),
            node.name,
            1,
            true,
            4
          );
          break;
        case ts.SyntaxKind.TypeParameter:
          this.scope.addVariable(
            node.name.text,
            node.name,
            node.parent.kind === ts.SyntaxKind.InferType ? 8 : 7,
            false,
            2
          );
          break;
        case ts.SyntaxKind.ImportClause:
        case ts.SyntaxKind.ImportSpecifier:
        case ts.SyntaxKind.NamespaceImport:
        case ts.SyntaxKind.ImportEqualsDeclaration:
          this.handleDeclaration(node, false, 7 | 8);
          break;
        case ts.SyntaxKind.ExportSpecifier:
          if (node.propertyName !== undefined) {
            return this.scope.markExported(node.propertyName, node.name);
          }
          return this.scope.markExported(node.name);
        case ts.SyntaxKind.ExportAssignment:
          if (node.expression.kind === ts.SyntaxKind.Identifier) {
            return this.scope.markExported(node.expression);
          }
          break;
        case ts.SyntaxKind.Identifier: {
          const domain = getUsageDomain(node);
          if (domain !== undefined) {
            this.scope.addUse({ domain, location: node });
          }
          return;
        }
      }
      return ts.forEachChild(node, cb);
    };

    const continueWithScope = (node, scope, next = forEachChild) => {
      const savedScope = this.scope;
      this.scope = scope;
      next(node);
      this.scope.end(variableCallback);
      this.scope = savedScope;
    };

    const handleBlockScope = (node) => {
      if (node.kind === ts.SyntaxKind.CatchClause && node.variableDeclaration !== undefined) {
        this.handleBindingName(node.variableDeclaration.name, true, false);
      }
      return ts.forEachChild(node, cb);
    };

    ts.forEachChild(sourceFile, cb);
    this.scope.end(variableCallback);
    return this.result;
  }

  handleBindingName(name, blockScoped, exported) {
    if (name.kind === ts.SyntaxKind.Identifier) {
      return this.scope.addVariable(
        name.text,
        name,
        blockScoped ? 3 : 1,
        exported,
        4
      );
    }
    forEachDestructuringIdentifier(name, (declaration) => {
      this.scope.addVariable(
        declaration.name.text,
        declaration.name,
        blockScoped ? 3 : 1,
        exported,
        4
      );
    });
  }

  handleConditionalType(node, cb, varCb) {
    const savedScope = this.scope;
    const scope = this.scope = new ConditionalTypeScope(savedScope);
    cb(node.checkType);
    scope.updateState(1);
    cb(node.extendsType);
    scope.updateState(2);
    cb(node.trueType);
    scope.updateState(3);
    cb(node.falseType);
    scope.end(varCb);
    this.scope = savedScope;
  }

  handleDeclaration(node, blockScoped, domain) {
    if (node.name !== undefined) {
      this.scope.addVariable(
        node.name.text,
        node.name,
        blockScoped ? 3 : 1,
        includesModifier(node.modifiers, ts.SyntaxKind.ExportKeyword),
        domain
      );
    }
  }

  handleFunctionLikeDeclaration(node, cb, varCb) {
    if (canHaveDecorators(node)) {
      getDecorators(node)?.forEach(cb);
    }
    const savedScope = this.scope;
    if (node.kind === ts.SyntaxKind.FunctionDeclaration) {
      this.handleDeclaration(node, false, 4);
    }
    const scope = this.scope = (node.kind === ts.SyntaxKind.FunctionExpression && node.name !== undefined)
      ? new FunctionExpressionScope(node.name, savedScope)
      : new FunctionScope(savedScope);
    if (node.name !== undefined) cb(node.name);
    if (node.typeParameters !== undefined) node.typeParameters.forEach(cb);
    node.parameters.forEach(cb);
    if (node.type !== undefined) cb(node.type);
    if (node.body !== undefined) {
      scope.beginBody();
      cb(node.body);
    }
    scope.end(varCb);
    this.scope = savedScope;
  }

  handleModule(node, next) {
    if (node.flags & ts.SyntaxKind.GlobalAugmentation) {
      return next(
        node,
        this.scope.createOrReuseNamespaceScope('-global', false, true, false)
      );
    }
    if (node.name.kind === ts.SyntaxKind.Identifier) {
      const exported = isNamespaceExported(node);
      this.scope.addVariable(
        node.name.text,
        node.name,
        1,
        exported,
        1 | 4
      );
      const ambient = includesModifier(node.modifiers, ts.SyntaxKind.DeclareKeyword);
      return next(
        node,
        this.scope.createOrReuseNamespaceScope(
          node.name.text,
          exported,
          ambient,
          ambient && namespaceHasExportStatement(node)
        )
      );
    }
    return next(
      node,
      this.scope.createOrReuseNamespaceScope(
        `"${node.name.text}"`,
        false,
        true,
        namespaceHasExportStatement(node)
      )
    );
  }

  handleVariableDeclaration(declarationList) {
    const blockScoped = isBlockScopedVariableDeclarationList(declarationList);
    const exported = declarationList.parent.kind === ts.SyntaxKind.VariableStatement
        && includesModifier(declarationList.parent.modifiers, ts.SyntaxKind.ExportKeyword);
    for (const declaration of declarationList.declarations) {
      this.handleBindingName(declaration.name, blockScoped, exported);
    }
  }
}

// Additional utility functions
function isNamespaceExported(node) {
  return node.parent.kind === ts.SyntaxKind.ModuleDeclaration || includesModifier(node.modifiers, ts.SyntaxKind.ExportKeyword);
}

function namespaceHasExportStatement(ns) {
  if (ns.body === undefined || ns.body.kind !== ts.SyntaxKind.ModuleBlock) return false;
  return containsExportStatement(ns.body);
}

function containsExportStatement(block) {
  for (const statement of block.statements) {
    if (statement.kind === ts.SyntaxKind.ExportDeclaration || statement.kind === ts.SyntaxKind.ExportAssignment) {
      return true;
    }
  }
  return false;
}

function isBlockScopedVariableDeclarationList(declarationList) {
  return (declarationList.flags & ts.SyntaxKind.BlockScoped) !== 0;
}

function forEachDestructuringIdentifier(pattern, fn) {
  for (const element of pattern.elements) {
    if (element.kind !== ts.SyntaxKind.BindingElement) continue;
    if (element.name.kind === ts.SyntaxKind.Identifier) {
      fn(element);
    } else {
      forEachDestructuringIdentifier(element.name, fn);
    }
  }
}

// Exported members
export {
  forEachComment,
  forEachToken,
  isCompilerOptionEnabled,
  collectVariableUsage,
};
