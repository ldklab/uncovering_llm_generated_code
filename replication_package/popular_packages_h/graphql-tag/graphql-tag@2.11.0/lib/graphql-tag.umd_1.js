(function (global, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    factory();
  } else if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    factory();
  }
}(this, function () {
  'use strict';

  const { parse } = require('graphql/language/parser');

  const normalize = (str) => str.replace(/[\s,]+/g, ' ').trim();
  let docCache = {};
  let fragmentSourceMap = {};

  const cacheKeyFromLoc = (loc) => normalize(loc.source.body.substring(loc.start, loc.end));

  const resetCaches = () => {
    docCache = {};
    fragmentSourceMap = {};
  };

  let printFragmentWarnings = true;

  const processFragments = (ast) => {
    const astFragmentMap = {};
    const definitions = [];

    ast.definitions.forEach(def => {
      if (def.kind === 'FragmentDefinition') {
        const fragmentName = def.name.value;
        const sourceKey = cacheKeyFromLoc(def.loc);

        if (fragmentSourceMap[fragmentName] && !fragmentSourceMap[fragmentName][sourceKey]) {
          if (printFragmentWarnings) {
            console.warn(`Warning: fragment with name ${fragmentName} already exists. graphql-tag enforces all fragment names across your application to be unique; read more about this in the docs: http://dev.apollodata.com/core/fragments.html#unique-names`);
          }
          fragmentSourceMap[fragmentName][sourceKey] = true;
        } else if (!fragmentSourceMap[fragmentName]) {
          fragmentSourceMap[fragmentName] = { [sourceKey]: true };
        }

        if (!astFragmentMap[sourceKey]) {
          astFragmentMap[sourceKey] = true;
          definitions.push(def);
        }
      } else {
        definitions.push(def);
      }
    });

    ast.definitions = definitions;
    return ast;
  };

  const disableFragmentWarnings = () => {
    printFragmentWarnings = false;
  };

  const stripLoc = (doc, removeLocAtThisLevel) => {
    if (Array.isArray(doc)) {
      return doc.map(d => stripLoc(d, removeLocAtThisLevel));
    }

    if (typeof doc !== 'object') {
      throw new Error('Unexpected input.');
    }

    if (removeLocAtThisLevel && doc.loc) {
      delete doc.loc;
    }

    if (doc.loc) {
      delete doc.loc.startToken;
      delete doc.loc.endToken;
    }

    Object.keys(doc).forEach(key => {
      if (typeof doc[key] === 'object') {
        doc[key] = stripLoc(doc[key], true);
      }
    });

    return doc;
  };

  let experimentalFragmentVariables = false;

  const parseDocument = (doc) => {
    const cacheKey = normalize(doc);

    if (docCache[cacheKey]) return docCache[cacheKey];

    const parsed = parse(doc, { experimentalFragmentVariables });

    if (!parsed || parsed.kind !== 'Document') {
      throw new Error('Not a valid GraphQL document.');
    }

    const processed = stripLoc(processFragments(parsed), false);
    docCache[cacheKey] = processed;

    return processed;
  };

  const enableExperimentalFragmentVariables = () => (experimentalFragmentVariables = true);
  const disableExperimentalFragmentVariables = () => (experimentalFragmentVariables = false);

  const gql = (...args) => {
    let literals = args[0];
    let result = typeof literals === 'string' ? literals : literals[0];

    args.slice(1).forEach((arg, i) => {
      result += (arg && arg.kind === 'Document') ? arg.loc.source.body : arg;
      result += literals[i + 1];
    });

    return parseDocument(result);
  };

  gql.default = gql;
  gql.resetCaches = resetCaches;
  gql.disableFragmentWarnings = disableFragmentWarnings;
  gql.enableExperimentalFragmentVariables = enableExperimentalFragmentVariables;
  gql.disableExperimentalFragmentVariables = disableExperimentalFragmentVariables;

  module.exports = gql;

}));
//# sourceMappingURL=graphql-tag.umd.js.map
