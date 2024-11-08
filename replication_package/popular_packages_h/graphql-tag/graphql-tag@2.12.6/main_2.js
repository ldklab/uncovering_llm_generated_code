// Export the `gql` function directly to maintain backward compatibility.
// This allows requiring 'graphql-tag' to return the `gql` function directly.
const graphqlTag = require('./lib/graphql-tag.umd.js');
module.exports = graphqlTag.gql;
