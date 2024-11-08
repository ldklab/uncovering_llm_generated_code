// graphql-tag/index.js

const { parse } = require('graphql');
const cache = {};

// Function to parse and cache GraphQL queries
function gql(literals, ...placeholders) {
  const query = literals
    .map((literal, index) => literal + (placeholders[index] || ''))
    .join('');
  
  // Cache and parse query if not already cached
  if (!cache[query]) {
    cache[query] = parse(query);
  }
  
  return cache[query];
}

exports.gql = gql;

let fragmentWarningsEnabled = true;

// Disables fragment warnings
exports.disableFragmentWarnings = () => {
  fragmentWarningsEnabled = false;
};

// Experimental feature flag for fragment variables
const fragmentVariableSupport = { enabled: false };

// Enable support for experimental fragment variables
exports.enableExperimentalFragmentVariables = () => {
  fragmentVariableSupport.enabled = true;
};

// Disable support for experimental fragment variables
exports.disableExperimentalFragmentVariables = () => {
  fragmentVariableSupport.enabled = false;
};

// Check and warn about duplicate fragment names
function checkFragmentWarnings(queryAST) {
  if (!fragmentWarningsEnabled) return;
  const fragmentNames = new Set();
  queryAST.definitions.forEach(def => {
    if (def.kind === 'FragmentDefinition') {
      if (fragmentNames.has(def.name.value)) {
        console.warn(`Duplicate fragment name: ${def.name.value}`);
      }
      fragmentNames.add(def.name.value);
    }
  });
}

// Example Usage
const query = gql`
  {
    user(id: 5) {
      firstName
      lastName
    }
  }
`;

console.log(JSON.stringify(query, null, 2)); // Output AST as a JSON string
checkFragmentWarnings(query);

// Example usage of experimental feature flag
if (fragmentVariableSupport.enabled) {
  const fragmentWithVariables = gql`
  fragment ExampleFragment($arg: String!) on Type {
    field
  }
  `;
  console.log(fragmentWithVariables);
}
