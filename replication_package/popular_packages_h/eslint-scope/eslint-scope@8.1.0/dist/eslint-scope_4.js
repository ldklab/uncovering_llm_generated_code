'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

const estraverse = require('estraverse');
const esrecurse = require('esrecurse');

function assert(condition, message = "Assertion failed.") {
    if (!condition) {
        throw new Error(message);
    }
}

const READ = 0x1;
const WRITE = 0x2;
const RW = READ | WRITE;

class Reference {
    constructor(ident, scope, flag, writeExpr, maybeImplicitGlobal, partial, init) {
        this.identifier = ident;
        this.from = scope;
        this.tainted = false;
        this.resolved = null;
        this.flag = flag;
        if (this.isWrite()) {
            this.writeExpr = writeExpr;
            this.partial = partial;
            this.init = init;
        }
        this.__maybeImplicitGlobal = maybeImplicitGlobal;
    }

    isStatic() {
        return !this.tainted && this.resolved && this.resolved.scope.isStatic();
    }

    isWrite() {
        return !!(this.flag & Reference.WRITE);
    }

    isRead() {
        return !!(this.flag & Reference.READ);
    }

    isReadOnly() {
        return this.flag === Reference.READ;
    }

    isWriteOnly() {
        return this.flag === Reference.WRITE;
    }

    isReadWrite() {
        return this.flag === Reference.RW;
    }
}

Reference.READ = READ;
Reference.WRITE = WRITE;
Reference.RW = RW;

class Variable {
    constructor(name, scope) {
        this.name = name;
        this.identifiers = [];
        this.references = [];
        this.defs = [];
        this.tainted = false;
        this.stack = true;
        this.scope = scope;
    }
}

Variable.CatchClause = "CatchClause";
Variable.Parameter = "Parameter";
Variable.FunctionName = "FunctionName";
Variable.ClassName = "ClassName";
Variable.Variable = "Variable";
Variable.ImportBinding = "ImportBinding";
Variable.ImplicitGlobalVariable = "ImplicitGlobalVariable";

class Definition {
    constructor(type, name, node, parent, index, kind) {
        this.type = type;
        this.name = name;
        this.node = node;
        this.parent = parent;
        this.index = index;
        this.kind = kind;
    }
}

class ParameterDefinition extends Definition {
    constructor(name, node, index, rest) {
        super(Variable.Parameter, name, node, null, index, null);
        this.rest = rest;
    }
}

const { Syntax: Syntax$2 } = estraverse;

function isStrictScope(scope, block, isMethodDefinition) {
    let body;
    if (scope.upper && scope.upper.isStrict) {
        return true;
    }
    if (isMethodDefinition) {
        return true;
    }
    if (scope.type === "class" || scope.type === "module") {
        return true;
    }
    if (scope.type === "block" || scope.type === "switch") {
        return false;
    }
    if (scope.type === "function") {
        if (block.type === Syntax$2.ArrowFunctionExpression && block.body.type !== Syntax$2.BlockStatement) {
            return false;
        }
        if (block.type === Syntax$2.Program) {
            body = block;
        } else {
            body = block.body;
        }
        if (!body) {
            return false;
        }
    } else if (scope.type === "global") {
        body = block;
    } else {
        return false;
    }
    for (let i = 0, iz = body.body.length; i < iz; ++i) {
        const stmt = body.body[i];
        if (typeof stmt.directive !== "string") {
            break;
        }
        if (stmt.directive === "use strict") {
            return true;
        }
    }
    return false;
}

function registerScope(scopeManager, scope) {
    scopeManager.scopes.push(scope);

    const scopes = scopeManager.__nodeToScope.get(scope.block);

    if (scopes) {
        scopes.push(scope);
    } else {
        scopeManager.__nodeToScope.set(scope.block, [scope]);
    }
}

function shouldBeStatically(def) {
    return (
        (def.type === Variable.ClassName) ||
        (def.type === Variable.Variable && def.parent.kind !== "var")
    );
}

class Scope {
    constructor(scopeManager, type, upperScope, block, isMethodDefinition) {
        this.type = type;
        this.set = new Map();
        this.taints = new Map();
        this.dynamic = this.type === "global" || this.type === "with";
        this.block = block;
        this.through = [];
        this.variables = [];
        this.references = [];
        this.variableScope =
            this.type === "global" ||
            this.type === "module" ||
            this.type === "function" ||
            this.type === "class-field-initializer" ||
            this.type === "class-static-block"
                ? this
                : upperScope.variableScope;
        this.functionExpressionScope = false;
        this.directCallToEvalScope = false;
        this.thisFound = false;
        this.__left = [];
        this.upper = upperScope;
        this.isStrict = scopeManager.isStrictModeSupported()
            ? isStrictScope(this, block, isMethodDefinition)
            : false;
        this.childScopes = [];
        if (this.upper) {
            this.upper.childScopes.push(this);
        }
        this.__declaredVariables = scopeManager.__declaredVariables;
        registerScope(scopeManager, this);
    }

    __shouldStaticallyClose(scopeManager) {
        return (!this.dynamic || scopeManager.__isOptimistic());
    }

    __shouldStaticallyCloseForGlobal(ref) {
        const name = ref.identifier.name;
        if (!this.set.has(name)) {
            return false;
        }
        const variable = this.set.get(name);
        const defs = variable.defs;
        return defs.length > 0 && defs.every(shouldBeStatically);
    }

    __staticCloseRef(ref) {
        if (!this.__resolve(ref)) {
            this.__delegateToUpperScope(ref);
        }
    }

    __dynamicCloseRef(ref) {
        let current = this;
        do {
            current.through.push(ref);
            current = current.upper;
        } while (current);
    }

    __globalCloseRef(ref) {
        if (this.__shouldStaticallyCloseForGlobal(ref)) {
            this.__staticCloseRef(ref);
        } else {
            this.__dynamicCloseRef(ref);
        }
    }

    __close(scopeManager) {
        let closeRef;
        if (this.__shouldStaticallyClose(scopeManager)) {
            closeRef = this.__staticCloseRef;
        } else if (this.type !== "global") {
            closeRef = this.__dynamicCloseRef;
        } else {
            closeRef = this.__globalCloseRef;
        }
        for (let i = 0, iz = this.__left.length; i < iz; ++i) {
            const ref = this.__left[i];
            closeRef.call(this, ref);
        }
        this.__left = null;
        return this.upper;
    }

    __isValidResolution(ref, variable) {
        return true;
    }

    __resolve(ref) {
        const name = ref.identifier.name;
        if (!this.set.has(name)) {
            return false;
        }
        const variable = this.set.get(name);
        if (!this.__isValidResolution(ref, variable)) {
            return false;
        }
        variable.references.push(ref);
        variable.stack = variable.stack && ref.from.variableScope === this.variableScope;
        if (ref.tainted) {
            variable.tainted = true;
            this.taints.set(variable.name, true);
        }
        ref.resolved = variable;
        return true;
    }

    __delegateToUpperScope(ref) {
        if (this.upper) {
            this.upper.__left.push(ref);
        }
        this.through.push(ref);
    }

    __addDeclaredVariablesOfNode(variable, node) {
        if (node === null || node === void 0) {
            return;
        }
        let variables = this.__declaredVariables.get(node);
        if (variables === null || variables === void 0) {
            variables = [];
            this.__declaredVariables.set(node, variables);
        }
        if (!variables.includes(variable)) {
            variables.push(variable);
        }
    }

    __defineGeneric(name, set, variables, node, def) {
        let variable = set.get(name);
        if (!variable) {
            variable = new Variable(name, this);
            set.set(name, variable);
            variables.push(variable);
        }
        if (def) {
            variable.defs.push(def);
            this.__addDeclaredVariablesOfNode(variable, def.node);
            this.__addDeclaredVariablesOfNode(variable, def.parent);
        }
        if (node) {
            variable.identifiers.push(node);
        }
    }

    __define(node, def) {
        if (node && node.type === Syntax$2.Identifier) {
            this.__defineGeneric(
                node.name,
                this.set,
                this.variables,
                node,
                def
            );
        }
    }

    __referencing(node, assign, writeExpr, maybeImplicitGlobal, partial, init) {
        if (!node || node.type !== Syntax$2.Identifier) {
            return;
        }
        if (node.name === "super") {
            return;
        }
        const ref = new Reference(node, this, assign || Reference.READ, writeExpr, maybeImplicitGlobal, !!partial, !!init);
        this.references.push(ref);
        this.__left.push(ref);
    }

    __detectEval() {
        let current = this;
        this.directCallToEvalScope = true;
        do {
            current.dynamic = true;
            current = current.upper;
        } while (current);
    }

    __detectThis() {
        this.thisFound = true;
    }

    __isClosed() {
        return this.__left === null;
    }

    resolve(ident) {
        let ref, i, iz;
        assert(this.__isClosed(), "Scope should be closed.");
        assert(ident.type === Syntax$2.Identifier, "Target should be identifier.");
        for (i = 0, iz = this.references.length; i < iz; ++i) {
            ref = this.references[i];
            if (ref.identifier === ident) {
                return ref;
            }
        }
        return null;
    }

    isStatic() {
        return !this.dynamic;
    }

    isArgumentsMaterialized() {
        return true;
    }

    isThisMaterialized() {
        return true;
    }

    isUsedName(name) {
        if (this.set.has(name)) {
            return true;
        }
        for (let i = 0, iz = this.through.length; i < iz; ++i) {
            if (this.through[i].identifier.name === name) {
                return true;
            }
        }
        return false;
    }
}

class GlobalScope extends Scope {
    constructor(scopeManager, block) {
        super(scopeManager, "global", null, block, false);
        this.implicit = {
            set: new Map(),
            variables: [],
            left: []
        };
    }

    __close(scopeManager) {
        const implicit = [];
        for (let i = 0, iz = this.__left.length; i < iz; ++i) {
            const ref = this.__left[i];
            if (ref.__maybeImplicitGlobal && !this.set.has(ref.identifier.name)) {
                implicit.push(ref.__maybeImplicitGlobal);
            }
        }
        for (let i = 0, iz = implicit.length; i < iz; ++i) {
            const info = implicit[i];
            this.__defineImplicit(info.pattern,
                new Definition(
                    Variable.ImplicitGlobalVariable,
                    info.pattern,
                    info.node,
                    null,
                    null,
                    null
                ));
        }
        this.implicit.left = this.__left;
        return super.__close(scopeManager);
    }

    __defineImplicit(node, def) {
        if (node && node.type === Syntax$2.Identifier) {
            this.__defineGeneric(
                node.name,
                this.implicit.set,
                this.implicit.variables,
                node,
                def
            );
        }
    }
}

class ModuleScope extends Scope {
    constructor(scopeManager, upperScope, block) {
        super(scopeManager, "module", upperScope, block, false);
    }
}

class FunctionExpressionNameScope extends Scope {
    constructor(scopeManager, upperScope, block) {
        super(scopeManager, "function-expression-name", upperScope, block, false);
        this.__define(block.id,
            new Definition(
                Variable.FunctionName,
                block.id,
                block,
                null,
                null,
                null
            ));
        this.functionExpressionScope = true;
    }
}

class CatchScope extends Scope {
    constructor(scopeManager, upperScope, block) {
        super(scopeManager, "catch", upperScope, block, false);
    }
}

class WithScope extends Scope {
    constructor(scopeManager, upperScope, block) {
        super(scopeManager, "with", upperScope, block, false);
    }

    __close(scopeManager) {
        if (this.__shouldStaticallyClose(scopeManager)) {
            return super.__close(scopeManager);
        }
        for (let i = 0, iz = this.__left.length; i < iz; ++i) {
            const ref = this.__left[i];
            ref.tainted = true;
            this.__delegateToUpperScope(ref);
        }
        this.__left = null;
        return this.upper;
    }
}

class BlockScope extends Scope {
    constructor(scopeManager, upperScope, block) {
        super(scopeManager, "block", upperScope, block, false);
    }
}

class SwitchScope extends Scope {
    constructor(scopeManager, upperScope, block) {
        super(scopeManager, "switch", upperScope, block, false);
    }
}

class FunctionScope extends Scope {
    constructor(scopeManager, upperScope, block, isMethodDefinition) {
        super(scopeManager, "function", upperScope, block, isMethodDefinition);
        if (this.block.type !== Syntax$2.ArrowFunctionExpression) {
            this.__defineArguments();
        }
    }

    isArgumentsMaterialized() {
        if (this.block.type === Syntax$2.ArrowFunctionExpression) {
            return false;
        }
        if (!this.isStatic()) {
            return true;
        }
        const variable = this.set.get("arguments");
        assert(variable, "Always have arguments variable.");
        return variable.tainted || variable.references.length !== 0;
    }

    isThisMaterialized() {
        if (!this.isStatic()) {
            return true;
        }
        return this.thisFound;
    }

    __defineArguments() {
        this.__defineGeneric(
            "arguments",
            this.set,
            this.variables,
            null,
            null
        );
        this.taints.set("arguments", true);
    }

    __isValidResolution(ref, variable) {
        if (this.block.type === "Program") {
            return true;
        }
        const bodyStart = this.block.body.range[0];
        return !(
            variable.scope === this &&
            ref.identifier.range[0] < bodyStart &&
            variable.defs.every(d => d.name.range[0] >= bodyStart)
        );
    }
}

class ForScope extends Scope {
    constructor(scopeManager, upperScope, block) {
        super(scopeManager, "for", upperScope, block, false);
    }
}

class ClassScope extends Scope {
    constructor(scopeManager, upperScope, block) {
        super(scopeManager, "class", upperScope, block, false);
    }
}

class ClassFieldInitializerScope extends Scope {
    constructor(scopeManager, upperScope, block) {
        super(scopeManager, "class-field-initializer", upperScope, block, true);
    }
}

class ClassStaticBlockScope extends Scope {
    constructor(scopeManager, upperScope, block) {
        super(scopeManager, "class-static-block", upperScope, block, true);
    }
}

class ScopeManager {
    constructor(options) {
        this.scopes = [];
        this.globalScope = null;
        this.__nodeToScope = new WeakMap();
        this.__currentScope = null;
        this.__options = options;
        this.__declaredVariables = new WeakMap();
    }

    __isOptimistic() {
        return this.__options.optimistic;
    }

    __ignoreEval() {
        return this.__options.ignoreEval;
    }

    isGlobalReturn() {
        return this.__options.nodejsScope || this.__options.sourceType === "commonjs";
    }

    isModule() {
        return this.__options.sourceType === "module";
    }

    isImpliedStrict() {
        return this.__options.impliedStrict;
    }

    isStrictModeSupported() {
        return this.__options.ecmaVersion >= 5;
    }

    __get(node) {
        return this.__nodeToScope.get(node);
    }

    getDeclaredVariables(node) {
        return this.__declaredVariables.get(node) || [];
    }

    acquire(node, inner) {
        function predicate(testScope) {
            if (testScope.type === "function" && testScope.functionExpressionScope) {
                return false;
            }
            return true;
        }

        const scopes = this.__get(node);

        if (!scopes || scopes.length === 0) {
            return null;
        }
        if (scopes.length === 1) {
            return scopes[0];
        }

        if (inner) {
            for (let i = scopes.length - 1; i >= 0; --i) {
                const scope = scopes[i];
                if (predicate(scope)) {
                    return scope;
                }
            }
        } else {
            for (let i = 0, iz = scopes.length; i < iz; ++i) {
                const scope = scopes[i];
                if (predicate(scope)) {
                    return scope;
                }
            }
        }

        return null;
    }

    acquireAll(node) {
        return this.__get(node);
    }

    release(node, inner) {
        const scopes = this.__get(node);

        if (scopes && scopes.length) {
            const scope = scopes[0].upper;

            if (!scope) {
                return null;
            }
            return this.acquire(scope.block, inner);
        }
        return null;
    }

    attach() { }

    detach() { }

    __nestScope(scope) {
        if (scope instanceof GlobalScope) {
            assert(this.__currentScope === null);
            this.globalScope = scope;
        }
        this.__currentScope = scope;
        return scope;
    }

    __nestGlobalScope(node) {
        return this.__nestScope(new GlobalScope(this, node));
    }

    __nestBlockScope(node) {
        return this.__nestScope(new BlockScope(this, this.__currentScope, node));
    }

    __nestFunctionScope(node, isMethodDefinition) {
        return this.__nestScope(new FunctionScope(this, this.__currentScope, node, isMethodDefinition));
    }

    __nestForScope(node) {
        return this.__nestScope(new ForScope(this, this.__currentScope, node));
    }

    __nestCatchScope(node) {
        return this.__nestScope(new CatchScope(this, this.__currentScope, node));
    }

    __nestWithScope(node) {
        return this.__nestScope(new WithScope(this, this.__currentScope, node));
    }

    __nestClassScope(node) {
        return this.__nestScope(new ClassScope(this, this.__currentScope, node));
    }

    __nestClassFieldInitializerScope(node) {
        return this.__nestScope(new ClassFieldInitializerScope(this, this.__currentScope, node));
    }

    __nestClassStaticBlockScope(node) {
        return this.__nestScope(new ClassStaticBlockScope(this, this.__currentScope, node));
    }

    __nestSwitchScope(node) {
        return this.__nestScope(new SwitchScope(this, this.__currentScope, node));
    }

    __nestModuleScope(node) {
        return this.__nestScope(new ModuleScope(this, this.__currentScope, node));
    }

    __nestFunctionExpressionNameScope(node) {
        return this.__nestScope(new FunctionExpressionNameScope(this, this.__currentScope, node));
    }

    __isES6() {
        return this.__options.ecmaVersion >= 6;
    }
}

const { Syntax: Syntax$1 } = estraverse;

function getLast(xs) {
    return xs.at(-1) || null;
}

class PatternVisitor extends esrecurse.Visitor {
    static isPattern(node) {
        const nodeType = node.type;
        return (
            nodeType === Syntax$1.Identifier ||
            nodeType === Syntax$1.ObjectPattern ||
            nodeType === Syntax$1.ArrayPattern ||
            nodeType === Syntax$1.SpreadElement ||
            nodeType === Syntax$1.RestElement ||
            nodeType === Syntax$1.AssignmentPattern
        );
    }

    constructor(options, rootPattern, callback) {
        super(null, options);
        this.rootPattern = rootPattern;
        this.callback = callback;
        this.assignments = [];
        this.rightHandNodes = [];
        this.restElements = [];
    }

    Identifier(pattern) {
        const lastRestElement = getLast(this.restElements);
        this.callback(pattern, {
            topLevel: pattern === this.rootPattern,
            rest: lastRestElement !== null && lastRestElement !== void 0 && lastRestElement.argument === pattern,
            assignments: this.assignments
        });
    }

    Property(property) {
        if (property.computed) {
            this.rightHandNodes.push(property.key);
        }
        this.visit(property.value);
    }

    ArrayPattern(pattern) {
        for (let i = 0, iz = pattern.elements.length; i < iz; ++i) {
            const element = pattern.elements[i];
            this.visit(element);
        }
    }

    AssignmentPattern(pattern) {
        this.assignments.push(pattern);
        this.visit(pattern.left);
        this.rightHandNodes.push(pattern.right);
        this.assignments.pop();
    }

    RestElement(pattern) {
        this.restElements.push(pattern);
        this.visit(pattern.argument);
        this.restElements.pop();
    }

    MemberExpression(node) {
        if (node.computed) {
            this.rightHandNodes.push(node.property);
        }
        this.rightHandNodes.push(node.object);
    }

    SpreadElement(node) {
        this.visit(node.argument);
    }

    ArrayExpression(node) {
        node.elements.forEach(this.visit, this);
    }

    AssignmentExpression(node) {
        this.assignments.push(node);
        this.visit(node.left);
        this.rightHandNodes.push(node.right);
        this.assignments.pop();
    }

    CallExpression(node) {
        node.arguments.forEach(a => {
            this.rightHandNodes.push(a);
        });
        this.visit(node.callee);
    }
}

function traverseIdentifierInPattern(options, rootPattern, referencer, callback) {
    const visitor = new PatternVisitor(options, rootPattern, callback);
    visitor.visit(rootPattern);
    if (referencer !== null && referencer !== void 0) {
        visitor.rightHandNodes.forEach(referencer.visit, referencer);
    }
}

class Importer extends esrecurse.Visitor {
    constructor(declaration, referencer) {
        super(null, referencer.options);
        this.declaration = declaration;
        this.referencer = referencer;
    }

    visitImport(id, specifier) {
        this.referencer.visitPattern(id, pattern => {
            this.referencer.currentScope().__define(pattern,
                new Definition(
                    Variable.ImportBinding,
                    pattern,
                    specifier,
                    this.declaration,
                    null,
                    null
                ));
        });
    }

    ImportNamespaceSpecifier(node) {
        const local = (node.local || node.id);
        if (local) {
            this.visitImport(local, node);
        }
    }

    ImportDefaultSpecifier(node) {
        const local = (node.local || node.id);
        this.visitImport(local, node);
    }

    ImportSpecifier(node) {
        const local = (node.local || node.id);
        if (node.name) {
            this.visitImport(node.name, node);
        } else {
            this.visitImport(local, node);
        }
    }
}

class Referencer extends esrecurse.Visitor {
    constructor(options, scopeManager) {
        super(null, options);
        this.options = options;
        this.scopeManager = scopeManager;
        this.parent = null;
        this.isInnerMethodDefinition = false;
    }

    currentScope() {
        return this.scopeManager.__currentScope;
    }

    close(node) {
        while (this.currentScope() && node === this.currentScope().block) {
            this.scopeManager.__currentScope = this.currentScope().__close(this.scopeManager);
        }
    }

    pushInnerMethodDefinition(isInnerMethodDefinition) {
        const previous = this.isInnerMethodDefinition;
        this.isInnerMethodDefinition = isInnerMethodDefinition;
        return previous;
    }

    popInnerMethodDefinition(isInnerMethodDefinition) {
        this.isInnerMethodDefinition = isInnerMethodDefinition;
    }

    referencingDefaultValue(pattern, assignments, maybeImplicitGlobal, init) {
        const scope = this.currentScope();
        assignments.forEach(assignment => {
            scope.__referencing(
                pattern,
                Reference.WRITE,
                assignment.right,
                maybeImplicitGlobal,
                pattern !== assignment.left,
                init
            );
        });
    }

    visitPattern(node, options, callback) {
        let visitPatternOptions = options;
        let visitPatternCallback = callback;
        if (typeof options === "function") {
            visitPatternCallback = options;
            visitPatternOptions = { processRightHandNodes: false };
        }
        traverseIdentifierInPattern(
            this.options,
            node,
            visitPatternOptions.processRightHandNodes ? this : null,
            visitPatternCallback
        );
    }

    visitFunction(node) {
        let i, iz;
        if (node.type === Syntax.FunctionDeclaration) {
            this.currentScope().__define(node.id,
                new Definition(
                    Variable.FunctionName,
                    node.id,
                    node,
                    null,
                    null,
                    null
                ));
        }
        if (node.type === Syntax.FunctionExpression && node.id) {
            this.scopeManager.__nestFunctionExpressionNameScope(node);
        }
        this.scopeManager.__nestFunctionScope(node, this.isInnerMethodDefinition);
        const that = this;

        function visitPatternCallback(pattern, info) {
            that.currentScope().__define(pattern,
                new ParameterDefinition(
                    pattern,
                    node,
                    i,
                    info.rest
                ));
            that.referencingDefaultValue(pattern, info.assignments, null, true);
        }

        for (i = 0, iz = node.params.length; i < iz; ++i) {
            this.visitPattern(node.params[i], { processRightHandNodes: true }, visitPatternCallback);
        }
        if (node.rest) {
            this.visitPattern({
                type: "RestElement",
                argument: node.rest
            }, pattern => {
                this.currentScope().__define(pattern,
                    new ParameterDefinition(
                        pattern,
                        node,
                        node.params.length,
                        true
                    ));
            });
        }
        if (node.body) {
            if (node.body.type === Syntax.BlockStatement) {
                this.visitChildren(node.body);
            } else {
                this.visit(node.body);
            }
        }
        this.close(node);
    }

    visitClass(node) {
        if (node.type === Syntax.ClassDeclaration) {
            this.currentScope().__define(node.id,
                new Definition(
                    Variable.ClassName,
                    node.id,
                    node,
                    null,
                    null,
                    null
                ));
        }

        this.scopeManager.__nestClassScope(node);

        if (node.id) {
            this.currentScope().__define(node.id,
                new Definition(
                    Variable.ClassName,
                    node.id,
                    node
                ));
        }

        this.visit(node.superClass);
        this.visit(node.body);

        this.close(node);
    }

    visitProperty(node) {
        let previous;
        if (node.computed) {
            this.visit(node.key);
        }
        const isMethodDefinition = node.type === Syntax.MethodDefinition;
        if (isMethodDefinition) {
            previous = this.pushInnerMethodDefinition(true);
        }
        this.visit(node.value);
        if (isMethodDefinition) {
            this.popInnerMethodDefinition(previous);
        }
    }

    visitForIn(node) {
        if (node.left.type === Syntax.VariableDeclaration && node.left.kind !== "var") {
            this.scopeManager.__nestForScope(node);
        }

        if (node.left.type === Syntax.VariableDeclaration) {
            this.visit(node.left);
            this.visitPattern(node.left.declarations[0].id, pattern => {
                this.currentScope().__referencing(pattern, Reference.WRITE, node.right, null, true, true);
            });
        } else {
            this.visitPattern(node.left, { processRightHandNodes: true }, (pattern, info) => {
                let maybeImplicitGlobal = null;

                if (!this.currentScope().isStrict) {
                    maybeImplicitGlobal = {
                        pattern,
                        node
                    };
                }
                this.referencingDefaultValue(pattern, info.assignments, maybeImplicitGlobal, false);
                this.currentScope().__referencing(pattern, Reference.WRITE, node.right, maybeImplicitGlobal, true, false);
            });
        }
        this.visit(node.right);
        this.visit(node.body);

        this.close(node);
    }

    visitVariableDeclaration(variableTargetScope, type, node, index) {
        const decl = node.declarations[index];
        const init = decl.init;

        this.visitPattern(decl.id, { processRightHandNodes: true }, (pattern, info) => {
            variableTargetScope.__define(
                pattern,
                new Definition(
                    type,
                    pattern,
                    decl,
                    node,
                    index,
                    node.kind
                )
            );

            this.referencingDefaultValue(pattern, info.assignments, null, true);
            if (init) {
                this.currentScope().__referencing(pattern, Reference.WRITE, init, null, !info.topLevel, true);
            }
        });
    }

    AssignmentExpression(node) {
        if (PatternVisitor.isPattern(node.left)) {
            if (node.operator === "=") {
                this.visitPattern(node.left, { processRightHandNodes: true }, (pattern, info) => {
                    let maybeImplicitGlobal = null;
                    if (!this.currentScope().isStrict) {
                        maybeImplicitGlobal = {
                            pattern,
                            node
                        };
                    }
                    this.referencingDefaultValue(pattern, info.assignments, maybeImplicitGlobal, false);
                    this.currentScope().__referencing(pattern, Reference.WRITE, node.right, maybeImplicitGlobal, !info.topLevel, false);
                });
            } else {
                this.currentScope().__referencing(node.left, Reference.RW, node.right);
            }
        } else {
            this.visit(node.left);
        }
        this.visit(node.right);
    }

    CatchClause(node) {
        this.scopeManager.__nestCatchScope(node);

        this.visitPattern(node.param, { processRightHandNodes: true }, (pattern, info) => {
            this.currentScope().__define(pattern,
                new Definition(
                    Variable.CatchClause,
                    pattern,
                    node,
                    null,
                    null,
                    null
                ));
            this.referencingDefaultValue(pattern, info.assignments, null, true);
        });
        this.visit(node.body);

        this.close(node);
    }

    Program(node) {
        this.scopeManager.__nestGlobalScope(node);

        if (this.scopeManager.isGlobalReturn()) {
            this.currentScope().isStrict = false;
            this.scopeManager.__nestFunctionScope(node, false);
        }

        if (this.scopeManager.__isES6() && this.scopeManager.isModule()) {
            this.scopeManager.__nestModuleScope(node);
        }

        if (this.scopeManager.isStrictModeSupported() && this.scopeManager.isImpliedStrict()) {
            this.currentScope().isStrict = true;
        }

        this.visitChildren(node);
        this.close(node);
    }

    Identifier(node) {
        this.currentScope().__referencing(node);
    }

    PrivateIdentifier() {}

    UpdateExpression(node) {
        if (PatternVisitor.isPattern(node.argument)) {
            this.currentScope().__referencing(node.argument, Reference.RW, null);
        } else {
            this.visitChildren(node);
        }
    }

    MemberExpression(node) {
        this.visit(node.object);
        if (node.computed) {
            this.visit(node.property);
        }
    }

    Property(node) {
        this.visitProperty(node);
    }

    PropertyDefinition(node) {
        const { computed, key, value } = node;
        if (computed) {
            this.visit(key);
        }
        if (value) {
            this.scopeManager.__nestClassFieldInitializerScope(value);
            this.visit(value);
            this.close(value);
        }
    }

    StaticBlock(node) {
        this.scopeManager.__nestClassStaticBlockScope(node);
        this.visitChildren(node);
        this.close(node);
    }

    MethodDefinition(node) {
        this.visitProperty(node);
    }

    BreakStatement() {}

    ContinueStatement() {}

    LabeledStatement(node) {
        this.visit(node.body);
    }

    ForStatement(node) {
        if (node.init && node.init.type === Syntax.VariableDeclaration && node.init.kind !== "var") {
            this.scopeManager.__nestForScope(node);
        }
        this.visitChildren(node);
        this.close(node);
    }

    ClassExpression(node) {
        this.visitClass(node);
    }

    ClassDeclaration(node) {
        this.visitClass(node);
    }

    CallExpression(node) {
        if (!this.scopeManager.__ignoreEval() && node.callee.type === Syntax.Identifier && node.callee.name === "eval") {
            this.currentScope().variableScope.__detectEval();
        }
        this.visitChildren(node);
    }

    BlockStatement(node) {
        if (this.scopeManager.__isES6()) {
            this.scopeManager.__nestBlockScope(node);
        }

        this.visitChildren(node);

        this.close(node);
    }

    ThisExpression() {
        this.currentScope().variableScope.__detectThis();
    }

    WithStatement(node) {
        this.visit(node.object);
        this.scopeManager.__nestWithScope(node);
        this.visit(node.body);
        this.close(node);
    }

    VariableDeclaration(node) {
        const variableTargetScope = (node.kind === "var") ? this.currentScope().variableScope : this.currentScope();
        for (let i = 0, iz = node.declarations.length; i < iz; ++i) {
            const decl = node.declarations[i];
            this.visitVariableDeclaration(variableTargetScope, Variable.Variable, node, i);
            if (decl.init) {
                this.visit(decl.init);
            }
        }
    }

    SwitchStatement(node) {
        this.visit(node.discriminant);
        if (this.scopeManager.__isES6()) {
            this.scopeManager.__nestSwitchScope(node);
        }
        for (let i = 0, iz = node.cases.length; i < iz; ++i) {
            this.visit(node.cases[i]);
        }
        this.close(node);
    }

    FunctionDeclaration(node) {
        this.visitFunction(node);
    }

    FunctionExpression(node) {
        this.visitFunction(node);
    }

    ForOfStatement(node) {
        this.visitForIn(node);
    }

    ForInStatement(node) {
        this.visitForIn(node);
    }

    ArrowFunctionExpression(node) {
        this.visitFunction(node);
    }

    ImportDeclaration(node) {
        assert(this.scopeManager.__isES6() && this.scopeManager.isModule(), "ImportDeclaration should appear when the mode is ES6 and in the module context.");
        const importer = new Importer(node, this);
        importer.visit(node);
    }

    visitExportDeclaration(node) {
        if (node.source) {
            return;
        }
        if (node.declaration) {
            this.visit(node.declaration);
            return;
        }
        this.visitChildren(node);
    }

    ExportDeclaration(node) {
        this.visitExportDeclaration(node);
    }

    ExportAllDeclaration(node) {
        this.visitExportDeclaration(node);
    }

    ExportDefaultDeclaration(node) {
        this.visitExportDeclaration(node);
    }

    ExportNamedDeclaration(node) {
        this.visitExportDeclaration(node);
    }

    ExportSpecifier(node) {
        const local = (node.id || node.local);
        this.visit(local);
    }

    MetaProperty() {}
}

const version = "8.1.0";

function defaultOptions() {
    return {
        optimistic: false,
        nodejsScope: false,
        impliedStrict: false,
        sourceType: "script",
        ecmaVersion: 5,
        childVisitorKeys: null,
        fallback: "iteration"
    };
}

function updateDeeply(target, override) {
    function isHashObject(value) {
        return typeof value === "object" && value instanceof Object && !(value instanceof Array) && !(value instanceof RegExp);
    }
    for (const key in override) {
        if (Object.hasOwn(override, key)) {
            const val = override[key];
            if (isHashObject(val)) {
                if (isHashObject(target[key])) {
                    updateDeeply(target[key], val);
                } else {
                    target[key] = updateDeeply({}, val);
                }
            } else {
                target[key] = val;
            }
        }
    }
    return target;
}

function analyze(tree, providedOptions) {
    const options = updateDeeply(defaultOptions(), providedOptions);
    const scopeManager = new ScopeManager(options);
    const referencer = new Referencer(options, scopeManager);
    referencer.visit(tree);
    assert(scopeManager.__currentScope === null, "currentScope should be null.");
    return scopeManager;
}

exports.Definition = Definition;
exports.PatternVisitor = PatternVisitor;
exports.Reference = Reference;
exports.Referencer = Referencer;
exports.Scope = Scope;
exports.ScopeManager = ScopeManager;
exports.Variable = Variable;
exports.analyze = analyze;
exports.version = version;
