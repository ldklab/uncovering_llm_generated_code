module.exports = getAbbreviations;

function getAbbreviations(...args) {
  let list = args.length === 1 || Array.isArray(args[0]) ? args[0] : args;

  list = list.map(item => typeof item === 'string' ? item : String(item));

  list.sort((a, b) => a.localeCompare(b));

  const abbrevMap = {};
  let previous = '';
  
  for (let i = 0; i < list.length; i++) {
    const current = list[i];
    const next = list[i + 1] || '';
    let commonPrefixLength = 0;
    while (
      current.charAt(commonPrefixLength) === next.charAt(commonPrefixLength) ||
      current.charAt(commonPrefixLength) === previous.charAt(commonPrefixLength)
    ) {
      commonPrefixLength++;
    }
    
    previous = current;
    
    if (commonPrefixLength === current.length) {
      abbrevMap[current] = current;
    } else {
      for (let prefix = current.slice(0, commonPrefixLength); commonPrefixLength <= current.length; commonPrefixLength++) {
        abbrevMap[prefix] = current;
        prefix += current.charAt(commonPrefixLength);
      }
    }
  }
  
  return abbrevMap;
}

function lexSort(a, b) {
  return a.localeCompare(b);
}
