"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createDedent({});

function createDedent(options) {
  function dedent(strings, ...values) {
    const raw = typeof strings === "string" ? [strings] : strings.raw;
    const { escapeSpecialCharacters = Array.isArray(strings) } = options;
    let result = "";

    raw.forEach((string, i) => {
      let segment = escapeSpecialCharacters
        ? string.replace(/\\\n[ \t]*/g, "").replace(/\\`/g, "`").replace(/\\\$/g, "$").replace(/\\\{/g, "{")
        : string;

      result += segment;
      if (i < values.length) result += values[i];
    });

    const lines = result.split("\n");
    let mindent = null;

    lines.forEach(line => {
      const match = line.match(/^(\s+)\S+/);
      if (match) {
        const indent = match[1].length;
        mindent = mindent === null ? indent : Math.min(mindent, indent);
      }
    });
    
    if (mindent !== null) {
      result = lines.map(line =>
        (line.startsWith(" ") || line.startsWith("\t")) ? line.slice(mindent) : line
      ).join("\n");
    }

    result = result.trim();
    if (escapeSpecialCharacters) {
      result = result.replace(/\\n/g, "\n");
    }

    return result;
  }

  dedent.withOptions = newOptions => createDedent({ ...options, ...newOptions });
  return dedent;
}

module.exports = exports.default;
module.exports.default = exports.default;
