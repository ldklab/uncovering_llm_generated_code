const { parse } = require('graphql');
const cache = {};

function gql(literals, ...placeholders) {
  const query = literals
    .map((literal, index) => literal + (placeholders[index] || ''))
    .join('');
  
  if (!cache[query]) {
    cache[query] = parse(query);
  }
  
  return cache[query];
}

exports.gql = gql;

let fragmentWarningsEnabled = true;

exports.disableFragmentWarnings = () => {
  fragmentWarningsEnabled = false;
};

const fragmentVariableSupport = { enabled: false };

exports.enableExperimentalFragmentVariables = () => {
  fragmentVariableSupport.enabled = true;
};

exports.disableExperimentalFragmentVariables = () => {
  fragmentVariableSupport.enabled = false;
};

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
const exampleQuery = gql`
  {
    user(id: 5) {
      firstName
      lastName
    }
  }
`;

console.log(JSON.stringify(exampleQuery, null, 2)); // Visualize the AST
checkFragmentWarnings(exampleQuery);

if (fragmentVariableSupport.enabled) {
  const fragmentWithVariables = gql`
  fragment ExampleFragment($arg: String!) on Type {
    field
  }
  `;
  console.log(fragmentWithVariables);
}
