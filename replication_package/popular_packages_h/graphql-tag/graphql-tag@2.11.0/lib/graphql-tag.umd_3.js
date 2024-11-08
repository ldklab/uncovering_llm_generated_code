(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(factory());
}(this, (function () { 'use strict';

const { parse } = require('graphql/language/parser');

// Utility to strip unnecessary whitespace and commas
const normalize = (string) => string.replace(/[\s,]+/g, ' ').trim();

// Caches for parsed documents and fragment sources
let docCache = {};
let fragmentSourceMap = {};

// Generates a cache key based on a location object
const cacheKeyFromLoc = (loc) => {
  return normalize(loc.source.body.substring(loc.start, loc.end));
};

// Resets caches for testing
function resetCaches() {
  docCache = {};
  fragmentSourceMap = {};
}

// Flag for printing fragment warnings
let printFragmentWarnings = true;

// Ensures fragments in an AST are unique and valid
function processFragments(ast) {
  const astFragmentMap = {};
  const definitions = [];

  for (const definition of ast.definitions) {
    if (definition.kind === 'FragmentDefinition') {
      const fragmentName = definition.name.value;
      const sourceKey = cacheKeyFromLoc(definition.loc);

      if (fragmentSourceMap[fragmentName] && !fragmentSourceMap[fragmentName][sourceKey]) {
        if (printFragmentWarnings) {
          console.warn(`Warning: fragment with name ${fragmentName} already exists. Ensure all fragment names are unique.`);
        }
        fragmentSourceMap[fragmentName][sourceKey] = true;
      } else if (!fragmentSourceMap[fragmentName]) {
        fragmentSourceMap[fragmentName] = {};
        fragmentSourceMap[fragmentName][sourceKey] = true;
      }

      if (!astFragmentMap[sourceKey]) {
        astFragmentMap[sourceKey] = true;
        definitions.push(definition);
      }
    } else {
      definitions.push(definition);
    }
  }

  ast.definitions = definitions;
  return ast;
}

// Disables fragment warnings
function disableFragmentWarnings() {
  printFragmentWarnings = false;
}

// Strips location details from the document object
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
    if (typeof doc[key] === 'object' && doc[key] !== null) {
      doc[key] = stripLoc(doc[key], true);
    }
  }

  return doc;
}

let experimentalFragmentVariables = false;

// Parses and caches a GraphQL document
function parseDocument(doc) {
  const cacheKey = normalize(doc);

  if (docCache[cacheKey]) {
    return docCache[cacheKey];
  }

  const parsed = parse(doc, { experimentalFragmentVariables });
  if (!parsed || parsed.kind !== 'Document') {
    throw new Error('Not a valid GraphQL document.');
  }

  processFragments(parsed);
  stripLoc(parsed, false);
  docCache[cacheKey] = parsed;

  return parsed;
}

// Toggle experimental fragment variables
function enableExperimentalFragmentVariables() {
  experimentalFragmentVariables = true;
}

function disableExperimentalFragmentVariables() {
  experimentalFragmentVariables = false;
}

// GraphQL template literal tag function
function gql(template, ...substitutions) {
  let result = (typeof template === "string") ? template : template[0];

  substitutions.forEach((substitution, i) => {
    if (substitution && substitution.kind === 'Document') {
      result += substitution.loc.source.body;
    } else {
      result += substitution;
    }

    result += template[i + 1];
  });

  return parseDocument(result);
}

// Export functions and properties
gql.default = gql;
gql.resetCaches = resetCaches;
gql.disableFragmentWarnings = disableFragmentWarnings;
gql.enableExperimentalFragmentVariables = enableExperimentalFragmentVariables;
gql.disableExperimentalFragmentVariables = disableExperimentalFragmentVariables;

module.exports = gql;

})));
