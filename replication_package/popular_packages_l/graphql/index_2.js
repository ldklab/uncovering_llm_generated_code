const { graphql, GraphQLSchema, GraphQLObjectType, GraphQLString } = require('graphql');

// Define the GraphQL schema with a RootQueryType
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      hello: {
        type: GraphQLString,
        resolve: () => 'world',
      },
    },
  }),
});

// Execute a valid query
const validQuery = '{ hello }';
graphql({ schema, source: validQuery })
  .then(result => console.log(result))  // Logs: { data: { hello: "world" } }
  .catch(error => console.error(error));

// Execute an invalid query
const invalidQuery = '{ BoyHowdy }';
graphql({ schema, source: invalidQuery })
  .then(result => console.log(result))  // Logs the error about the non-existent field
  .catch(error => console.error(error));
