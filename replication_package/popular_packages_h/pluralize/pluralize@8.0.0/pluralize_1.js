(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    // Node.js
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(factory);
  } else {
    // Global for browsers
    root.pluralize = factory();
  }
})(this, function () {

  const pluralRules = [];
  const singularRules = [];
  const uncountables = {};
  const irregularPlurals = {};
  const irregularSingles = {};

  function sanitizeRule(rule) {
    return (typeof rule === 'string') ? new RegExp(`^${rule}$`, 'i') : rule;
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
    return word.replace(rule[0], (match, index) => {
      const result = interpolate(rule[1], arguments);
      if (match === '') return restoreCase(word[index - 1], result);
      return restoreCase(match, result);
    });
  }

  function sanitizeWord(token, word, rules) {
    if (!token.length || uncountables.hasOwnProperty(token)) return word;
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

  pluralize.addUncountableRule = (word) => {
    if (typeof word === 'string') {
      uncountables[word.toLowerCase()] = true;
      return;
    }
    pluralize.addPluralRule(word, '$0');
    pluralize.addSingularRule(word, '$0');
  };

  pluralize.addIrregularRule = function(single, plural) {
    irregularSingles[single.toLowerCase()] = plural.toLowerCase();
    irregularPlurals[plural.toLowerCase()] = single.toLowerCase();
  };

  /*
    Irregular rules, pluralization rules, singularization rules, 
    and uncountable rules initialization would go here.
  */

  return pluralize;
});
