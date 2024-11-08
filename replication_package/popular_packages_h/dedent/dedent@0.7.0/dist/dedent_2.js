"use strict";

function dedent(strings) {
  let raw = typeof strings === "string" ? [strings] : strings.raw;

  let result = raw.reduce((accumulator, current, index) => {
    let processed = current.replace(/\\\n[ \t]*/g, "").replace(/\\`/g, "`");
    let interpolation = index < arguments.length - 1 ? arguments[index + 1] : "";
    return accumulator + processed + interpolation;
  }, "");

  let lines = result.split("\n");
  let mindent = lines.reduce((minIndent, line) => {
    let match = line.match(/^(\s+)\S+/);
    if (match) {
      let indent = match[1].length;
      return minIndent !== null ? Math.min(minIndent, indent) : indent;
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
