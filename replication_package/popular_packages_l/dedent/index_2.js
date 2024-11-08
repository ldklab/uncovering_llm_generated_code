function dedent(strings, ...values) {
  const inputArray = typeof strings === 'string' ? [strings] : strings.raw;
  let concatenated = '';

  inputArray.forEach((str, idx) => {
    concatenated += str.replace(/\\n[ \t]*/g, '') + (values[idx] || '');
  });

  const lines = concatenated.split('\n');
  const minIndent = lines.reduce((currentMinIndent, line) => {
    if (line.trim() === '') return currentMinIndent;
    const match = line.match(/^(\s*)/);
    const lineIndent = match ? match[0].length : 0;
    return currentMinIndent === null || lineIndent < currentMinIndent ? lineIndent : currentMinIndent;
  }, null);

  const finalText = minIndent !== null
    ? lines.map(line => line.slice(minIndent)).join('\n')
    : concatenated;

  return finalText.trim();
}

dedent.withOptions = function({ escapeSpecialCharacters = true } = {}) {
  return function(strings, ...values) {
    const processedStrings = escapeSpecialCharacters ? 
      strings.map(str => str.replace(/([$`\\])/g, '\\$1')) : strings;
    return dedent(processedStrings, ...values);
  };
};

module.exports = dedent;

// Usage example
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

  return [first, second, third].join("\n\n");
}

console.log(usageExample());
