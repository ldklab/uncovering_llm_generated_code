(function (root, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        root.estreeWalker = {};
        factory(root.estreeWalker);
    }
}(this, (function (exports) {
    'use strict';

    // Base class for a walker
    class WalkerBase {
        constructor() {
            this.should_skip = false;
            this.should_remove = false;
            this.replacement = null;
            this.context = {
                skip: () => (this.should_skip = true),
                remove: () => (this.should_remove = true),
                replace: (node) => (this.replacement = node)
            };
        }

        replace(parent, prop, index, node) {
            if (parent) {
                if (index !== null) {
                    parent[prop][index] = node;
                } else {
                    parent[prop] = node;
                }
            }
        }

        remove(parent, prop, index) {
            if (parent) {
                if (index !== null) {
                    parent[prop].splice(index, 1);
                } else {
                    delete parent[prop];
                }
            }
        }
    }

    // Synchronization-based walker
    class SyncWalker extends WalkerBase {
        constructor(enter, leave) {
            super();
            this.enter = enter;
            this.leave = leave;
        }

        visit(node, parent, prop, index) {
            if (!node) return node;
            
            if (this.enter) {
                this._applyHandler(this.enter, node, parent, prop, index);
            }

            for (const key in node) {
                const value = node[key];
                if (typeof value === "object") {
                    if (Array.isArray(value)) {
                        for (let i = 0; i < value.length; i++) {
                            if (value[i]?.type) {
                                if (!this.visit(value[i], node, key, i)) i--;
                            }
                        }
                    } else if (value?.type) {
                        this.visit(value, node, key, null);
                    }
                }
            }

            if (this.leave) {
                this._applyHandler(this.leave, node, parent, prop, index);
            }

            return this.should_remove ? null : node;
        }

        _applyHandler(handler, node, parent, prop, index) {
            const state = { should_skip: this.should_skip, should_remove: this.should_remove, replacement: this.replacement };
            this.should_skip = this.should_remove = false; this.replacement = null;

            handler.call(this.context, node, parent, prop, index);

            if (this.replacement) this.replace(parent, prop, index, this.replacement);
            if (this.should_remove) this.remove(parent, prop, index);

            Object.assign(this, state);
        }
    }

    // Asynchronous-based walker
    class AsyncWalker extends WalkerBase {
        constructor(enter, leave) {
            super();
            this.enter = enter;
            this.leave = leave;
        }

        async visit(node, parent, prop, index) {
            if (!node) return node;
            
            if (this.enter) {
                await this._applyHandlerAsync(this.enter, node, parent, prop, index);
            }

            for (const key in node) {
                const value = node[key];
                if (typeof value === "object") {
                    if (Array.isArray(value)) {
                        for (let i = 0; i < value.length; i++) {
                            if (value[i]?.type) {
                                if (!(await this.visit(value[i], node, key, i))) i--;
                            }
                        }
                    } else if (value?.type) {
                        await this.visit(value, node, key, null);
                    }
                }
            }

            if (this.leave) {
                await this._applyHandlerAsync(this.leave, node, parent, prop, index);
            }

            return this.should_remove ? null : node;
        }

        async _applyHandlerAsync(handler, node, parent, prop, index) {
            const state = { should_skip: this.should_skip, should_remove: this.should_remove, replacement: this.replacement };
            this.should_skip = this.should_remove = false; this.replacement = null;

            await handler.call(this.context, node, parent, prop, index);

            if (this.replacement) this.replace(parent, prop, index, this.replacement);
            if (this.should_remove) this.remove(parent, prop, index);

            Object.assign(this, state);
        }
    }

    // Exported functions
    function walk(ast, handlers) {
        const { enter, leave } = handlers;
        const walker = new SyncWalker(enter, leave);
        return walker.visit(ast, null);
    }

    async function asyncWalk(ast, handlers) {
        const { enter, leave } = handlers;
        const walker = new AsyncWalker(enter, leave);
        return await walker.visit(ast, null);
    }

    exports.walk = walk;
    exports.asyncWalk = asyncWalk;
    Object.defineProperty(exports, '__esModule', { value: true });

})));
