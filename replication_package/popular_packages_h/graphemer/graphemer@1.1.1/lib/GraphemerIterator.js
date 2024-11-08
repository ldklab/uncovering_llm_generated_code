"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Graphemer_1 = __importDefault(require("./Graphemer"));
/**
 * GraphemerIterator
 *
 * Takes a string and a "BreakHandler" method during initialisation
 * and creates an iterable object that returns individual graphemes.
 *
 * @param str {string}
 * @return GraphemerIterator
 */
class GraphemerIterator {
    constructor(str) {
        this._index = 0;
        this._str = str;
    }
    [Symbol.iterator]() {
        return this;
    }
    next() {
        let brk;
        if ((brk = Graphemer_1.default.nextBreak(this._str, this._index)) < this._str.length) {
            const value = this._str.slice(this._index, brk);
            this._index = brk;
            return { value: value, done: false };
        }
        if (this._index < this._str.length) {
            const value = this._str.slice(this._index);
            this._index = this._str.length;
            return { value: value, done: false };
        }
        return { value: undefined, done: true };
    }
}
exports.default = GraphemerIterator;
