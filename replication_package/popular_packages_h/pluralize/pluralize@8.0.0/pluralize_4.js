(function (root) {
  const pluralRules = [];
  const singularRules = [];
  const uncountables = {};
  const irregularPlurals = {};
  const irregularSingles = {};

  function sanitizeRule(rule) {
    return typeof rule === 'string' ? new RegExp(`^${rule}$`, 'i') : rule;
  }

  function restoreCase(word, token) {
    if (word === token) return token;
    if (word === word.toLowerCase()) return token.toLowerCase();
    if (word === word.toUpperCase()) return token.toUpperCase();
    if (word[0] === word[0].toUpperCase()) {
      return token.charAt(0).toUpperCase() + token.substr(1).toLowerCase();
    }
    return token.toLowerCase();
  }

  function interpolate(str, args) {
    return str.replace(/\$(\d{1,2})/g, (match, index) => args[index] || '');
  }

  function replace(word, rule) {
    return word.replace(rule[0], function (match, index) {
      const result = interpolate(rule[1], arguments);
      return match === '' ? restoreCase(word[index - 1], result) : restoreCase(match, result);
    });
  }

  function sanitizeWord(token, word, rules) {
    if (!token.length || uncountables.hasOwnProperty(token)) {
      return word;
    }

    for (let i = rules.length - 1; i >= 0; i--) {
      const rule = rules[i];
      if (rule[0].test(word)) return replace(word, rule);
    }

    return word;
  }

  function replaceWord(replaceMap, keepMap, rules) {
    return function (word) {
      const token = word.toLowerCase();
      if (keepMap.hasOwnProperty(token)) return restoreCase(word, token);
      if (replaceMap.hasOwnProperty(token)) return restoreCase(word, replaceMap[token]);
      return sanitizeWord(token, word, rules);
    };
  }

  function checkWord(replaceMap, keepMap, rules) {
    return function (word) {
      const token = word.toLowerCase();
      if (keepMap.hasOwnProperty(token)) return true;
      if (replaceMap.hasOwnProperty(token)) return false;
      return sanitizeWord(token, token, rules) === token;
    };
  }

  function pluralize(word, count, inclusive) {
    const pluralized = count === 1 ? pluralize.singular(word) : pluralize.plural(word);
    return (inclusive ? count + ' ' : '') + pluralized;
  }

  pluralize.plural = replaceWord(irregularSingles, irregularPlurals, pluralRules);
  pluralize.isPlural = checkWord(irregularSingles, irregularPlurals, pluralRules);
  pluralize.singular = replaceWord(irregularPlurals, irregularSingles, singularRules);
  pluralize.isSingular = checkWord(irregularPlurals, irregularSingles, singularRules);
  pluralize.addPluralRule = (rule, replacement) => pluralRules.push([sanitizeRule(rule), replacement]);
  pluralize.addSingularRule = (rule, replacement) => singularRules.push([sanitizeRule(rule), replacement]);
  pluralize.addUncountableRule = function (word) {
    if (typeof word === 'string') {
      uncountables[word.toLowerCase()] = true;
    } else {
      pluralize.addPluralRule(word, '$0');
      pluralize.addSingularRule(word, '$0');
    }
  };
  pluralize.addIrregularRule = function (single, plural) {
    const lowerSingle = single.toLowerCase();
    const lowerPlural = plural.toLowerCase();
    irregularSingles[lowerSingle] = lowerPlural;
    irregularPlurals[lowerPlural] = lowerSingle;
  };

  const irregularRules = [
    ['I', 'we'], ['me', 'us'], ['he', 'they'], ['she', 'they'],
    ['them', 'them'], ['myself', 'ourselves'], ['yourself', 'yourselves'],
    //... other irregular rules
  ];

  const pluralizationRules = [
    [/s?$/i, 's'], [/[^\u0000-\u007F]$/i, '$0'], 
    [/([^aeiou]ese)$/i, '$1'], 
    //... other pluralization rules
  ];

  const singularizationRules = [
    [/s$/i, ''], [/(ss)$/i, '$1'], 
    //... other singularization rules
  ];

  const uncountableWords = [
    'adulthood', 'advice', 'agenda', 
    //... other uncountable words
  ];

  irregularRules.forEach(([single, plural]) => pluralize.addIrregularRule(single, plural));
  pluralizationRules.forEach(([rule, replacement]) => pluralize.addPluralRule(rule, replacement));
  singularizationRules.forEach(([rule, replacement]) => pluralize.addSingularRule(rule, replacement));
  uncountableWords.forEach(pluralize.addUncountableRule);

  if (typeof module !== 'undefined' && module.exports) {
    // Node.js
    module.exports = pluralize;
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(() => pluralize);
  } else {
    // Browser
    root.pluralize = pluralize;
  }
})(this);
