module.exports = exports = abbrevGenerator.abbrev = abbrevGenerator;

abbrevGenerator.monkeyPatch = applyMonkeyPatch;

function applyMonkeyPatch() {
  Object.defineProperty(Array.prototype, 'abbrev', {
    value: function() { return abbrevGenerator(this); },
    enumerable: false, configurable: true, writable: true
  });

  Object.defineProperty(Object.prototype, 'abbrev', {
    value: function() { return abbrevGenerator(Object.keys(this)); },
    enumerable: false, configurable: true, writable: true
  });
}

function abbrevGenerator(inputList) {
  if (arguments.length !== 1 || !Array.isArray(inputList)) {
    inputList = Array.prototype.slice.call(arguments, 0);
  }
  
  let processedArgs = inputList.map(item => typeof item === "string" ? item : String(item));
  processedArgs.sort(lexicalSort);

  let abbreviationMap = {}, previous = "";
  
  for (let i = 0, len = processedArgs.length; i < len; i++) {
    let current = processedArgs[i],
        next = processedArgs[i + 1] || "",
        matchingNext = true,
        matchingPrevious = true;

    if (current === next) continue;

    let j;
    for (j = 0, curLen = current.length; j < curLen; j++) {
      const currentChar = current.charAt(j);
      matchingNext = matchingNext && currentChar === next.charAt(j);
      matchingPrevious = matchingPrevious && currentChar === previous.charAt(j);
      if (!matchingNext && !matchingPrevious) {
        j++;
        break;
      }
    }

    previous = current;

    if (j === curLen) {
      abbreviationMap[current] = current; 
      continue;
    }

    for (let abbrev = current.substr(0, j); j <= curLen; j++) {
      abbreviationMap[abbrev] = current; 
      abbrev += current.charAt(j); 
    }
  }

  return abbreviationMap;
}

function lexicalSort(a, b) {
  return a === b ? 0 : a > b ? 1 : -1;
}