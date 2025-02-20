const { EventEmitter } = require('events');

class ScopeManager extends EventEmitter {
  constructor(options) {
    super();
    this.options = options;
    this.scopes = [];
    this.currentScope = null;
  }

  acquire(node) {
    return this.scopes.find(scope => scope.node === node) || null;
  }

  enterScope(node) {
    const scope = { node, upper: this.currentScope };
    this.scopes.push(scope);
    this.currentScope = scope;
  }

  leaveScope() {
    if (this.currentScope) {
      this.currentScope = this.currentScope.upper;
    }
  }

  analyze(ast) {
    const traverse = (node) => {
      this.enterScope(node);
      for (let key in node) {
        if (node[key] && typeof node[key] === 'object') {
          traverse(node[key]);
        }
      }
      this.leaveScope();
    };

    traverse(ast);
    return this;
  }
}

function analyze(ast, options = {}) {
  const manager = new ScopeManager(options);
  return manager.analyze(ast);
}

module.exports = { analyze };
```
