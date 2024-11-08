// docblockUtils.js

// Extracts complete docblock from given text, or returns an empty string if none found.
function extractDocblock(content) {
  const docblockPattern = /^\s*\/\*\*([\s\S]*?)\*\//;
  const match = content.match(docblockPattern);
  return match ? match[0] : '';
}

// Strips docblock from text, leaving the rest of the content.
function removeDocblock(content) {
  const docblockPattern = /^\s*\/\*\*([\s\S]*?)\*\/\s*/;
  return content.replace(docblockPattern, '');
}

// Parses docblock into key-value pairs of pragmas and handles multiple values.
function parseDocblock(docblock) {
  const lines = docblock.split('\n').map(line => line.trim());
  const pragmaMap = {};

  lines.forEach(line => {
    const match = line.match(/^@\w+/);
    if (match) {
      const key = match[0].slice(1);
      const value = line.slice(match[0].length).trim();
      if (pragmaMap[key]) {
        if (Array.isArray(pragmaMap[key])) {
          pragmaMap[key].push(value);
        } else {
          pragmaMap[key] = [pragmaMap[key], value];
        }
      } else {
        pragmaMap[key] = value;
      }
    }
  });

  return pragmaMap;
}

// Separates pragmas from comments in a docblock.
function parseDocblockWithComments(docblock) {
  const pragmas = parseDocblock(docblock);
  const allLines = docblock.split('\n').map(line => line.trim());
  const comments = allLines.filter(line => !line.startsWith('@'))
                           .join(' ')
                           .replace(/\/\*\*|\*\//g, '')
                           .trim();
  return { comments, pragmas };
}

// Constructs a docblock from given comments and pragmas.
function createDocblock({ comments = '', pragmas = {} } = {}) {
  const pragmaSections = Object.entries(pragmas)
    .map(([key, value]) => 
      Array.isArray(value) 
        ? value.map(val => ` * @${key} ${val}`).join('\n') 
        : ` * @${key} ${value}`
    )
    .join('\n');

  const commentSection = comments.split('\n').map(line => ` * ${line}`).join('\n');
  return `/**\n${commentSection}\n${pragmaSections ? '\n' + pragmaSections : ''}\n */`;
}

module.exports = {
  extractDocblock,
  removeDocblock,
  parseDocblock,
  parseDocblockWithComments,
  createDocblock,
};
