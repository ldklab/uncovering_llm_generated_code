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
        if (Array.isArray(pragmas[key])) {
          pragmas[key].push(value);
        } else {
          pragmas[key] = [pragmas[key], value];
        }
      } else {
        pragmas[key] = value;
      }
    }
  });
  return pragmas;
}

function parseWithComments(docblock) {
  const pragmas = parse(docblock);
  const commentLines = docblock.split('\n').map(line => line.trim());
  const comments = commentLines.filter(line => !line.startsWith('@')).join(' ').replace(/\/\*\*|\*\//g, '').trim();
  return { comments, pragmas };
}

function print({ comments = '', pragmas = {} }) {
  const pragmaLines = Object.entries(pragmas)
    .map(([key, value]) => {
      if (Array.isArray(value)) {
        return value.map(val => ` * @${key} ${val}`).join('\n');
      }
      return ` * @${key} ${value}`;
    })
    .join('\n');
  const commentLines = comments.split('\n').map(line => ` * ${line}`).join('\n');
  return `/**\n${commentLines}\n${pragmaLines ? '\n' + pragmaLines : ''}\n */`;
}

module.exports = {
  extract,
  strip,
  parse,
  parseWithComments,
  print,
};
