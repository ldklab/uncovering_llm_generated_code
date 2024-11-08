(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (factory());
}(this, (function () { 'use strict';

const { parse } = require('graphql/language/parser');

function normalize(string) {
  return string.replace(/[\s,]+/g, ' ').trim();
}

let docCache = {};
let fragmentSourceMap = {};

function cacheKeyFromLoc(loc) {
  return normalize(loc.source.body.substring(loc.start, loc.end));
}

function resetCaches() {
  docCache = {};
  fragmentSourceMap = {};
}

let printFragmentWarnings = true;

function processFragments(ast) {
  const astFragmentMap = {};
  const definitions = [];

  for (const fragmentDefinition of ast.definitions) {
    if (fragmentDefinition.kind === 'FragmentDefinition') {
      const fragmentName = fragmentDefinition.name.value;
      const sourceKey = cacheKeyFromLoc(fragmentDefinition.loc);

      if (fragmentSourceMap.hasOwnProperty(fragmentName) && !fragmentSourceMap[fragmentName][sourceKey]) {
        if (printFragmentWarnings) {
          console.warn(`Warning: fragment with name ${fragmentName} already exists.\ngraphql-tag enforces all fragment names across your application to be unique; read more about\nthis in the docs: http://dev.apollodata.com/core/fragments.html#unique-names`);
        }
        fragmentSourceMap[fragmentName][sourceKey] = true;
      } else if (!fragmentSourceMap.hasOwnProperty(fragmentName)) {
        fragmentSourceMap[fragmentName] = {};
        fragmentSourceMap[fragmentName][sourceKey] = true;
      }

      if (!astFragmentMap[sourceKey]) {
        astFragmentMap[sourceKey] = true;
        definitions.push(fragmentDefinition);
      }
    } else {
      definitions.push(fragmentDefinition);
    }
  }

  ast.definitions = definitions;
  return ast;
}

function disableFragmentWarnings() {
  printFragmentWarnings = false;
}

function stripLoc(doc, removeLocAtThisLevel) {
  if (Array.isArray(doc)) {
    return doc.map(d => stripLoc(d, removeLocAtThisLevel));
  }

  if (typeof doc !== 'object' || doc === null) {
    throw new Error('Unexpected input.');
  }

  if (removeLocAtThisLevel && doc.loc) {
    delete doc.loc;
  }

  if (doc.loc) {
    delete doc.loc.startToken;
    delete doc.loc.endToken;
  }

  for (const key of Object.keys(doc)) {
    const value = doc[key];
    if (typeof value === 'object' && value !== null) {
      doc[key] = stripLoc(value, true);
    }
  }

  return doc;
}

let experimentalFragmentVariables = false;

function parseDocument(doc) {
  const cacheKey = normalize(doc);

  if (docCache[cacheKey]) {
    return docCache[cacheKey];
  }

  let parsed = parse(doc, { experimentalFragmentVariables });
  if (!parsed || parsed.kind !== 'Document') {
    throw new Error('Not a valid GraphQL document.');
  }

  parsed = processFragments(parsed);
  parsed = stripLoc(parsed, false);
  docCache[cacheKey] = parsed;

  return parsed;
}

function enableExperimentalFragmentVariables() {
  experimentalFragmentVariables = true;
}

function disableExperimentalFragmentVariables() {
  experimentalFragmentVariables = false;
}

function gql(/* arguments */) {
  const args = Array.from(arguments);
  const literals = args[0];
  let result = (typeof literals === "string") ? literals : literals[0];

  for (let i = 1; i < args.length; i++) {
    result += args[i] && args[i].kind === 'Document' ? args[i].loc.source.body : args[i];
    result += literals[i];
  }

  return parseDocument(result);
}

gql.default = gql;
gql.resetCaches = resetCaches;
gql.disableFragmentWarnings = disableFragmentWarnings;
gql.enableExperimentalFragmentVariables = enableExperimentalFragmentVariables;
gql.disableExperimentalFragmentVariables = disableExperimentalFragmentVariables;

module.exports = gql;

})));
