const tsUtils = {
  __accessCheck(obj, member, msg) {
    if (!member.has(obj)) throw new TypeError(`Cannot ${msg}`);
  },
  __privateGet(obj, member, getter) {
    this.__accessCheck(obj, member, "read from private field");
    return getter ? getter.call(obj) : member.get(obj);
  },
  __privateAdd(obj, member, value) {
    if (member.has(obj)) throw new TypeError("Cannot add the same private member more than once");
    member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
  },
  __privateSet(obj, member, value, setter) {
    this.__accessCheck(obj, member, "write to private field");
    setter ? setter.call(obj, value) : member.set(obj, value);
    return value;
  },
  __privateMethod(obj, member, method) {
    this.__accessCheck(obj, member, "access private method");
    return method;
  }
};

import ts from "typescript";

function traverseTokens(node, callback, sourceFile = node.getSourceFile()) {
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

function canHaveTrailingTrivia(token) {
  switch (token.kind) {
    case ts.SyntaxKind.CloseBraceToken:
      return token.parent.kind !== ts.SyntaxKind.JsxExpression || !isJsxElementOrFragment(token.parent.parent);
    case ts.SyntaxKind.GreaterThanToken:
      switch (token.parent.kind) {
        case ts.SyntaxKind.JsxOpeningElement:
          return token.end !== token.parent.end;
        case ts.SyntaxKind.JsxOpeningFragment:
          return false;
        case ts.SyntaxKind.JsxSelfClosingElement:
          return token.end !== token.parent.end || !isJsxElementOrFragment(token.parent.parent);
        case ts.SyntaxKind.JsxClosingElement:
        case ts.SyntaxKind.JsxClosingFragment:
          return !isJsxElementOrFragment(token.parent.parent.parent);
      }
  }
  return true;
}
function isJsxElementOrFragment(node) {
  return node.kind === ts.SyntaxKind.JsxElement || node.kind === ts.SyntaxKind.JsxFragment;
}
function iterateComments(node, callback, sourceFile = node.getSourceFile()) {
  const fullText = sourceFile.text;
  const notJsx = sourceFile.languageVariant !== ts.LanguageVariant.JSX;
  return traverseTokens(node, (token) => {
    if (token.pos === token.end) return;
    if (token.kind !== ts.SyntaxKind.JsxText) {
      ts.forEachLeadingCommentRange(fullText, token.pos === 0 ? (ts.getShebang(fullText) ?? "").length : token.pos, commentCallback);
    }
    if (notJsx || canHaveTrailingTrivia(token)) {
      return ts.forEachTrailingCommentRange(fullText, token.end, commentCallback);
    }
  }, sourceFile);

  function commentCallback(pos, end, kind) {
    callback(fullText, { end, kind, pos });
  }
}

function isCompilerOptionEnabled(options, option) {
  switch (option) {
    case "stripInternal":
    case "declarationMap":
    case "emitDeclarationOnly":
      return options[option] === true && isCompilerOptionEnabled(options, "declaration");
    case "declaration":
      return options.declaration || isCompilerOptionEnabled(options, "composite");
    case "incremental":
      return options.incremental === void 0 ? isCompilerOptionEnabled(options, "composite") : options.incremental;
    case "skipDefaultLibCheck":
      return options.skipDefaultLibCheck || isCompilerOptionEnabled(options, "skipLibCheck");
    case "suppressImplicitAnyIndexErrors":
      return options.suppressImplicitAnyIndexErrors === true && isCompilerOptionEnabled(options, "noImplicitAny");
    case "allowSyntheticDefaultImports":
      return options.allowSyntheticDefaultImports !== void 0 ? options.allowSyntheticDefaultImports : isCompilerOptionEnabled(options, "esModuleInterop") || options.module === ts.ModuleKind.System;
    case "noUncheckedIndexedAccess":
      return options.noUncheckedIndexedAccess === true && isCompilerOptionEnabled(options, "strictNullChecks");
    case "allowJs":
      return options.allowJs === void 0 ? isCompilerOptionEnabled(options, "checkJs") : options.allowJs;
    case "noImplicitAny":
    case "noImplicitThis":
    case "strictNullChecks":
    case "strictFunctionTypes":
    case "strictPropertyInitialization":
    case "alwaysStrict":
    case "strictBindCallApply":
      return isStrictCompilerOptionEnabled(options, option);
  }
  return options[option] === true;
}

function isStrictCompilerOptionEnabled(options, option) {
  return (options.strict ? options[option] !== false : options[option] === true) &&
    (option !== "strictPropertyInitialization" || isStrictCompilerOptionEnabled(options, "strictNullChecks"));
}

import ts2 from "typescript";

function isFlagSet(allFlags, flag) {
  return (allFlags & flag) !== 0;
}
function isModifierFlagSet(node, flag) {
  return isFlagSet(ts2.getCombinedModifierFlags(node), flag);
}

function includesModifier(modifiers, ...kinds) {
  if (modifiers === void 0) return false;
  for (const modifier of modifiers) {
    if (kinds.includes(modifier.kind)) return true;
  }
  return false;
}

import ts4 from "typescript";

function isAssignmentKind(kind) {
  return kind >= ts4.SyntaxKind.FirstAssignment && kind <= ts4.SyntaxKind.LastAssignment;
}

function isValidPropertyAccess(text, languageVersion = ts4.ScriptTarget.Latest) {
  if (text.length === 0) return false;
  let ch = text.codePointAt(0);
  if (!ts4.isIdentifierStart(ch, languageVersion)) return false;
  for (let i = charSize(ch); i < text.length; i += charSize(ch)) {
    ch = text.codePointAt(i);
    if (!ts4.isIdentifierPart(ch, languageVersion)) return false;
  }
  return true;
}

import ts5 from "typescript";

var AccessKind = {
  None: 0,
  Read: 1,
  Write: 2,
  Delete: 4,
  ReadWrite: 3
};

function getAccessKind(node) {
  const parent = node.parent;
  switch (parent.kind) {
    case ts5.SyntaxKind.DeleteExpression:
      return AccessKind.Delete;
    case ts5.SyntaxKind.PostfixUnaryExpression:
      return AccessKind.ReadWrite;
    case ts5.SyntaxKind.PrefixUnaryExpression:
      return parent.operator === ts5.SyntaxKind.PlusPlusToken || parent.operator === ts5.SyntaxKind.MinusMinusToken ? AccessKind.ReadWrite : AccessKind.Read;
    case ts5.SyntaxKind.BinaryExpression:
      return parent.right === node ? AccessKind.Read : !isAssignmentKind(parent.operatorToken.kind) ? AccessKind.Read : parent.operatorToken.kind === ts5.SyntaxKind.EqualsToken ? AccessKind.Write : AccessKind.ReadWrite;
    case ts5.SyntaxKind.ShorthandPropertyAssignment:
      return parent.objectAssignmentInitializer === node ? AccessKind.Read : isInDestructuringAssignment(parent) ? AccessKind.Write : AccessKind.Read;
    case ts5.SyntaxKind.PropertyAssignment:
      return parent.name === node ? AccessKind.None : isInDestructuringAssignment(parent) ? AccessKind.Write : AccessKind.Read;
    case ts5.SyntaxKind.ArrayLiteralExpression:
    case ts5.SyntaxKind.SpreadElement:
    case ts5.SyntaxKind.SpreadAssignment:
      return isInDestructuringAssignment(parent) ? AccessKind.Write : AccessKind.Read;
    case ts5.SyntaxKind.ParenthesizedExpression:
    case ts5.SyntaxKind.NonNullExpression:
    case ts5.SyntaxKind.TypeAssertionExpression:
    case ts5.SyntaxKind.AsExpression:
      return getAccessKind(parent);
    case ts5.SyntaxKind.ForOfStatement:
    case ts5.SyntaxKind.ForInStatement:
      return parent.initializer === node ? AccessKind.Write : AccessKind.Read;
    case ts5.SyntaxKind.ExpressionWithTypeArguments:
      return parent.parent.token === ts5.SyntaxKind.ExtendsKeyword && parent.parent.parent.kind !== ts5.SyntaxKind.InterfaceDeclaration ? AccessKind.Read : AccessKind.None;
    case ts5.SyntaxKind.ComputedPropertyName:
    case ts5.SyntaxKind.ExpressionStatement:
    case ts5.SyntaxKind.TypeOfExpression:
    case ts5.SyntaxKind.ElementAccessExpression:
    case ts5.SyntaxKind.ForStatement:
    case ts5.SyntaxKind.IfStatement:
    case ts5.SyntaxKind.DoStatement:
    case ts5.SyntaxKind.WhileStatement:
    case ts5.SyntaxKind.SwitchStatement:
    case ts5.SyntaxKind.WithStatement:
    case ts5.SyntaxKind.ThrowStatement:
    case ts5.SyntaxKind.CallExpression:
    case ts5.SyntaxKind.NewExpression:
    case ts5.SyntaxKind.TaggedTemplateExpression:
    case ts5.SyntaxKind.JsxExpression:
    case ts5.SyntaxKind.Decorator:
    case ts5.SyntaxKind.TemplateSpan:
    case ts5.SyntaxKind.JsxOpeningElement:
    case ts5.SyntaxKind.JsxSelfClosingElement:
    case ts5.SyntaxKind.JsxSpreadAttribute:
    case ts5.SyntaxKind.VoidExpression:
    case ts5.SyntaxKind.ReturnStatement:
    case ts5.SyntaxKind.AwaitExpression:
    case ts5.SyntaxKind.YieldExpression:
    case ts5.SyntaxKind.ConditionalExpression:
    case ts5.SyntaxKind.CaseClause:
    case ts5.SyntaxKind.JsxElement:
      return AccessKind.Read;
    case ts5.SyntaxKind.ArrowFunction:
      return parent.body === node ? AccessKind.Read : AccessKind.Write;
    case ts5.SyntaxKind.PropertyDeclaration:
    case ts5.SyntaxKind.VariableDeclaration:
    case ts5.SyntaxKind.Parameter:
    case ts5.SyntaxKind.EnumMember:
    case ts5.SyntaxKind.BindingElement:
    case ts5.SyntaxKind.JsxAttribute:
      return parent.initializer === node ? AccessKind.Read : AccessKind.None;
    case ts5.SyntaxKind.PropertyAccessExpression:
      return parent.expression === node ? AccessKind.Read : AccessKind.None;
    case ts5.SyntaxKind.ExportAssignment:
      return parent.isExportEquals ? AccessKind.Read : AccessKind.None;
  }
  return AccessKind.None;
}

function isInDestructuringAssignment(node) {
  switch (node.kind) {
    case ts5.SyntaxKind.ShorthandPropertyAssignment:
      if (node.objectAssignmentInitializer !== void 0) return true;
    case ts5.SyntaxKind.PropertyAssignment:
    case ts5.SyntaxKind.SpreadAssignment:
      node = node.parent;
      break;
    case ts5.SyntaxKind.SpreadElement:
      if (node.parent.kind !== ts5.SyntaxKind.ArrayLiteralExpression) return false;
      node = node.parent;
  }
  while (true) {
    switch (node.parent.kind) {
      case ts5.SyntaxKind.BinaryExpression:
        return node.parent.left === node && node.parent.operatorToken.kind === ts5.SyntaxKind.EqualsToken;
      case ts5.SyntaxKind.ForOfStatement:
        return node.parent.initializer === node;
      case ts5.SyntaxKind.ArrayLiteralExpression:
      case ts5.SyntaxKind.ObjectLiteralExpression:
        node = node.parent;
        break;
      case ts5.SyntaxKind.SpreadAssignment:
      case ts5.SyntaxKind.PropertyAssignment:
        node = node.parent.parent;
        break;
      case ts5.SyntaxKind.SpreadElement:
        if (node.parent.parent.kind !== ts5.SyntaxKind.ArrayLiteralExpression) return false;
        node = node.parent.parent;
        break;
      default:
        return false;
    }
  }
}

export { traverseTokens, canHaveTrailingTrivia, isAssignmentKind, getAccessKind };
