function dedent(strings, ...values) {
  const rawStrings = typeof strings === 'string' ? [strings] : strings.raw;
  let processedString = '';

  for (let i = 0; i < rawStrings.length; i++) {
    processedString += rawStrings[i].replace(/\\n[ \t]*/g, '') + (values[i] || '');
  }

  const lines = processedString.split('\n');
  const minIndent = lines.reduce((currentMinIndent, line) => {
    if (line.trim() === '') return currentMinIndent;
    const currentIndent = line.match(/^(\s*)/)[0].length;
    return currentMinIndent === null || currentIndent < currentMinIndent ? currentIndent : currentMinIndent;
  }, null);

  const dedented = minIndent !== null
    ? lines.map(line => line.slice(minIndent)).join('\n')
    : processedString;

  return dedented.trim();
}

dedent.withOptions = function(options = {}) {
  return function(strings, ...values) {
    let escapedStrings = strings;
    if (options.escapeSpecialCharacters) {
      escapedStrings = strings.map(str => str.replace(/([$`\\])/g, '\\$1'));
    }
    return dedent(escapedStrings, ...values);
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
