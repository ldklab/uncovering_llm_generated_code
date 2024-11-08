(function(root, factory) {
  if (typeof exports === 'object') {
    module.exports = factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    root.pluralize = factory();
  }
}(this, function() {
  var pluralRules = [];
  var singularRules = [];
  var irregularRules = {};
  var uncountableRules = {};

  function addPluralRule(regex, replacement) {
    pluralRules.push([regex, replacement]);
  }
  
  function addSingularRule(regex, replacement) {
    singularRules.push([regex, replacement]);
  }

  function addIrregularRule(singular, plural) {
    irregularRules[singular.toLowerCase()] = plural.toLowerCase();
    irregularRules[plural.toLowerCase()] = singular.toLowerCase();
  }

  function addUncountableRule(word) {
    uncountableRules[word.toLowerCase()] = true;
  }

  function isUncountable(word) {
    return !!uncountableRules[word.toLowerCase()];
  }

  function pluralize(word, count, inclusive) {
    if (count != null && count === 1) {
      return inclusive ? `${count} ${singular(word)}` : singular(word);
    }

    var pluralWord = isUncountable(word) ? word : plural(word);
    return inclusive ? `${count || 0} ${pluralWord}` : pluralWord;
  }

  function plural(word) {
    if(isUncountable(word)) return word;
    for (var rule in irregularRules) {
      if (word.toLowerCase() === rule) return irregularRules[rule];
    }
    return applyRules(word, pluralRules);
  }

  function singular(word) {
    if(isUncountable(word)) return word;
    for (var rule in irregularRules) {
      if (word.toLowerCase() === rule) return irregularRules[rule];
    }
    return applyRules(word, singularRules);
  }

  function applyRules(word, rules) {
    var lower = word.toLowerCase();
    for (var i = 0; i < rules.length; i++) {
      if (rules[i][0].test(lower)) {
        return word.replace(rules[i][0], rules[i][1]);
      }
    }
    return word;
  }

  function isPlural(word) {
    return plural(word) === word && !isSingular(word);
  }

  function isSingular(word) {
    return singular(word) === word && !isPlural(word);
  }
  
  // Predefined rule examples. Users can extend with addPluralRule, etc.
  addPluralRule(/$/, 's');
  addPluralRule(/s$/i, 's');
  addSingularRule(/s$/i, '');

  return {
    pluralize,
    plural,
    singular,
    addPluralRule,
    addSingularRule,
    addIrregularRule,
    addUncountableRule,
    isPlural,
    isSingular
  };
}));
