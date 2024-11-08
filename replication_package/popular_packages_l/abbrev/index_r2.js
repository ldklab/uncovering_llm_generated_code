function generateAbbreviations(...words) {
  const abbreviationMapping = {};
  words.sort().forEach((word) => {
    let prefixIndex = 0;
    let prefix = '';

    while (prefixIndex <= word.length) {
      prefix = word.slice(0, prefixIndex) || word;
      
      if (!abbreviationMapping.hasOwnProperty(prefix)) {
        abbreviationMapping[prefix] = word;
      } else {
        while (abbreviationMapping[prefix] !== word) {
          prefixIndex++;
          prefix = word.slice(0, prefixIndex);
          abbreviationMapping[prefix] = word;
        }
      }

      prefixIndex++;
    }
  });

  return abbreviationMapping;
}

module.exports = generateAbbreviations;