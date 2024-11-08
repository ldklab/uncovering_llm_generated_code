// prettier-sim.js
const fs = require("fs");
const path = require("path");

/**
 * Format JavaScript code by handling basic wrapping and indentation.
 */
function formatJS(input) {
  const indentSize = 2;
  let currentIndent = 0;

  return input
    .split("\n")
    .map(line => {
      let trimmedLine = line.trim();
      if (trimmedLine.includes(")")) currentIndent -= indentSize;
      const indentedLine = " ".repeat(currentIndent) + trimmedLine;
      if (trimmedLine.includes("(") && !trimmedLine.includes(")")) currentIndent += indentSize;
      return indentedLine;
    })
    .join("\n");
}

// CLI for formatting files
if (require.main === module) {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("Please provide a file path to format.");
    process.exit(1);
  }

  const resolvedPath = path.resolve(filePath);
  fs.readFile(resolvedPath, "utf8", (error, fileContent) => {
    if (error) {
      console.error("Error reading file:", error);
      process.exit(1);
    }
    const formattedContent = formatJS(fileContent);
    console.log(formattedContent);
  });
}

module.exports = formatJS;
