// Import necessary functions and types from the 'graphql' package
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

// Define a simple GraphQL schema with a RootQueryType
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
      hello: {
        type: GraphQLString,
        resolve() {
          return 'world';
        },
      },
    },
  }),
});

// Define the query to be executed
const validQuery = '{ hello }';

// Execute the valid query
graphql({ schema, source: validQuery })
  .then((result) => {
    // The result should be { data: { hello: "world" } }
    console.log(result);
  })
  .catch((error) => console.error(error));

// Define an invalid query that will result in an error
const invalidQuery = '{ BoyHowdy }';

// Execute the invalid query
graphql({ schema, source: invalidQuery })
  .then((result) => {
    console.log(result);
  })
  .catch((error) => console.error(error));
