// IIFE Module for AST Walking
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = global || self, factory(global.estreeWalker = {}));
}(this, (function (exports) { 'use strict';

	/** @typedef { import('estree').BaseNode} BaseNode */
	/** @typedef {{
		skip: () => void;
		remove: () => void;
		replace: (node: BaseNode) => void;
	}} WalkerContext */

	class WalkerBase {
		constructor() {
			this.should_skip = false;
			this.should_remove = false;
			this.replacement = null;

			this.context = {
				skip: () => { this.should_skip = true; },
				remove: () => { this.should_remove = true; },
				replace: (node) => { this.replacement = node; }
			};
		}

		replace(parent, prop, index, node) {
			if (parent) {
				index !== null ? parent[prop][index] = node : parent[prop] = node;
			}
		}

		remove(parent, prop, index) {
			if (parent) {
				index !== null ? parent[prop].splice(index, 1) : delete parent[prop];
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
			if (node && this.enter) {
				const { should_skip, should_remove, replacement } = this;
				this.should_skip = this.should_remove = false;
				this.replacement = null;

				this.enter.call(this.context, node, parent, prop, index);

				if (this.replacement) {
					node = this.replacement;
					this.replace(parent, prop, index, node);
				}
				if (this.should_remove) this.remove(parent, prop, index);

				const skipped_or_removed = this.should_skip || this.should_remove;
				Object.assign(this, { should_skip, should_remove, replacement });

				if (skipped_or_removed) return this.should_remove ? null : node;
			}

			for (const key in node) {
				const value = node[key];
				if (typeof value === 'object') {
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

			if (this.leave) {
				const _replacement = this.replacement;
				this.replacement = this.should_remove = false;

				this.leave.call(this.context, node, parent, prop, index);

				if (this.replacement) {
					node = this.replacement;
					this.replace(parent, prop, index, node);
				}
				if (this.should_remove) this.remove(parent, prop, index);

				const removed = this.should_remove;
				this.replacement = _replacement;

				return removed ? null : node;
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
			if (node && this.enter) {
				const { should_skip, should_remove, replacement } = this;
				this.should_skip = this.should_remove = false;
				this.replacement = null;

				await this.enter.call(this.context, node, parent, prop, index);

				if (this.replacement) {
					node = this.replacement;
					this.replace(parent, prop, index, node);
				}
				if (this.should_remove) this.remove(parent, prop, index);

				const skipped_or_removed = this.should_skip || this.should_remove;
				Object.assign(this, { should_skip, should_remove, replacement });

				if (skipped_or_removed) return this.should_remove ? null : node;
			}

			for (const key in node) {
				const value = node[key];
				if (typeof value === 'object') {
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

			if (this.leave) {
				const _replacement = this.replacement;
				this.replacement = this.should_remove = false;

				await this.leave.call(this.context, node, parent, prop, index);

				if (this.replacement) {
					node = this.replacement;
					this.replace(parent, prop, index, node);
				}
				if (this.should_remove) this.remove(parent, prop, index);

				const removed = this.should_remove;
				this.replacement = _replacement;

				return removed ? null : node;
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

	exports.asyncWalk = asyncWalk;
	exports.walk = walk;

	Object.defineProperty(exports, '__esModule', { value: true });

})));
