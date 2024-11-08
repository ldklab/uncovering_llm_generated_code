// Ensure backward compatibility by exporting the gql function directly
const gqlFunction = require('./lib/graphql-tag.umd.js').gql;
module.exports = gqlFunction;
