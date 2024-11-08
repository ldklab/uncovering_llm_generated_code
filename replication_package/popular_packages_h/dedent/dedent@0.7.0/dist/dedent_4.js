"use strict";

function dedent(strings) {
  let raw;

  // Determine if input is a string or template literal
  if (typeof strings === "string") {
    raw = [strings];
  } else {
    raw = strings.raw;
  }

  // Perform string interpolation and initial processing
  let result = "";
  for (let i = 0; i < raw.length; i++) {
    result += raw[i]
      .replace(/\\\n[ \t]*/g, "")  // Join lines on suppressed newline
      .replace(/\\`/g, "`");  // Handle escaped backticks

    if (i < arguments.length - 1) {
      result += arguments[i + 1];
    }
  }

  // Strip common indentation from resulting string
  const lines = result.split("\n");
  let mindent = null;

  lines.forEach(line => {
    const match = line.match(/^(\s+)\S+/);
    if (match) {
      const indent = match[1].length;
      mindent = (mindent === null) ? indent : Math.min(mindent, indent);
    }
  });

  if (mindent !== null) {
    result = lines.map(line => line[0] === " " ? line.slice(mindent) : line).join("\n");
  }

  // Trim leading/trailing whitespace and handle escaped newlines
  result = result.trim().replace(/\\n/g, "\n");

  return result;
}

if (typeof module !== "undefined") {
  module.exports = dedent;
}
