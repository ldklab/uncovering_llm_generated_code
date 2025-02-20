// Utility Functions for private handling
const accessCheck = (obj, member, msg) => {
  if (!member.has(obj)) throw TypeError("Cannot " + msg);
};

const privateGet = (obj, member, getter) => {
  accessCheck(obj, member, "read from private field");
  return getter ? getter.call(obj) : member.get(obj);
};

const privateAdd = (obj, member, value) => {
  if (member.has(obj))
    throw TypeError("Cannot add the same private member more than once");
  member instanceof WeakSet ? member.add(obj) : member.set(obj, value);
};

const privateSet = (obj, member, value, setter) => {
  accessCheck(obj, member, "write to private field");
  setter ? setter.call(obj, value) : member.set(obj, value);
  return value;
};

// Token and Comment Iteration Functions
import ts from "typescript";

function iterateTokens(node, callback, sourceFile = node.getSourceFile()) {
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
    if (queue.length === 0) {
      break;
    }
    node = queue.pop();
  }
}

function canHaveTrivia(token) {
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
          return token.end !== token.parent.end || 
          !isJsxElementOrFragment(token.parent.parent);
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

// Import Compiler options
import ts2 from "typescript";

function isOptionEnabled(options, option) {
  switch (option) {
    case "stripInternal":
    case "declarationMap":
    case "emitDeclarationOnly":
      return options[option] === true && isOptionEnabled(options, "declaration");
    case "declaration":
      return options.declaration || isOptionEnabled(options, "composite");
    case "incremental":
      return options.incremental === undefined ? isOptionEnabled(options, "composite") : options.incremental;
    case "skipDefaultLibCheck":
      return options.skipDefaultLibCheck || isOptionEnabled(options, "skipLibCheck");
    case "suppressImplicitAnyIndexErrors":
      return options.suppressImplicitAnyIndexErrors === true && isOptionEnabled(options, "noImplicitAny");
    case "allowSyntheticDefaultImports":
      return options.allowSyntheticDefaultImports !== undefined ? options.allowSyntheticDefaultImports : isOptionEnabled(options, "esModuleInterop") || options.module === ts2.ModuleKind.System;
    case "noUncheckedIndexedAccess":
      return options.noUncheckedIndexedAccess === true && isOptionEnabled(options, "strictNullChecks");
    case "allowJs":
      return options.allowJs === undefined ? isOptionEnabled(options, "checkJs") : options.allowJs;
    case "noImplicitAny":
    case "noImplicitThis":
    case "strictNullChecks":
    case "strictFunctionTypes":
    case "strictPropertyInitialization":
    case "alwaysStrict":
    case "strictBindCallApply":
      return isStrictOptionEnabled(options, option);
  }
  return options[option] === true;
}

function isStrictOptionEnabled(options, option) {
  return (options.strict ? options[option] !== false : options[option] === true) &&
    (option !== "strictPropertyInitialization" || isStrictOptionEnabled(options, "strictNullChecks"));
}

// Flag and Modifier Functions
import ts3 from "typescript";

function isSetFlag(allFlags, flag) {
  return (allFlags & flag) !== 0;
}

function isSetFlagOnObject(obj, flag) {
  return isSetFlag(obj.flags, flag);
}

function isSetModifierFlag(node, flag) {
  return isSetFlag(ts3.getCombinedModifierFlags(node), flag);
}

var isNodeFlagSet = isSetFlagOnObject;

function isObjectSetFlag(objectType, flag) {
  return isSetFlag(objectType.objectFlags, flag);
}

var isSymbolFlagSet = isSetFlagOnObject;
var isTypeFlagSet = isSetFlagOnObject;

// Modifier Inclusion Function
function doesIncludeModifier(modifiers, ...kinds) {
  if (modifiers === undefined) {
    return false;
  }
  for (const modifier of modifiers) {
    if (kinds.includes(modifier.kind)) {
      return true;
    }
  }
  return false;
}

// Syntax Parsing and Property Check
import ts4 from "typescript";

function isTypeAssignmentKind(kind) {
  return kind >= ts4.SyntaxKind.FirstAssignment && kind <= ts4.SyntaxKind.LastAssignment;
}

function isNumberPropertyName(name) {
  return String(+name) === name;
}

function getCharacterSize(ch) {
  return ch >= 65536 ? 2 : 1;
}

function isValidAccess(text, languageVersion = ts4.ScriptTarget.Latest) {
  if (text.length === 0) {
    return false;
  }
  let ch = text.codePointAt(0);
  if (!ts4.isIdentifierStart(ch, languageVersion)) {
    return false;
  }
  for (let i = getCharacterSize(ch); i < text.length; i += getCharacterSize(ch)) {
    ch = text.codePointAt(i);
    if (!ts4.isIdentifierPart(ch, languageVersion)) {
      return false;
    }
  }
  return true;
}

// Detailed Node Processing
import ts5 from "typescript";

function analyzeAccessKind(node) {
  const parent = node.parent;
  switch (parent.kind) {
    case ts5.SyntaxKind.DeleteExpression:
      return 4 /* Delete */;
    case ts5.SyntaxKind.PostfixUnaryExpression:
      return 3 /* ReadWrite */;
    case ts5.SyntaxKind.PrefixUnaryExpression:
      return parent.operator === ts5.SyntaxKind.PlusPlusToken || parent.operator === ts5.SyntaxKind.MinusMinusToken ? 3 /* ReadWrite */ : 1 /* Read */;
    case ts5.SyntaxKind.BinaryExpression:
      return parent.right === node ? 1 /* Read */ : 
             !isTypeAssignmentKind(parent.operatorToken.kind) ? 1 /* Read */ : 
             parent.operatorToken.kind === ts5.SyntaxKind.EqualsToken ? 2 /* Write */ : 3 /* ReadWrite */;
    case ts5.SyntaxKind.ShorthandPropertyAssignment:
      return parent.objectAssignmentInitializer === node ? 1 /* Read */ : isDestructuringAssignment(parent) ? 2 /* Write */ : 1 /* Read */;
    case ts5.SyntaxKind.PropertyAssignment:
      return parent.name === node ? 0 /* None */ : isDestructuringAssignment(parent) ? 2 /* Write */ : 1 /* Read */;
    case ts5.SyntaxKind.ArrayLiteralExpression:
    case ts5.SyntaxKind.SpreadElement:
    case ts5.SyntaxKind.SpreadAssignment:
      return isDestructuringAssignment(parent) ? 2 /* Write */ : 1 /* Read */;
    case ts5.SyntaxKind.ParenthesizedExpression:
    case ts5.SyntaxKind.NonNullExpression:
    case ts5.SyntaxKind.TypeAssertionExpression:
    case ts5.SyntaxKind.AsExpression:
      return analyzeAccessKind(parent);
    case ts5.SyntaxKind.ForOfStatement:
    case ts5.SyntaxKind.ForInStatement:
      return parent.initializer === node ? 2 /* Write */ : 1 /* Read */;
    case ts5.SyntaxKind.ExpressionWithTypeArguments:
      return parent.parent.token === ts5.SyntaxKind.ExtendsKeyword && parent.parent.parent.kind !== ts5.SyntaxKind.InterfaceDeclaration ? 1 /* Read */ : 0 /* None */;
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
      return 1 /* Read */;
    case ts5.SyntaxKind.ArrowFunction:
      return parent.body === node ? 1 /* Read */ : 2 /* Write */;
    case ts5.SyntaxKind.PropertyDeclaration:
    case ts5.SyntaxKind.VariableDeclaration:
    case ts5.SyntaxKind.Parameter:
    case ts5.SyntaxKind.EnumMember:
    case ts5.SyntaxKind.BindingElement:
    case ts5.SyntaxKind.JsxAttribute:
      return parent.initializer === node ? 1 /* Read */ : 0 /* None */;
    case ts5.SyntaxKind.PropertyAccessExpression:
      return parent.expression === node ? 1 /* Read */ : 0 /* None */;
    case ts5.SyntaxKind.ExportAssignment:
      return parent.isExportEquals ? 1 /* Read */ : 0 /* None */;
  }
  return 0 /* None */;
}

function isDestructuringAssignment(node) {
  switch (node.kind) {
    case ts5.SyntaxKind.ShorthandPropertyAssignment:
      if (node.objectAssignmentInitializer !== undefined) {
        return true;
      }
    case ts5.SyntaxKind.PropertyAssignment:
    case ts5.SyntaxKind.SpreadAssignment:
      node = node.parent;
      break;
    case ts5.SyntaxKind.SpreadElement:
      if (node.parent.kind !== ts5.SyntaxKind.ArrayLiteralExpression) {
        return false;
      }
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
        if (node.parent.parent.kind !== ts5.SyntaxKind.ArrayLiteralExpression) {
          return false;
        }
        node = node.parent.parent;
        break;
      default:
        return false;
    }
  }
}

// Node Type Guards
import ts6 from "typescript";

function isAbstractKeyword(node) {
  return node.kind === ts6.SyntaxKind.AbstractKeyword;
}

function isAccessorKeyword(node) {
  return node.kind === ts6.SyntaxKind.AccessorKeyword;
}

function isAnyKeyword(node) {
  return node.kind === ts6.SyntaxKind.AnyKeyword;
}

function isAssertKeyword(node) {
  return node.kind === ts6.SyntaxKind.AssertKeyword;
}

function isAssertsKeyword(node) {
  return node.kind === ts6.SyntaxKind.AssertsKeyword;
}

function isAsyncKeyword(node) {
  return node.kind === ts6.SyntaxKind.AsyncKeyword;
}

function isAwaitKeyword(node) {
  return node.kind === ts6.SyntaxKind.AwaitKeyword;
}

function isBigIntKeyword(node) {
  return node.kind === ts6.SyntaxKind.BigIntKeyword;
}

function isBooleanKeyword(node) {
  return node.kind === ts6.SyntaxKind.BooleanKeyword;
}

function isColonToken(node) {
  return node.kind === ts6.SyntaxKind.ColonToken;
}

function isConstKeyword(node) {
  return node.kind === ts6.SyntaxKind.ConstKeyword;
}

function isDeclareKeyword(node) {
  return node.kind === ts6.SyntaxKind.DeclareKeyword;
}

function isDefaultKeyword(node) {
  return node.kind === ts6.SyntaxKind.DefaultKeyword;
}

function isDotToken(node) {
  return node.kind === ts6.SyntaxKind.DotToken;
}

function isEndOfFileToken(node) {
  return node.kind === ts6.SyntaxKind.EndOfFileToken;
}

function isEqualsGreaterThanToken(node) {
  return node.kind === ts6.SyntaxKind.EqualsGreaterThanToken;
}

function isEqualsToken(node) {
  return node.kind === ts6.SyntaxKind.EqualsToken;
}

function isExclamationToken(node) {
  return node.kind === ts6.SyntaxKind.ExclamationToken;
}

function isExportKeyword(node) {
  return node.kind === ts6.SyntaxKind.ExportKeyword;
}

function isFalseKeyword(node) {
  return node.kind === ts6.SyntaxKind.FalseKeyword;
}

function isFalseLiteral(node) {
  return node.kind === ts6.SyntaxKind.FalseKeyword;
}

function isImportExpression(node) {
  return node.kind === ts6.SyntaxKind.ImportKeyword;
}

function isImportKeyword(node) {
  return node.kind === ts6.SyntaxKind.ImportKeyword;
}

function isInKeyword(node) {
  return node.kind === ts6.SyntaxKind.InKeyword;
}

function isInputFiles(node) {
  return node.kind === ts6.SyntaxKind.InputFiles;
}

function isJSDocText(node) {
  return node.kind === ts6.SyntaxKind.JSDocText;
}

function isJsonMinusNumericLiteral(node) {
  return node.kind === ts6.SyntaxKind.PrefixUnaryExpression;
}

function isNeverKeyword(node) {
  return node.kind === ts6.SyntaxKind.NeverKeyword;
}

function isNullKeyword(node) {
  return node.kind === ts6_SyntaxKind.NullKeyword;
}

function isNullLiteral(node) {
  return node.kind === ts6_SyntaxKind.NullKeyword;
}

function isNumberKeyword(node) {
  return node.kind === ts6_SyntaxKind.NumberKeyword;
}

function isObjectKeyword(node) {
  return node.kind === ts6_SyntaxKind.ObjectKeyword;
}

function isOutKeyword(node) {
  return node.kind === ts6_SyntaxKind.OutKeyword;
}

function isOverrideKeyword(node) {
  return node.kind === ts6_SyntaxKind.OverrideKeyword;
}

function isPrivateKeyword(node) {
  return node.kind === ts6_SyntaxKind.PrivateKeyword;
}

function isProtectedKeyword(node) {
  return node.kind === ts6_SyntaxKind.ProtectedKeyword;
}

function isPublicKeyword(node) {
  return node.kind === ts6.SyntaxKind.PublicKeyword;
}

function isQuestionDotToken(node) {
  return node.kind === ts6.SyntaxKind.QuestionDotToken;
}

function isQuestionToken(node) {
  return node.kind === ts6.SyntaxKind.QuestionToken;
}

function isReadonlyKeyword(node) {
  return node.kind === ts6_SyntaxKind.ReadonlyKeyword;
}

function isStaticKeyword(node) {
  return node.kind === ts6_SyntaxKind.StaticKeyword;
}

function isStringKeyword(node) {
  return node.kind === ts6_SyntaxKind.StringKeyword;
}

function isSuperExpression(node) {
  return node.kind === ts6_SyntaxKind.SuperKeyword;
}

function isSuperKeyword(node) {
  return node.kind === ts6_SyntaxKind.SuperKeyword;
}

function isSymbolKeyword(node) {
  return node.kind === ts6_SyntaxKind.SymbolKeyword;
}

function isSyntaxList(node) {
  return node_KIND === ts6_SyntaxKind.SyntaxList;
}

function isThisExpression(node) {
  return node.kind === ts6_SyntaxKind.ThisKeyword;
}

function isThisKeyword(node) {
  return node.kind === ts6_SyntaxKind.ThisKeyword;
}

function isTrueKeyword(node) {
  return node.kind === ts6_SyntaxKind.TrueKeyword;
}

function isTrueLiteral(node) {
  return node.kind === ts6_SyntaxKind.TrueKeyword;
}

function isUndefinedKeyword(node) {
  return node.kind === ts6_SyntaxKind.UndefinedKeyword;
}

function isUnknownKeyword(node) {
  return node.kind === ts6_SyntaxKind.UnknownKeyword;
}

function isUnparsedPrologue(node) {
  return node.kind === ts6_SyntaxKind.UnparsedPrologue;
}

function isUnparsedSyntheticReference(node) {
  return node.kind === ts6_SyntaxKind.UnparsedSyntheticReference;
}

function isVoidKeyword(node) {
  return node.kind === ts6_SyntaxKind.VoidKeyword;
}

// Example main exports
export {
  accessCheck,
  privateGet,
  privateAdd,
  privateSet,
  iterateTokens,
  canHaveTrivia,
  isJsxElementOrFragment,
  isOptionEnabled,
  isStrictOptionEnabled,
  isSetFlag,
  isSetFlagOnObject,
  isSetModifierFlag,
  isNodeFlagSet,
  isObjectSetFlag,
  isSymbolFlagSet,
  isTypeFlagSet,
  doesIncludeModifier,
  isTypeAssignmentKind,
  isNumberPropertyName,
  getCharacterSize,
  isValidAccess,
  analyzeAccessKind,
  isDestructuringAssignment,
  isAbstractKeyword,
  isAccessorKeyword,
  isAnyKeyword,
  isAssertKeyword,
  isAssertsKeyword,
  isAsyncKeyword,
  isAwaitKeyword,
  isBigIntKeyword,
  isBooleanKeyword,
  isColonToken,
  isConstKeyword,
  isDeclareKeyword,
  isDefaultKeyword,
  isDotToken,
  isEndOfFileToken,
  isEqualsGreaterThanToken,
  isEqualsToken,
  isExclamationToken,
  isExportKeyword,
  isFalseKeyword,
  isFalseLiteral,
  isImportExpression,
  isImportKeyword,
  isInKeyword,
  isInputFiles,
  isJsonMinusNumericLiteral,
  isNeverKeyword,
  isNullKeyword,
  isNullLiteral,
  isNumberKeyword,
  isObjectKeyword,
  isOutKeyword,
  isOverrideKeyword,
  isPrivateKeyword,
  isProtectedKeyword,
  isPublicKeyword,
  isQuestionDotToken,
  isQuestionToken,
  isReadonlyKeyword,
  isStaticKeyword,
  isStringKeyword,
  isSuperExpression,
  isSuperKeyword,
  isSymbolKeyword,
  isSyntaxList,
  isThisExpression,
  isThisKeyword,
  isTrueKeyword,
  isTrueLiteral,
  isUndefinedKeyword,
  isUnknownKeyword,
  isUnparsedPrologue,
  isUnparsedSyntheticReference,
  isVoidKeyword,
};
