"use strict";

import { declare } from "@babel/helper-plugin-utils";
import { types as t } from "@babel/core";

export default declare((api, options) => {
  api.assertVersion(7);
  
  const { loose = false, useBuiltIns = false, allowArrayLike = false } = options;

  if (typeof loose !== "boolean") {
    throw new Error(`.loose must be a boolean or undefined`);
  }

  const arrayOnlySpread = loose;

  function getExtendsHelper(file) {
    return useBuiltIns 
      ? t.memberExpression(t.identifier("Object"), t.identifier("assign")) 
      : file.addHelper("extends");
  }

  class DestructuringTransformer {
    constructor(opts) {
      Object.assign(this, opts);
      this.arrays = {};
    }

    buildVariableAssignment(id, init) {
      const op = t.isMemberExpression(id) ? "=" : this.operator;
      const node = op 
        ? t.expressionStatement(t.assignmentExpression(op, id, t.cloneNode(init) || this.scope.buildUndefinedNode()))
        : t.variableDeclaration(this.kind, [t.variableDeclarator(id, t.cloneNode(init))]);
      node._blockHoist = this.blockHoist;
      return node;
    }

    // Additional methods omitted for brevity...

    push(id, init) {
      const clonedInit = t.cloneNode(init);
      if (t.isObjectPattern(id)) {
        this.pushObjectPattern(id, clonedInit);
      } else if (t.isArrayPattern(id)) {
        this.pushArrayPattern(id, clonedInit);
      } else if (t.isAssignmentPattern(id)) {
        this.pushAssignmentPattern(id, clonedInit);
      } else {
        this.nodes.push(this.buildVariableAssignment(id, clonedInit));
      }
    }
    
    init(pattern, ref) {
      if (!t.isArrayExpression(ref) && !t.isMemberExpression(ref)) {
        const memo = this.scope.maybeGenerateMemoised(ref, true);
        if (memo) {
          this.nodes.push(this.buildVariableDeclaration(memo, t.cloneNode(ref)));
          ref = memo;
        }
      }

      this.push(pattern, ref);
      return this.nodes;
    }
  }

  return {
    name: "transform-destructuring",
    visitor: {
      ExportNamedDeclaration(path) {
        const declaration = path.get("declaration");
        if (!declaration.isVariableDeclaration() || !variableDeclarationHasPattern(declaration.node)) {
          return;
        }
        
        const specifiers = Object.keys(path.getOuterBindingIdentifiers(path)).map(name =>
          t.exportSpecifier(t.identifier(name), t.identifier(name))
        );

        path.replaceWith(declaration.node);
        path.insertAfter(t.exportNamedDeclaration(null, specifiers));
      },

      ForXStatement(path) {
        const { node, scope } = path;
        const left = node.left;

        if (t.isPattern(left)) {
          const temp = scope.generateUidIdentifier("ref");
          node.left = t.variableDeclaration("var", [t.variableDeclarator(temp)]);
          path.ensureBlock();
          if (!node.body.body.length && path.isCompletionRecord()) {
            node.body.body.unshift(t.expressionStatement(scope.buildUndefinedNode()));
          }
          node.body.body.unshift(t.expressionStatement(t.assignmentExpression("=", left, temp)));
          return;
        }

        if (!t.isVariableDeclaration(left)) return;
        const pattern = left.declarations[0].id;
        if (!t.isPattern(pattern)) return;
        const key = scope.generateUidIdentifier("ref");

        node.left = t.variableDeclaration(left.kind, [t.variableDeclarator(key, null)]);

        const nodes = [];
        const destructuring = new DestructuringTransformer({
          kind: left.kind,
          scope,
          nodes,
          arrayOnlySpread,
          allowArrayLike,
          addHelper: name => this.addHelper(name)
        });
        
        destructuring.init(pattern, key);
        path.ensureBlock();
        path.get("body").unshiftContainer("body", nodes);
      },

      CatchClause({ node, scope }) {
        const pattern = node.param;
        if (!t.isPattern(pattern)) return;

        const ref = scope.generateUidIdentifier("ref");
        node.param = ref;

        const nodes = [];
        const destructuring = new DestructuringTransformer({
          kind: "let",
          scope,
          nodes,
          arrayOnlySpread,
          allowArrayLike,
          addHelper: name => this.addHelper(name)
        });

        destructuring.init(pattern, ref);
        node.body.body = nodes.concat(node.body.body);
      },

      AssignmentExpression(path) {
        const { node, scope } = path;
        if (!t.isPattern(node.left)) return;

        const nodes = [];
        const destructuring = new DestructuringTransformer({
          operator: node.operator,
          scope,
          nodes,
          arrayOnlySpread,
          allowArrayLike,
          addHelper: name => this.addHelper(name)
        });

        let ref;
        if (path.isCompletionRecord() || !path.parentPath.isExpressionStatement()) {
          ref = scope.generateUidIdentifierBasedOnNode(node.right, "ref");
          nodes.push(t.variableDeclaration("var", [t.variableDeclarator(ref, node.right)]));

          if (t.isArrayExpression(node.right)) {
            destructuring.arrays[ref.name] = true;
          }
        }

        destructuring.init(node.left, ref || node.right);

        if (ref) {
          if (path.parentPath.isArrowFunctionExpression()) {
            path.replaceWith(t.blockStatement([]));
            nodes.push(t.returnStatement(t.cloneNode(ref)));
          } else {
            nodes.push(t.expressionStatement(t.cloneNode(ref)));
          }
        }

        path.replaceWithMultiple(nodes);
        path.scope.crawl();
      },

      VariableDeclaration(path) {
        const { node, scope, parent } = path;
        if (t.isForXStatement(parent)) return;
        if (!parent || !path.container) return;
        if (!variableDeclarationHasPattern(node)) return;

        const nodes = [];
        let declar;

        for (let i = 0; i < node.declarations.length; i++) {
          declar = node.declarations[i];
          const patternId = declar.init;
          const pattern = declar.id;

          const destructuring = new DestructuringTransformer({
            blockHoist: node._blockHoist,
            nodes,
            scope,
            kind: node.kind,
            arrayOnlySpread,
            allowArrayLike,
            addHelper: name => this.addHelper(name)
          });

          if (t.isPattern(pattern)) {
            destructuring.init(pattern, patternId);
          } else {
            nodes.push(t.inherits(destructuring.buildVariableAssignment(declar.id, t.cloneNode(declar.init)), declar));
          }
        }

        for (const node of nodes) {
          node.kind = node.kind || nodeKind;
        }

        if (nodes.length === 1) {
          path.replaceWith(nodes[0]);
        } else {
          path.replaceWithMultiple(nodes);
        }
      }
    }
  };
});
