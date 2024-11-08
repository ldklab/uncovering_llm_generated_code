module.exports = generateAbbreviations;

// This function generates all possible unique abbreviations for a list of strings.
function generateAbbreviations(...args) {
  // Check if the first argument is a single list or multiple arguments.
  let items = args.length === 1 || Array.isArray(args[0]) ? args[0] : args;

  // Ensure all items are strings.
  for (let i = 0; i < items.length; i++) {
    items[i] = typeof items[i] === 'string' ? items[i] : String(items[i]);
  }

  // Sort the list alphabetically.
  items.sort(alphabeticalSort);

  // Create an object to store the abbreviations.
  const abbreviations = {};
  let previous = '';

  // Iterate over the sorted items to create abbreviations.
  for (let i = 0; i < items.length; i++) {
    const current = items[i];
    const next = items[i + 1] || '';
    let nextIsSimilar = true;
    let previousIsSimilar = true;

    // Skip if current item is the same as the next item.
    if (current === next) continue;

    // Determine the shortest unique abbreviation by comparing with neighbors.
    let position = 0;
    while (position < current.length) {
      const currentChar = current.charAt(position);
      nextIsSimilar = nextIsSimilar && currentChar === next.charAt(position);
      previousIsSimilar = previousIsSimilar && currentChar === previous.charAt(position);

      // Break if no more similarity in both directions.
      if (!nextIsSimilar && !previousIsSimilar) {
        position++;
        break;
      }
      position++;
    }
    
    previous = current;

    // If the whole word is used, map the full word to itself.
    if (position === current.length) {
      abbreviations[current] = current;
      continue;
    }

    // Create abbreviations from the unique prefix to the full string.
    for (let prefix = current.slice(0, position); position <= current.length; position++) {
      abbreviations[prefix] = current;
      prefix += current.charAt(position);
    }
  }

  return abbreviations;
}

// Helper function to sort strings lexicographically.
function alphabeticalSort(a, b) {
  return a.localeCompare(b);
}
