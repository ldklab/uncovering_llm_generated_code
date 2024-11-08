(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    root.pluralize = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  const pluralRules = [], singularRules = [], uncountables = {}, irregularPlurals = {}, irregularSingles = {};
  
  function sanitizeRule(rule) {
    return typeof rule === 'string' ? new RegExp('^' + rule + '$', 'i') : rule;
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
    return str.replace(/\$(\d{1,2})/g, (_, index) => args[index] || '');
  }
  
  function replace(word, rule) {
    return word.replace(rule[0], (match, index) => {
      const result = interpolate(rule[1], arguments);
      return match === '' ? restoreCase(word[index - 1], result) : restoreCase(match, result);
    });
  }
  
  function sanitizeWord(token, word, rules) {
    if (!token.length || uncountables[token]) return word;
    let len = rules.length;
    while (len--) {
      const rule = rules[len];
      if (rule[0].test(word)) return replace(word, rule);
    }
    return word;
  }
  
  function replaceWord(replaceMap, keepMap, rules) {
    return function(word) {
      const token = word.toLowerCase();
      if (keepMap[token]) return restoreCase(word, token);
      if (replaceMap[token]) return restoreCase(word, replaceMap[token]);
      return sanitizeWord(token, word, rules);
    };
  }
  
  function checkWord(replaceMap, keepMap, rules) {
    return function(word) {
      const token = word.toLowerCase();
      if (keepMap[token]) return true;
      if (replaceMap[token]) return false;
      return sanitizeWord(token, token, rules) === token;
    };
  }
  
  function pluralize(word, count, inclusive) {
    const pluralized = count === 1 ? pluralize.singular(word) : pluralize.plural(word);
    return (inclusive ? `${count} ` : '') + pluralized;
  }
 
  pluralize.plural = replaceWord(irregularSingles, irregularPlurals, pluralRules);
  
  pluralize.isPlural = checkWord(irregularSingles, irregularPlurals, pluralRules);
  
  pluralize.singular = replaceWord(irregularPlurals, irregularSingles, singularRules);
  
  pluralize.isSingular = checkWord(irregularPlurals, irregularSingles, singularRules);
  
  pluralize.addPluralRule = (rule, replacement) => pluralRules.push([sanitizeRule(rule), replacement]);
  
  pluralize.addSingularRule = (rule, replacement) => singularRules.push([sanitizeRule(rule), replacement]);
  
  pluralize.addUncountableRule = (word) => {
    if (typeof word === 'string') {
      uncountables[word.toLowerCase()] = true;
    } else {
      pluralize.addPluralRule(word, '$0');
      pluralize.addSingularRule(word, '$0');
    }
  };
  
  pluralize.addIrregularRule = (single, plural) => {
    single = single.toLowerCase();
    plural = plural.toLowerCase();
    irregularSingles[single] = plural;
    irregularPlurals[plural] = single;
  };
  
  [
    // Irregular Rules
    ['I', 'we'], ['me', 'us'], ['he', 'they'], ['she', 'they'],
    // Pronouns and more
    ['them', 'them'], ['myself', 'ourselves'], ['yourself', 'yourselves'],
    // ...
  ].forEach(rule => pluralize.addIrregularRule(rule[0], rule[1]));
  
  [
    [/s?$/i, 's'], [/[^\u0000-\u007F]$/i, '$0'], [/(ax|test)is$/i, '$1es'],
    // ...
  ].forEach(rule => pluralize.addPluralRule(rule[0], rule[1]));
  
  [
    [/s$/i, ''], [/(ss)$/i, '$1'], [/(wi|kni|(?:after|half|high|low|mid|non|night|[^\w]|^)li)ves$/i, '$1fe'],
    // ...
  ].forEach(rule => pluralize.addSingularRule(rule[0], rule[1]));
  
  [
    'adulthood', 'advice', 'agenda', 'aircraft', 'bison', // ...
  ].forEach(pluralize.addUncountableRule);
  
  return pluralize;
}));
