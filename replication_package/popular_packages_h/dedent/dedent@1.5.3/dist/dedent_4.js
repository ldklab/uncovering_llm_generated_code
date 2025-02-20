"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const dedent = createDedent({});
var _default = exports.default = dedent;

function createDedent(options) {
  dedent.withOptions = newOptions => createDedent({...options, ...newOptions});
  return dedent;

  function dedent(strings, ...values) {
    const raw = typeof strings === "string" ? [strings] : strings.raw;
    const { escapeSpecialCharacters = Array.isArray(strings) } = options;

    let result = "";
    for (let i = 0; i < raw.length; i++) {
      let next = raw[i];
      if (escapeSpecialCharacters) {
        next = next.replace(/\\\n[ \t]*/g, "")
                   .replace(/\\`/g, "`")
                   .replace(/\\\$/g, "$")
                   .replace(/\\\{/g, "{");
      }
      result += next;
      if (i < values.length) {
        result += values[i];
      }
    }

    const lines = result.split("\n");
    let mindent = null;
    for (const l of lines) {
      const m = l.match(/^(\s+)\S+/);
      if (m) {
        const indent = m[1].length;
        mindent = mindent === null ? indent : Math.min(mindent, indent);
      }
    }

    if (mindent !== null) {
      result = lines.map(l => l[0] === " " || l[0] === "\t" ? l.slice(mindent) : l).join("\n");
    }

    result = result.trim();
    if (escapeSpecialCharacters) {
      result = result.replace(/\\n/g, "\n");
    }
    return result;
  }
}

module.exports = exports.default;
module.exports.default = exports.default;
