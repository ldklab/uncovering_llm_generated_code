// graphql-tag/index.js

const { parse } = require('graphql');
const cache = {};

// Function to parse GraphQL queries and cache them
function gql(literals, ...placeholders) {
  const query = literals
    .map((literal, index) => literal + (placeholders[index] || ''))
    .join('');
  
  if (!cache[query]) {
    cache[query] = parse(query);
  }
  
  return cache[query];
}

// Exporting the gql function for external usage
exports.gql = gql;

// Controls for fragment warnings
let fragmentWarningsEnabled = true;
exports.disableFragmentWarnings = () => {
  fragmentWarningsEnabled = false;
};

// Controls for experimental fragment variables support
const fragmentVariableSupport = { enabled: false };
exports.enableExperimentalFragmentVariables = () => {
  fragmentVariableSupport.enabled = true;
};
exports.disableExperimentalFragmentVariables = () => {
  fragmentVariableSupport.enabled = false;
};

// Function to check and warn about duplicate fragment names
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

// Example usage of gql function
const query = gql`
  {
    user(id: 5) {
      firstName
      lastName
    }
  }
`;

// Output the query AST for demonstration
console.log(JSON.stringify(query, null, 2));
checkFragmentWarnings(query);

// Example for conditional fragment variable support
if (fragmentVariableSupport.enabled) {
  const fragmentWithVariables = gql`
    fragment ExampleFragment($arg: String!) on Type {
      field
    }
  `;
  console.log(fragmentWithVariables);
}
