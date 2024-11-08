// jest-docblock.js

function extract(contents) {
  const match = contents.match(/^\s*\/\*\*([\s\S]*?)\*\//);
  return match ? match[0] : '';
}

function strip(contents) {
  return contents.replace(/^\s*\/\*\*([\s\S]*?)\*\/\s*/, '');
}

function parse(docblock) {
  const lines = docblock.split('\n').map(line => line.trim());
  const pragmas = {};
  lines.forEach(line => {
    const pragmaMatch = line.match(/^@\w+/);
    if (pragmaMatch) {
      const key = pragmaMatch[0].slice(1);
      const value = line.substring(pragmaMatch[0].length).trim();
      if (pragmas[key]) {
        pragmas[key] = Array.isArray(pragmas[key]) ? [...pragmas[key], value] : [pragmas[key], value];
      } else {
        pragmas[key] = value;
      }
    }
  });
  return pragmas;
}

function parseWithComments(docblock) {
  const pragmas = parse(docblock);
  const comments = docblock.split('\n').map(line => line.trim())
    .filter(line => !line.startsWith('@'))
    .join(' ')
    .replace(/\/\*\*|\*\//g, '')
    .trim();
  return { comments, pragmas };
}

function print({ comments = '', pragmas = {} }) {
  const pragmaLines = Object.entries(pragmas)
    .map(([key, value]) => Array.isArray(value) 
      ? value.map(val => ` * @${key} ${val}`).join('\n')
      : ` * @${key} ${value}`)
    .join('\n');

  const commentLines = comments ? comments.split('\n').map(line => ` * ${line}`).join('\n') : '';
  return `/**\n${commentLines}${pragmaLines ? `\n${pragmaLines}` : ''}\n */`;
}

module.exports = {
  extract,
  strip,
  parse,
  parseWithComments,
  print,
};
