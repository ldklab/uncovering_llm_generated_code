// simple-js-formatter.js
const fs = require("fs");
const path = require("path");

/**
 * Formats JavaScript code with basic indentation according to parentheses structure.
 * Not a replacement for Prettier but illustrates basic formatting concept.
 * @param {string} code - The JavaScript code to format.
 * @returns {string} - The formatted JavaScript code.
 */
function formatJavaScript(code) {
  const indentSize = 2;
  let currentIndentation = 0;

  return code
    .split("\n")
    .map(line => line.trim())
    .map(line => {
      if (line.includes(")")) currentIndentation -= indentSize;
      const indentedLine = " ".repeat(currentIndentation) + line;
      if (line.includes("(") && !line.includes(")")) currentIndentation += indentSize;
      return indentedLine;
    })
    .join("\n");
}

// Command line utility to format a specified JavaScript file
if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Usage: node simple-js-formatter.js <file-path>");
    process.exit(1);
  }

  const resolvedPath = path.resolve(filePath);
  fs.readFile(resolvedPath, "utf8", (readError, fileContent) => {
    if (readError) {
      console.error("Failed to read file:", readError);
      process.exit(1);
    }
    const output = formatJavaScript(fileContent);
    console.log(output);
  });
}

module.exports = formatJavaScript;
