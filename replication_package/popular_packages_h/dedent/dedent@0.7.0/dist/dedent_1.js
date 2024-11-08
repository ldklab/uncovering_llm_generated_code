"use strict";

function dedent(strings) {
  let raw = typeof strings === "string" ? [strings] : strings.raw;
  let result = "";

  // Perform interpolation and handle suppressed newlines and escaped backticks
  for (let i = 0; i < raw.length; i++) {
    result += raw[i]
      .replace(/\\\n[ \t]*/g, "") // Remove suppressed newlines
      .replace(/\\`/g, "`"); // Replace escaped backticks

    if (i < (arguments.length - 1)) {
      result += arguments[i + 1];
    }
  }

  // Split the result into lines for indentation analysis
  let lines = result.split("\n");
  let mindent = null;

  lines.forEach(line => {
    const match = line.match(/^(\s+)\S+/);
    if (match) {
      const indent = match[1].length;
      mindent = mindent === null ? indent : Math.min(mindent, indent);
    }
  });

  // Remove the common indentation from each line
  if (mindent !== null) {
    result = lines.map(line => line.startsWith(" ") ? line.slice(mindent) : line).join("\n");
  }

  // Trim leading and trailing whitespace from the result
  result = result.trim();

  // Replace escaped newlines with real newlines
  return result.replace(/\\n/g, "\n");
}

if (typeof module !== "undefined") {
  module.exports = dedent;
}
