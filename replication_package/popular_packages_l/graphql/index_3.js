// Import necessary functions and types from the 'graphql' package
import {
  graphql,
  GraphQLSchema,
  GraphQLObjectType,
  GraphQLString,
} from 'graphql';

// Define a simple GraphQL type schema
const schema = new GraphQLSchema({
  // Define the Query type, which is the entry point for queries
  query: new GraphQLObjectType({
    name: 'RootQueryType',  // Naming the query type
    fields: {  // Define available fields for this query type
      hello: {
        type: GraphQLString,  // Specify that 'hello' returns a String
        resolve() {
          return 'world';  // Resolve function returns a constant value
        },
      },
    },
  }),
});

// Function to execute a GraphQL query against the schema and log the result
const executeQuery = async (query) => {
  try {
    const result = await graphql({ schema, source: query });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
};

// Define a GraphQL query
const query = '{ hello }';  // Query asking for 'hello' field

// Call function to execute and log the result of the valid query
executeQuery(query);

// Define a query that will cause an error
const invalidQuery = '{ BoyHowdy }';  // Query asks for a field not in the schema

// Call function to execute that will result in an error due to undefined field
executeQuery(invalidQuery);
