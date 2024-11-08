module.exports = abbrev;

function abbrev(...args) {
  let list = (args.length === 1 && Array.isArray(args[0])) ? args[0] : args;

  // Ensure each element is a string
  list = list.map(item => typeof item === 'string' ? item : String(item));

  // Sort the list lexicographically
  list.sort(lexSort);

  const abbrevs = {};
  let prev = '';

  // Generate abbreviations
  for (let i = 0; i < list.length; i++) {
    const current = list[i];
    const next = list[i + 1] || '';
    
    if (current === next) continue;

    let commonIndex = 0;
    while (commonIndex < current.length && 
           (current[commonIndex] === next[commonIndex] || current[commonIndex] === prev[commonIndex])) {
      commonIndex++;
    }

    for (let abbreviation = current.slice(0, ++commonIndex);
         commonIndex <= current.length;
         abbreviation += current[commonIndex++]) {
      abbrevs[abbreviation] = current;
    }
    
    prev = current;
  }

  return abbrevs;
}

function lexSort(a, b) {
  return a.localeCompare(b);
}