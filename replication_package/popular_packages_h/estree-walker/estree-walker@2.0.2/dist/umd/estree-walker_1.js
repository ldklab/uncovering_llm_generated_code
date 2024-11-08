(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.estreeWalker = {}));
}(this, (function (exports) { 'use strict';

	class WalkerBase {
		constructor() {
			this.context = {
				skip: () => this.should_skip = true,
				remove: () => this.should_remove = true,
				replace: (node) => this.replacement = node,
			};
			this.resetState();
		}
		
		resetState() {
			this.should_skip = false;
			this.should_remove = false;
			this.replacement = null;
		}

		replaceNode(parent, prop, index, node) {
			if (parent) index != null ? parent[prop][index] = node : parent[prop] = node;
		}

		removeNode(parent, prop, index) {
			if (parent) index != null ? parent[prop].splice(index, 1) : delete parent[prop];
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

			if (this.enter) this.processHandlers(node, parent, prop, index, this.enter);

			if (!this.should_skip && node) {
				for (const key in node) {
					const value = node[key];
					if (Array.isArray(value)) {
						for (let i = 0; i < value.length; i++) {
							if (value[i] && typeof value[i].type === 'string') {
								if (!this.visit(value[i], node, key, i)) i--;
							}
						}
					} else if (value && typeof value.type === 'string') {
						this.visit(value, node, key, null);
					}
				}
			}

			if (this.leave) return this.processHandlers(node, parent, prop, index, this.leave);
			
			return node;
		}

		processHandlers(node, parent, prop, index, handler) {
			const originalState = { should_skip: this.should_skip, should_remove: this.should_remove, replacement: this.replacement };
			this.resetState();
			handler.call(this.context, node, parent, prop, index);

			if (this.replacement) {
				node = this.replacement;
				this.replaceNode(parent, prop, index, node);
			}

			if (this.should_remove) this.removeNode(parent, prop, index);

			Object.assign(this, originalState);
			return !this.should_remove ? node : null;
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

			if (this.enter) await this.processHandlers(node, parent, prop, index, this.enter);

			if (!this.should_skip && node) {
				for (const key in node) {
					const value = node[key];
					if (Array.isArray(value)) {
						for (let i = 0; i < value.length; i++) {
							if (value[i] && typeof value[i].type === 'string') {
								if (!(await this.visit(value[i], node, key, i))) i--;
							}
						}
					} else if (value && typeof value.type === 'string') {
						await this.visit(value, node, key, null);
					}
				}
			}

			if (this.leave) return await this.processHandlers(node, parent, prop, index, this.leave);

			return node;
		}

		async processHandlers(node, parent, prop, index, handler) {
			const originalState = { should_skip: this.should_skip, should_remove: this.should_remove, replacement: this.replacement };
			this.resetState();
			await handler.call(this.context, node, parent, prop, index);
			
			if (this.replacement) {
				node = this.replacement;
				this.replaceNode(parent, prop, index, node);
			}

			if (this.should_remove) this.removeNode(parent, prop, index);

			Object.assign(this, originalState);
			return !this.should_remove ? node : null;
		}
	}

	function walk(ast, { enter, leave } = {}) {
		const walker = new SyncWalker(enter, leave);
		return walker.visit(ast, null);
	}

	async function asyncWalk(ast, { enter, leave } = {}) {
		const walker = new AsyncWalker(enter, leave);
		return await walker.visit(ast, null);
	}

	exports.walk = walk;
	exports.asyncWalk = asyncWalk;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
