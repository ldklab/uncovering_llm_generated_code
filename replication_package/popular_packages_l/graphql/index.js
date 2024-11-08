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

// Define a GraphQL query
const source = '{ hello }';  // Query string asking for 'hello' field

// Execute the query against the defined schema
graphql({ schema, source }).then((result) => {
  // Log the result { data: { hello: "world" } }
  console.log(result);
}).catch(error => console.error(error));

// Define a query that will cause an error
const errorSource = '{ BoyHowdy }';  // 'BoyHowdy' is not a defined field

// Execute the query that will produce an error
graphql({ schema, errorSource }).then((result) => {
  // Expect an error message about the invalid field
  console.log(result);
}).catch(error => console.error(error));
