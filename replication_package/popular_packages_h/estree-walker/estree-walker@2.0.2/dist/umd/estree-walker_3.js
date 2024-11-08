(function(global, factory) {
    if (typeof exports === 'object' && typeof module !== 'undefined') {
        factory(exports);
    } else if (typeof define === 'function' && define.amd) {
        define(['exports'], factory);
    } else {
        global = global || self;
        factory(global.estreeWalker = {});
    }
}(this, (function(exports) {
    'use strict';

    class WalkerBase {
        constructor() {
            this.should_skip = false;
            this.should_remove = false;
            this.replacement = null;

            this.context = {
                skip: () => this.should_skip = true,
                remove: () => this.should_remove = true,
                replace: node => this.replacement = node
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

    class SyncWalker extends WalkerBase {
        constructor(enter, leave) {
            super();
            this.enter = enter;
            this.leave = leave;
        }

        visit(node, parent, prop, index) {
            if (!node) return node;

            if (this.enter) {
                const prevState = [this.should_skip, this.should_remove, this.replacement];
                this.should_skip = this.should_remove = false;
                this.replacement = null;

                this.enter.call(this.context, node, parent, prop, index);

                if (this.replacement) {
                    node = this.replacement;
                    this.replace(parent, prop, index, node);
                }

                if (this.should_remove) {
                    this.remove(parent, prop, index);
                }

                const [skipped, removed] = [this.should_skip, this.should_remove];
                [this.should_skip, this.should_remove, this.replacement] = prevState;

                if (skipped) return node;
                if (removed) return null;
            }

            for (const key in node) {
                const value = node[key];
                if (typeof value !== "object") continue;

                if (Array.isArray(value)) {
                    for (let i = 0; i < value.length; i++) {
                        if (value[i] && typeof value[i].type === 'string') {
                            if (!this.visit(value[i], node, key, i)) i--;
                        }
                    }
                } else if (value && typeof value.type === "string") {
                    this.visit(value, node, key, null);
                }
            }

            if (this.leave) {
                const prevState = [this.replacement, this.should_remove];
                this.replacement = null;
                this.should_remove = false;

                this.leave.call(this.context, node, parent, prop, index);

                if (this.replacement) {
                    node = this.replacement;
                    this.replace(parent, prop, index, node);
                }

                if (this.should_remove) {
                    this.remove(parent, prop, index);
                }

                const removed = this.should_remove;
                [this.replacement, this.should_remove] = prevState;

                if (removed) return null;
            }

            return node;
        }
    }

    class AsyncWalker extends WalkerBase {
        constructor(enter, leave) {
            super();
            this.enter = enter;
            this.leave = leave;
        }

        async visit(node, parent, prop, index) {
            if (!node) return node;

            if (this.enter) {
                const prevState = [this.should_skip, this.should_remove, this.replacement];
                this.should_skip = this.should_remove = false;
                this.replacement = null;

                await this.enter.call(this.context, node, parent, prop, index);

                if (this.replacement) {
                    node = this.replacement;
                    this.replace(parent, prop, index, node);
                }

                if (this.should_remove) {
                    this.remove(parent, prop, index);
                }

                const [skipped, removed] = [this.should_skip, this.should_remove];
                [this.should_skip, this.should_remove, this.replacement] = prevState;

                if (skipped) return node;
                if (removed) return null;
            }

            for (const key in node) {
                const value = node[key];
                if (typeof value !== "object") continue;

                if (Array.isArray(value)) {
                    for (let i = 0; i < value.length; i++) {
                        if (value[i] && typeof value[i].type === 'string') {
                            if (!(await this.visit(value[i], node, key, i))) i--;
                        }
                    }
                } else if (value && typeof value.type === "string") {
                    await this.visit(value, node, key, null);
                }
            }

            if (this.leave) {
                const prevState = [this.replacement, this.should_remove];
                this.replacement = null;
                this.should_remove = false;

                await this.leave.call(this.context, node, parent, prop, index);

                if (this.replacement) {
                    node = this.replacement;
                    this.replace(parent, prop, index, node);
                }

                if (this.should_remove) {
                    this.remove(parent, prop, index);
                }

                const removed = this.should_remove;
                [this.replacement, this.should_remove] = prevState;

                if (removed) return null;
            }

            return node;
        }
    }

    function walk(ast, { enter, leave }) {
        const instance = new SyncWalker(enter, leave);
        return instance.visit(ast, null);
    }

    async function asyncWalk(ast, { enter, leave }) {
        const instance = new AsyncWalker(enter, leave);
        return await instance.visit(ast, null);
    }

    exports.walk = walk;
    exports.asyncWalk = asyncWalk;

    Object.defineProperty(exports, '__esModule', { value: true });
})));
