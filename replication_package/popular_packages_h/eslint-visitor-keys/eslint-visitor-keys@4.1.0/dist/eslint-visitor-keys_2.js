'use strict';

/**
 * @typedef {{ readonly [type: string]: ReadonlyArray<string> }} VisitorKeys
 */

/**
 * @type {VisitorKeys}
 */
const KEYS = {
    ArrayExpression: ["elements"],
    ArrayPattern: ["elements"],
    ArrowFunctionExpression: ["params", "body"],
    AssignmentExpression: ["left", "right"],
    AssignmentPattern: ["left", "right"],
    AwaitExpression: ["argument"],
    BinaryExpression: ["left", "right"],
    BlockStatement: ["body"],
    BreakStatement: ["label"],
    CallExpression: ["callee", "arguments"],
    CatchClause: ["param", "body"],
    ChainExpression: ["expression"],
    ClassBody: ["body"],
    ClassDeclaration: ["id", "superClass", "body"],
    ClassExpression: ["id", "superClass", "body"],
    ConditionalExpression: ["test", "consequent", "alternate"],
    ContinueStatement: ["label"],
    DebuggerStatement: [],
    DoWhileStatement: ["body", "test"],
    EmptyStatement: [],
    ExperimentalRestProperty: ["argument"],
    ExperimentalSpreadProperty: ["argument"],
    ExportAllDeclaration: ["exported", "source"],
    ExportDefaultDeclaration: ["declaration"],
    ExportNamedDeclaration: ["declaration", "specifiers", "source"],
    ExportSpecifier: ["exported", "local"],
    ExpressionStatement: ["expression"],
    ForInStatement: ["left", "right", "body"],
    ForOfStatement: ["left", "right", "body"],
    ForStatement: ["init", "test", "update", "body"],
    FunctionDeclaration: ["id", "params", "body"],
    FunctionExpression: ["id", "params", "body"],
    Identifier: [],
    IfStatement: ["test", "consequent", "alternate"],
    ImportDeclaration: ["specifiers", "source"],
    ImportDefaultSpecifier: ["local"],
    ImportExpression: ["source"],
    ImportNamespaceSpecifier: ["local"],
    ImportSpecifier: ["imported", "local"],
    JSXAttribute: ["name", "value"],
    JSXClosingElement: ["name"],
    JSXClosingFragment: [],
    JSXElement: ["openingElement", "children", "closingElement"],
    JSXEmptyExpression: [],
    JSXExpressionContainer: ["expression"],
    JSXFragment: ["openingFragment", "children", "closingFragment"],
    JSXIdentifier: [],
    JSXMemberExpression: ["object", "property"],
    JSXNamespacedName: ["namespace", "name"],
    JSXOpeningElement: ["name", "attributes"],
    JSXOpeningFragment: [],
    JSXSpreadAttribute: ["argument"],
    JSXSpreadChild: ["expression"],
    JSXText: [],
    LabeledStatement: ["label", "body"],
    Literal: [],
    LogicalExpression: ["left", "right"],
    MemberExpression: ["object", "property"],
    MetaProperty: ["meta", "property"],
    MethodDefinition: ["key", "value"],
    NewExpression: ["callee", "arguments"],
    ObjectExpression: ["properties"],
    ObjectPattern: ["properties"],
    PrivateIdentifier: [],
    Program: ["body"],
    Property: ["key", "value"],
    PropertyDefinition: ["key", "value"],
    RestElement: ["argument"],
    ReturnStatement: ["argument"],
    SequenceExpression: ["expressions"],
    SpreadElement: ["argument"],
    StaticBlock: ["body"],
    Super: [],
    SwitchCase: ["test", "consequent"],
    SwitchStatement: ["discriminant", "cases"],
    TaggedTemplateExpression: ["tag", "quasi"],
    TemplateElement: [],
    TemplateLiteral: ["quasis", "expressions"],
    ThisExpression: [],
    ThrowStatement: ["argument"],
    TryStatement: ["block", "handler", "finalizer"],
    UnaryExpression: ["argument"],
    UpdateExpression: ["argument"],
    VariableDeclaration: ["declarations"],
    VariableDeclarator: ["id", "init"],
    WhileStatement: ["test", "body"],
    WithStatement: ["object", "body"],
    YieldExpression: ["argument"]
};

// Gather all node types from KEYS
const NODE_TYPES = Object.keys(KEYS);

// Freeze the visitor keys to ensure immutability
for (const type of NODE_TYPES) {
    Object.freeze(KEYS[type]);
}
Object.freeze(KEYS);

// List of keys to ignore when traversing
const KEY_BLACKLIST = new Set([
    "parent",
    "leadingComments",
    "trailingComments"
]);

// Function to filter valid keys for traversal
function filterKey(key) {
    return !KEY_BLACKLIST.has(key) && key[0] !== "_";
}

// Retrieve keys of a given AST node for visiting
function getKeys(node) {
    return Object.keys(node).filter(filterKey);
}

// Create a union set of KEYS and additionalKeys
function unionWith(additionalKeys) {
    const result = { ...KEYS };

    for (const [type, keys] of Object.entries(additionalKeys)) {
        const combinedKeys = result[type] ? new Set([...result[type], ...keys]) : new Set(keys);
        result[type] = Object.freeze([...combinedKeys]);
    }

    return Object.freeze(result);
}

// Exporting the relevant functions and KEYS object
exports.KEYS = KEYS;
exports.getKeys = getKeys;
exports.unionWith = unionWith;
