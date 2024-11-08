function createAbbreviations(...words) {
  const abbreviationsMap = {};
  const sortedWords = words.sort();

  sortedWords.forEach(word => {
    let abbreviation = '';

    for (let i = 0; i <= word.length; i++) {
      abbreviation = word.slice(0, i) || word;

      if (!abbreviationsMap.hasOwnProperty(abbreviation)) {
        abbreviationsMap[abbreviation] = word;
      } else {
        while (abbreviationsMap[abbreviation] !== word) {
          i++;
          abbreviation = word.slice(0, i);
          abbreviationsMap[abbreviation] = word;
        }
      }
    }
  });

  return abbreviationsMap;
}

module.exports = createAbbreviations;
