// Import necessary functions and types from the 'graphql' package
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

// Define the GraphQL schema with a simple root query
const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'RootQueryType', // Name of the root query
    fields: {
      // Define the fields available in this root query
      hello: {
        type: GraphQLString, // This field returns a String
        resolve() {
          return 'world'; // The resolver always returns 'world'
        },
      },
    },
  }),
});

// Define a valid GraphQL query to fetch the 'hello' field
const validQuery = '{ hello }';

// Execute the valid query against the schema
graphql({ schema, source: validQuery })
  .then((result) => {
    console.log(result); // Output: { data: { hello: "world" } }
  })
  .catch((error) => console.error(error)); // Handle/query execution errors

// Define an invalid GraphQL query that references an undefined field
const invalidQuery = '{ BoyHowdy }';

// Execute the invalid query against the schema
graphql({ schema, source: invalidQuery })
  .then((result) => {
    console.log(result); // Expect an error about the undefined field
  })
  .catch((error) => console.error(error)); // Handle/query execution errors
