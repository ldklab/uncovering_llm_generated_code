"use strict";

function dedent(strings) {
  let raw = typeof strings === "string" ? [strings] : strings.raw;

  let result = raw.reduce((acc, curr, i) => {
    acc += curr.replace(/\\\n[ \t]*/g, "").replace(/\\`/g, "`");
    if (i < arguments.length - 1) {
      acc += arguments[i + 1];
    }
    return acc;
  }, "");

  let lines = result.split("\n");
  let mindent = lines.reduce((minIndent, line) => {
    let match = line.match(/^(\s+)\S+/);
    if (match) {
      let indent = match[1].length;
      return minIndent === null ? indent : Math.min(minIndent, indent);
    }
    return minIndent;
  }, null);

  if (mindent !== null) {
    result = lines.map(line => line.startsWith(" ") ? line.slice(mindent) : line).join("\n");
  }

  return result.trim().replace(/\\n/g, "\n");
}

if (typeof module !== "undefined") {
  module.exports = dedent;
}
