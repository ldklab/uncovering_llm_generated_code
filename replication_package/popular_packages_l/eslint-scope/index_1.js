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
    const newScope = { node, upper: this.currentScope };
    this.scopes.push(newScope);
    this.currentScope = newScope;
  }

  leaveScope() {
    if (this.currentScope) {
      this.currentScope = this.currentScope.upper;
    }
  }

  analyze(ast) {
    const traverseNode = (node) => {
      this.enterScope(node);
      
      for (let key in node) {
        if (node[key] && typeof node[key] === 'object') {
          traverseNode(node[key]);
        }
      }
      
      this.leaveScope();
    };

    traverseNode(ast);
    return this;
  }
}

function analyze(ast, options = {}) {
  const scopeManager = new ScopeManager(options);
  return scopeManager.analyze(ast);
}

module.exports = { analyze };
```