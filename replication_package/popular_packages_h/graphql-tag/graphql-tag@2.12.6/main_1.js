// Expose the gql function when requiring this module for backward compatibility.
const graphqlTag = require('./lib/graphql-tag.umd.js');
module.exports = graphqlTag.gql;
