const fs = require("fs");
const path = require("path");

/**
 * Formats JavaScript code with simple indentation based on parentheses.
 */
function formatJS(input) {
  const indentSize = 2;
  let indentLevel = 0;

  return input
    .split("\n")
    .map(line => line.trim()) // Remove leading and trailing spaces
    .map(line => {
      if (line.includes(")")) indentLevel -= indentSize; // Decrease indent for closing parenthesis
      const formattedLine = " ".repeat(indentLevel) + line; // Add indentation
      if (line.includes("(") && !line.includes(")")) indentLevel += indentSize; // Increase indent for open parenthesis
      return formattedLine;
    })
    .join("\n"); // Reassemble lines into a complete string
}

// Command-line application to use the formatter
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
    const formattedOutput = formatJS(data);
    console.log(formattedOutput);
  });
}

module.exports = formatJS;
