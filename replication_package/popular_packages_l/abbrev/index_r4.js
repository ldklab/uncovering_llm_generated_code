function generateAbbreviations(...words) {
  const abbreviationMap = {};
  const sortedWords = words.slice().sort();

  sortedWords.forEach(word => {
    let currentWord = word;
    let key = '';

    for (let j = 0; j <= currentWord.length; j++) {
      key = currentWord.slice(0, j) || currentWord;

      if (!abbreviationMap[key]) {
        abbreviationMap[key] = currentWord;
      } else {
        while (abbreviationMap[key] !== currentWord) {
          j++;
          key = currentWord.slice(0, j);
          abbreviationMap[key] = currentWord;
        }
      }
    }
  });

  return abbreviationMap;
}

module.exports = generateAbbreviations;