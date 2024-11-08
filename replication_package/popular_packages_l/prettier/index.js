// prettier-sim.js
const fs = require("fs");
const path = require("path");

/**
 * Simple function to format JS files with basic wrapping and indentation.
 * Does not replicate Prettier exactly but gives an idea of its functionality.
 */
function formatJS(input) {
  const indentSize = 2;
  let indentation = 0;

  return input
    .split("\n")
    .map(line => line.trim())
    .map(line => {
      if (line.includes(")")) indentation -= indentSize;
      const formattedLine = " ".repeat(indentation) + line;
      if (line.includes("(") && !line.includes(")")) indentation += indentSize;
      return formattedLine;
    })
    .join("\n");
}

// Command line interface for formatting a file
if (require.main === module) {
  const inputFilePath = process.argv[2];
  if (!inputFilePath) {
    console.error("Please provide a file path to format.");
    process.exit(1);
  }

  const absolutePath = path.resolve(inputFilePath);
  fs.readFile(absolutePath, "utf8", (err, data) => {
    if (err) {
      console.error("Error reading file:", err);
      process.exit(1);
    }
    const formattedCode = formatJS(data);
    console.log(formattedCode);
  });
}

module.exports = formatJS;
