function dedent(strings, ...values) {
  const raw = typeof strings === 'string' ? [strings] : strings.raw;

  let result = '';
  for (let i = 0; i < raw.length; i++) {
    // Replace newline escapes and append formulas into a result
    result += raw[i].replace(/\\n[ \t]*/g, '') + (values[i] || '');
  }

  // Calculate the minimum indentation
  const lines = result.split('\n');
  const minIndent = lines.reduce((minIndent, line) => {
    if (line.trim() === '') return minIndent;
    const matches = line.match(/^(\s*)/);
    const indent = matches ? matches[0].length : 0;
    return line && (indent < minIndent || minIndent === null) ? indent : minIndent;
  }, null);

  // Remove minimum indent from each line
  const dedentedText = minIndent !== null
    ? lines.map(line => line.slice(minIndent)).join('\n')
    : result;

  return dedentedText.trim();
}

dedent.withOptions = function(options = {}) {
  const { escapeSpecialCharacters = true } = options;

  return function(strings, ...values) {
    let finalStrings = strings;
    if (escapeSpecialCharacters) {
      finalStrings = strings.map((str) => str.replace(/([$`\\])/g, '\\$1'));
    }
    return dedent(finalStrings, ...values);
  };
};

module.exports = dedent;

function usageExample() {
  const first = dedent`A string that gets so long you need to break it over
                       multiple lines. Luckily dedent is here to keep it
                       readable without lots of spaces ending up in the string
                       itself.`;

  const second = dedent`
    Leading and trailing lines will be trimmed, so you can write something like
    this and have it work as you expect:

      * how convenient it is
      * that I can use an indented list
         - and still have it do the right thing

    That's all.
  `;

  const third = dedent(`
    Wait! I lied. Dedent can also be used as a function.
  `);

  return first + "\n\n" + second + "\n\n" + third;
}

console.log(usageExample());
