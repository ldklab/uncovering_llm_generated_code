"use strict";

// Export dedent functionality
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

// Create dedent with default options
const dedent = createDedent({});
exports.default = dedent;

// Function to create a dedent utility with specific options
function createDedent(options) {
  // Allow extending options
  dedent.withOptions = newOptions => createDedent({ ...options, ...newOptions });
  return dedent;

  // Dedent function to process template strings
  function dedent(strings, ...values) {
    const raw = typeof strings === "string" ? [strings] : strings.raw;
    const { escapeSpecialCharacters = Array.isArray(strings) } = options;

    // Interpolate values into the template
    let result = "";
    for (let i = 0; i < raw.length; i++) {
      let next = raw[i];
      if (escapeSpecialCharacters) {
        next = next
          .replace(/\\\n[ \t]*/g, "")
          .replace(/\\`/g, "`")
          .replace(/\\\$/g, "$")
          .replace(/\\\{/g, "{");
      }
      result += next;
      if (i < values.length) {
        result += values[i];
      }
    }

    // Strip common leading whitespace from each line
    const lines = result.split("\n");
    let mindent = null;
    for (const line of lines) {
      const match = line.match(/^(\s+)\S+/);
      if (match) {
        const indentLength = match[1].length;
        mindent = mindent === null ? indentLength : Math.min(mindent, indentLength);
      }
    }

    if (mindent !== null) {
      result = lines
        .map(line => (line[0] === " " || line[0] === "\t" ? line.slice(mindent) : line))
        .join("\n");
    }

    // Trim leading and trailing whitespace
    result = result.trim();

    // Replace escaped newline characters if needed
    if (escapeSpecialCharacters) {
      result = result.replace(/\\n/g, "\n");
    }

    return result;
  }
}

// Export the module
module.exports = exports.default;
module.exports.default = exports.default;
