module.exports = abbrev;

function abbrev(...args) {
  // Normalize input to a flat list of strings
  let list = args.length === 1 && Array.isArray(args[0]) ? args[0] : args;
  
  // Ensure all items in the list are strings
  list = list.map(item => String(item));
  
  // Sort list lexicographically
  list.sort(lexSort);
  
  const abbrevs = {};
  let prev = '';
  
  for (let i = 0; i < list.length; i++) {
    const current = list[i];
    const next = list[i + 1] || '';
    
    if (current === next) {
      continue;
    }
    
    let j = 0;
    while (j < current.length && current[j] === next[j] && current[j] === prev[j]) {
      j++;
    }
    
    prev = current;
    
    for (let a = current.slice(0, j); j <= current.length; j++) {
      abbrevs[a] = current;
      a += current[j] || '';
    }
  }
  
  return abbrevs;
}

function lexSort(a, b) {
  return a.localeCompare(b);
}