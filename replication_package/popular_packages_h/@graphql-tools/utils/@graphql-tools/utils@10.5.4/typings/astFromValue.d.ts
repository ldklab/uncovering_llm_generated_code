import { GraphQLInputType, ValueNode } from 'graphql';
import { Maybe } from './types.js';
/**
 * Produces a GraphQL Value AST given a JavaScript object.
 * Function will match JavaScript/JSON values to GraphQL AST schema format
 * by using suggested GraphQLInputType. For example:
 *
 *     astFromValue("value", GraphQLString)
 *
 * A GraphQL type must be provided, which will be used to interpret different
 * JavaScript values.
 *
 * | JSON Value    | GraphQL Value        |
 * | ------------- | -------------------- |
 * | Object        | Input Object         |
 * | Array         | List                 |
 * | Boolean       | Boolean              |
 * | String        | String / Enum Value  |
 * | Number        | Int / Float          |
 * | BigInt        | Int                  |
 * | Unknown       | Enum Value           |
 * | null          | NullValue            |
 *
 */
export declare function astFromValue(value: unknown, type: GraphQLInputType): Maybe<ValueNode>;
