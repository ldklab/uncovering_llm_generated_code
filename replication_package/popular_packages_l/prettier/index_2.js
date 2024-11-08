// simple-formatter.js
const fs = require("fs");
const path = require("path");

/**
 * Formats JavaScript code by adjusting indentation based on parentheses.
 * This is a basic formatter and not a complete implementation of Prettier.
 */
function formatJavaScriptCode(code) {
  const indentationStep = 2;
  let currentIndentation = 0;

  return code
    .split("\n")
    .map(line => line.trim())
    .map(line => {
      if (line.includes(")")) currentIndentation -= indentationStep;
      const indentedLine = " ".repeat(currentIndentation) + line;
      if (line.includes("(") && !line.includes(")")) currentIndentation += indentationStep;
      return indentedLine;
    })
    .join("\n");
}

// CLI interface for formatting a specified JavaScript file
if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Error: No file path provided. Please specify a file to format.");
    process.exit(1);
  }

  const resolvedPath = path.resolve(filePath);
  fs.readFile(resolvedPath, "utf8", (error, fileContent) => {
    if (error) {
      console.error("Error reading the file:", error.message);
      process.exit(1);
    }
    const formattedOutput = formatJavaScriptCode(fileContent);
    console.log(formattedOutput);
  });
}

module.exports = formatJavaScriptCode;
