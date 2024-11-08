// Ensure backwards compatibility by returning the gql function from 'graphql-tag'
module.exports = require('./lib/graphql-tag.umd.js').gql;
