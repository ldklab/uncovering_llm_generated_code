import type { MergeParameters } from './versionedTypes'
import type { weakMapMemoize } from './weakMapMemoize'

export type { MergeParameters } from './versionedTypes'

/*
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 *
 * Reselect Data Types
 *
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

/**
 * A standard selector function.
 * @template State - The first value, often a Redux root state object.
 * @template Result - The final result returned by the selector.
 * @template Params - All additional arguments passed into the selector.
 *
 * @public
 */
export type Selector<
  State = any,
  Result = unknown,
  Params extends readonly any[] = any[]
> = Distribute<
  /**
   * A function that takes a state and returns data that is based on that state.
   *
   * @param state - The first argument, often a Redux root state object.
   * @param params - All additional arguments passed into the selector.
   * @returns A derived value from the state.
   */
  (state: State, ...params: FallbackIfNever<Params, []>) => Result
>

/**
 * An array of input selectors.
 *
 * @public
 */
export type SelectorArray<State = any> = readonly Selector<State>[]

/**
 * Extracts an array of all return types from all input selectors.
 *
 * @public
 */
export type SelectorResultArray<Selectors extends SelectorArray> =
  ExtractReturnType<Selectors>

/**
 * The options object used inside `createSelector` and `createSelectorCreator`.
 *
 * @template MemoizeFunction - The type of the memoize function that is used to memoize the `resultFunc` inside `createSelector` (e.g., `lruMemoize` or `weakMapMemoize`).
 * @template ArgsMemoizeFunction - The type of the optional memoize function that is used to memoize the arguments passed into the output selector generated by `createSelector` (e.g., `lruMemoize` or `weakMapMemoize`). If none is explicitly provided, `weakMapMemoize` will be used.
 * @template OverrideMemoizeFunction - The type of the optional `memoize` function that could be passed into the options object inside `createSelector` to override the original `memoize` function that was initially passed into `createSelectorCreator`.
 * @template OverrideArgsMemoizeFunction - The type of the optional `argsMemoize` function that could be passed into the options object inside `createSelector` to override the original `argsMemoize` function that was initially passed into `createSelectorCreator`. If none was initially provided, `weakMapMemoize` will be used.
 *
 * @public
 */
export interface CreateSelectorOptions<
  MemoizeFunction extends UnknownMemoizer = typeof weakMapMemoize,
  ArgsMemoizeFunction extends UnknownMemoizer = typeof weakMapMemoize,
  OverrideMemoizeFunction extends UnknownMemoizer = never,
  OverrideArgsMemoizeFunction extends UnknownMemoizer = never
> {
  /**
   * Reselect performs additional checks in development mode to help identify
   * and warn about potential issues in selector behavior. This option
   * allows you to customize the behavior of these checks per selector.
   *
   * @see {@link https://reselect.js.org/api/development-only-stability-checks Development-Only Stability Checks}
   *
   * @since 5.0.0
   */
  devModeChecks?: Partial<DevModeChecks>

  /**
   * The memoize function that is used to memoize the {@linkcode OutputSelectorFields.resultFunc resultFunc}
   * inside `createSelector` (e.g., `lruMemoize` or `weakMapMemoize`).
   *
   * When passed directly into `createSelector`, it overrides the `memoize` function initially passed into `createSelectorCreator`.
   *
   * @example
   * ```ts
   * import { createSelector, weakMapMemoize } from 'reselect'
   *
   * const selectItemsByCategory = createSelector(
   *   [
   *     (state: RootState) => state.items,
   *     (state: RootState, category: string) => category
   *   ],
   *   (items, category) => items.filter(item => item.category === category),
   *   { memoize: weakMapMemoize }
   * )
   * ```
   *
   * @since 5.0.0
   */
  memoize?: FallbackIfNever<OverrideMemoizeFunction, MemoizeFunction>

  /**
   * The optional memoize function that is used to memoize the arguments
   * passed into the output selector generated by `createSelector`
   * (e.g., `lruMemoize` or `weakMapMemoize`).
   *
   * When passed directly into `createSelector`, it overrides the
   * `argsMemoize` function initially passed into `createSelectorCreator`.
   * If none was initially provided, `weakMapMemoize` will be used.
   *
   * @example
   * ```ts
   * import { createSelector, weakMapMemoize } from 'reselect'
   *
   * const selectItemsByCategory = createSelector(
   *   [
   *     (state: RootState) => state.items,
   *     (state: RootState, category: string) => category
   *   ],
   *   (items, category) => items.filter(item => item.category === category),
   *   { argsMemoize: weakMapMemoize }
   * )
   * ```
   *
   * @default weakMapMemoize
   *
   * @since 5.0.0
   */
  argsMemoize?: FallbackIfNever<
    OverrideArgsMemoizeFunction,
    ArgsMemoizeFunction
  >

  /**
   * Optional configuration options for the {@linkcode CreateSelectorOptions.memoize memoize} function.
   * These options are passed to the {@linkcode CreateSelectorOptions.memoize memoize} function as the second argument.
   *
   * @since 5.0.0
   */
  memoizeOptions?: OverrideMemoizeOptions<
    MemoizeFunction,
    OverrideMemoizeFunction
  >

  /**
   * Optional configuration options for the {@linkcode CreateSelectorOptions.argsMemoize argsMemoize} function.
   * These options are passed to the {@linkcode CreateSelectorOptions.argsMemoize argsMemoize} function as the second argument.
   *
   * @since 5.0.0
   */
  argsMemoizeOptions?: OverrideMemoizeOptions<
    ArgsMemoizeFunction,
    OverrideArgsMemoizeFunction
  >
}

/**
 * The additional fields attached to the output selector generated by `createSelector`.
 *
 * **Note**: Although {@linkcode CreateSelectorOptions.memoize memoize}
 * and {@linkcode CreateSelectorOptions.argsMemoize argsMemoize} are included in the attached fields,
 * the fields themselves are independent of the type of
 * {@linkcode CreateSelectorOptions.memoize memoize} and {@linkcode CreateSelectorOptions.argsMemoize argsMemoize} functions.
 * Meaning this type is not going to generate additional fields based on what functions we use to memoize our selectors.
 *
 * _This type is not to be confused with {@linkcode ExtractMemoizerFields ExtractMemoizerFields}._
 *
 * @template InputSelectors - The type of the input selectors.
 * @template Result - The type of the result returned by the `resultFunc`.
 * @template MemoizeFunction - The type of the memoize function that is used to memoize the `resultFunc` inside `createSelector` (e.g., `lruMemoize` or `weakMapMemoize`).
 * @template ArgsMemoizeFunction - The type of the optional memoize function that is used to memoize the arguments passed into the output selector generated by `createSelector` (e.g., `lruMemoize` or `weakMapMemoize`). If none is explicitly provided, `weakMapMemoize` will be used.
 *
 * @public
 */
export type OutputSelectorFields<
  InputSelectors extends SelectorArray = SelectorArray,
  Result = unknown,
  MemoizeFunction extends UnknownMemoizer = typeof weakMapMemoize,
  ArgsMemoizeFunction extends UnknownMemoizer = typeof weakMapMemoize
> = {
  /**
   * The final function passed to `createSelector`. Otherwise known as the `combiner`.
   */
  resultFunc: Combiner<InputSelectors, Result>

  /**
   * The memoized version of {@linkcode OutputSelectorFields.resultFunc resultFunc}.
   */
  memoizedResultFunc: Combiner<InputSelectors, Result> &
    ExtractMemoizerFields<MemoizeFunction>

  /**
   * @Returns The last result calculated by {@linkcode OutputSelectorFields.memoizedResultFunc memoizedResultFunc}.
   */
  lastResult: () => Result

  /**
   * The array of the input selectors used by `createSelector` to compose the
   * combiner ({@linkcode OutputSelectorFields.memoizedResultFunc memoizedResultFunc}).
   */
  dependencies: InputSelectors

  /**
   * Counts the number of times {@linkcode OutputSelectorFields.memoizedResultFunc memoizedResultFunc} has been recalculated.
   */
  recomputations: () => number

  /**
   * Resets the count of {@linkcode OutputSelectorFields.recomputations recomputations} count to 0.
   */
  resetRecomputations: () => void

  /**
   * Counts the number of times the input selectors ({@linkcode OutputSelectorFields.dependencies dependencies})
   * have been recalculated. This is distinct from {@linkcode OutputSelectorFields.recomputations recomputations},
   * which tracks the recalculations of the result function.
   *
   * @since 5.0.0
   */
  dependencyRecomputations: () => number

  /**
   * Resets the count {@linkcode OutputSelectorFields.dependencyRecomputations dependencyRecomputations}
   * for the input selectors ({@linkcode OutputSelectorFields.dependencies dependencies})
   * of a memoized selector.
   *
   * @since 5.0.0
   */
  resetDependencyRecomputations: () => void
} & Simplify<
  Required<
    Pick<
      CreateSelectorOptions<MemoizeFunction, ArgsMemoizeFunction>,
      'argsMemoize' | 'memoize'
    >
  >
>

/**
 * Represents the actual selectors generated by `createSelector`.
 *
 * @template InputSelectors - The type of the input selectors.
 * @template Result - The type of the result returned by the `resultFunc`.
 * @template MemoizeFunction - The type of the memoize function that is used to memoize the `resultFunc` inside `createSelector` (e.g., `lruMemoize` or `weakMapMemoize`).
 * @template ArgsMemoizeFunction - The type of the optional memoize function that is used to memoize the arguments passed into the output selector generated by `createSelector` (e.g., `lruMemoize` or `weakMapMemoize`). If none is explicitly provided, `weakMapMemoize` will be used.
 *
 * @public
 */
export type OutputSelector<
  InputSelectors extends SelectorArray = SelectorArray,
  Result = unknown,
  MemoizeFunction extends UnknownMemoizer = typeof weakMapMemoize,
  ArgsMemoizeFunction extends UnknownMemoizer = typeof weakMapMemoize
> = Selector<
  GetStateFromSelectors<InputSelectors>,
  Result,
  GetParamsFromSelectors<InputSelectors>
> &
  ExtractMemoizerFields<ArgsMemoizeFunction> &
  OutputSelectorFields<
    InputSelectors,
    Result,
    MemoizeFunction,
    ArgsMemoizeFunction
  >

/**
 * A function that takes input selectors' return values as arguments and returns a result. Otherwise known as `resultFunc`.
 *
 * @template InputSelectors - An array of input selectors.
 * @template Result - Result returned by `resultFunc`.
 *
 * @public
 */
export type Combiner<InputSelectors extends SelectorArray, Result> = Distribute<
  /**
   * A function that takes input selectors' return values as arguments and returns a result. Otherwise known as `resultFunc`.
   *
   * @param resultFuncArgs - Return values of input selectors.
   * @returns The return value of {@linkcode OutputSelectorFields.resultFunc resultFunc}.
   */
  (...resultFuncArgs: SelectorResultArray<InputSelectors>) => Result
>

/**
 * A standard function returning true if two values are considered equal.
 *
 * @public
 */
export type EqualityFn<T = any> = (a: T, b: T) => boolean

/**
 * The frequency of development mode checks.
 *
 * @since 5.0.0
 * @public
 */
export type DevModeCheckFrequency = 'always' | 'once' | 'never'

/**
 * Represents the configuration for development mode checks.
 *
 * @since 5.0.0
 * @public
 */
export interface DevModeChecks {
  /**
   * Overrides the global input stability check for the selector.
   * - `once` - Run only the first time the selector is called.
   * - `always` - Run every time the selector is called.
   * - `never` - Never run the input stability check.
   *
   * @default 'once'
   *
   * @see {@link https://reselect.js.org/api/development-only-stability-checks Development-Only Stability Checks}
   * @see {@link https://reselect.js.org/api/development-only-stability-checks#inputstabilitycheck `inputStabilityCheck`}
   * @see {@link https://reselect.js.org/api/development-only-stability-checks#2-per-selector-by-passing-an-inputstabilitycheck-option-directly-to- per-selector-configuration}
   *
   * @since 5.0.0
   */
  inputStabilityCheck: DevModeCheckFrequency

  /**
   * Overrides the global identity function check for the selector.
   * - `once` - Run only the first time the selector is called.
   * - `always` - Run every time the selector is called.
   * - `never` - Never run the identity function check.
   *
   * @default 'once'
   *
   * @see {@link https://reselect.js.org/api/development-only-stability-checks Development-Only Stability Checks}
   * @see {@link https://reselect.js.org/api/development-only-stability-checks#identityfunctioncheck `identityFunctionCheck`}
   * @see {@link https://reselect.js.org/api/development-only-stability-checks#2-per-selector-by-passing-an-identityfunctioncheck-option-directly-to- per-selector-configuration}
   *
   * @since 5.0.0
   */
  identityFunctionCheck: DevModeCheckFrequency
}

/**
 * Represents execution information for development mode checks.
 *
 * @public
 * @since 5.0.0
 */
export type DevModeChecksExecutionInfo = {
  [K in keyof DevModeChecks]: {
    /**
     * A boolean indicating whether the check should be executed.
     */
    shouldRun: boolean

    /**
     * The function to execute for the check.
     */
    run: AnyFunction
  }
}

/**
 * Determines the combined single "State" type (first arg) from all input selectors.
 *
 * @public
 */
export type GetStateFromSelectors<Selectors extends SelectorArray> =
  MergeParameters<Selectors>[0]

/**
 * Determines the combined  "Params" type (all remaining args) from all input selectors.
 *
 * @public
 */
export type GetParamsFromSelectors<Selectors extends SelectorArray> = ArrayTail<
  MergeParameters<Selectors>
>

/**
 * Any Memoizer function. A memoizer is a function that accepts another function and returns it.
 *
 * @template FunctionType - The type of the function that is memoized.
 *
 * @public
 */
export type UnknownMemoizer<
  FunctionType extends UnknownFunction = UnknownFunction
> = (func: FunctionType, ...options: any[]) => FunctionType

/**
 * Extracts the options type for a memoization function based on its parameters.
 * The first parameter of the function is expected to be the function to be memoized,
 * followed by options for the memoization process.
 *
 * @template MemoizeFunction - The type of the memoize function to be checked.
 *
 * @public
 */
export type MemoizeOptionsFromParameters<
  MemoizeFunction extends UnknownMemoizer
> =
  | (
      | NonFunctionType<DropFirstParameter<MemoizeFunction>[0]>
      | FunctionType<DropFirstParameter<MemoizeFunction>[0]>
    )
  | (
      | NonFunctionType<DropFirstParameter<MemoizeFunction>[number]>
      | FunctionType<DropFirstParameter<MemoizeFunction>[number]>
    )[]

/**
 * Derive the type of memoize options object based on whether the memoize function itself was overridden.
 *
 * _This type can be used for both `memoizeOptions` and `argsMemoizeOptions`._
 *
 * @template MemoizeFunction - The type of the `memoize` or `argsMemoize` function initially passed into `createSelectorCreator`.
 * @template OverrideMemoizeFunction - The type of the optional `memoize` or `argsMemoize` function passed directly into `createSelector` which then overrides the original `memoize` or `argsMemoize` function passed into `createSelectorCreator`.
 *
 * @public
 */
export type OverrideMemoizeOptions<
  MemoizeFunction extends UnknownMemoizer,
  OverrideMemoizeFunction extends UnknownMemoizer = never
> = IfNever<
  OverrideMemoizeFunction,
  Simplify<MemoizeOptionsFromParameters<MemoizeFunction>>,
  Simplify<MemoizeOptionsFromParameters<OverrideMemoizeFunction>>
>

/**
 * Extracts the additional properties or methods that a memoize function attaches to
 * the function it memoizes (e.g., `clearCache`).
 *
 * @template MemoizeFunction - The type of the memoize function to be checked.
 *
 * @public
 */
export type ExtractMemoizerFields<MemoizeFunction extends UnknownMemoizer> =
  Simplify<OmitIndexSignature<ReturnType<MemoizeFunction>>>

/**
 * Represents the additional properties attached to a function memoized by `reselect`.
 *
 * `lruMemoize`, `weakMapMemoize` and `autotrackMemoize` all return these properties.
 *
 * @see {@linkcode ExtractMemoizerFields ExtractMemoizerFields}
 *
 * @public
 */
export type DefaultMemoizeFields = {
  /**
   * Clears the memoization cache associated with a memoized function.
   * This method is typically used to reset the state of the cache, allowing
   * for the garbage collection of previously memoized results and ensuring
   * that future calls to the function recompute the results.
   */
  clearCache: () => void
  resultsCount: () => number
  resetResultsCount: () => void
}

/*
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 *
 * Reselect Internal Utility Types
 *
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 */

/**
 * Any function with any arguments.
 *
 * @internal
 */
export type AnyFunction = (...args: any[]) => any

/**
 * Any function with unknown arguments.
 *
 * @internal
 */
export type UnknownFunction = (...args: unknown[]) => unknown

/**
 * When a generic type parameter is using its default value of `never`, fallback to a different type.
 *
 * @template T - Type to be checked.
 * @template FallbackTo - Type to fallback to if `T` resolves to `never`.
 *
 * @internal
 */
export type FallbackIfNever<T, FallbackTo> = IfNever<T, FallbackTo, T>

/**
 * Extracts the non-function part of a type.
 *
 * @template T - The input type to be refined by excluding function types and index signatures.
 *
 * @internal
 */
export type NonFunctionType<T> = Simplify<
  OmitIndexSignature<Exclude<T, AnyFunction>>
>

/**
 * Extracts the function part of a type.
 *
 * @template T - The input type to be refined by extracting function types.
 *
 * @internal
 */
export type FunctionType<T> = Extract<T, AnyFunction>

/**
 * Extracts the return type from all functions as a tuple.
 *
 * @internal
 */
export type ExtractReturnType<FunctionsArray extends readonly AnyFunction[]> = {
  [Index in keyof FunctionsArray]: FunctionsArray[Index] extends FunctionsArray[number]
    ? FallbackIfUnknown<ReturnType<FunctionsArray[Index]>, any>
    : never
}

/**
 * Utility type to infer the type of "all params of a function except the first",
 * so we can determine what arguments a memoize function accepts.
 *
 * @internal
 */
export type DropFirstParameter<Func extends AnyFunction> = Func extends (
  firstArg: any,
  ...restArgs: infer Rest
) => any
  ? Rest
  : never

/**
 * Distributes over a type. It is used mostly to expand a function type
 * in hover previews while preserving their original JSDoc information.
 *
 * If preserving JSDoc information is not a concern, you can use {@linkcode ExpandFunction ExpandFunction}.
 *
 * @template T The type to be distributed.
 *
 * @internal
 */
export type Distribute<T> = T extends T ? T : never

/**
 * Extracts the type of the first element of an array or tuple.
 *
 * @internal
 */
export type FirstArrayElement<ArrayType> = ArrayType extends readonly [
  unknown,
  ...unknown[]
]
  ? ArrayType[0]
  : never

/**
 * Extracts the type of an array or tuple minus the first element.
 *
 * @internal
 */
export type ArrayTail<ArrayType> = ArrayType extends readonly [
  unknown,
  ...infer Tail
]
  ? Tail
  : []

/**
 * An alias for type `{}`. Represents any value that is not `null` or `undefined`.
 * It is mostly used for semantic purposes to help distinguish between an
 * empty object type and `{}` as they are not the same.
 *
 * @internal
 */
export type AnyNonNullishValue = NonNullable<unknown>

/**
 * Same as {@linkcode AnyNonNullishValue AnyNonNullishValue} but aliased
 * for semantic purposes. It is intended to be used in scenarios where
 * a recursive type definition needs to be interrupted to ensure type safety
 * and to avoid excessively deep recursion that could lead to performance issues.
 *
 * @internal
 */
export type InterruptRecursion = AnyNonNullishValue

/*
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 *
 * External/Copied Utility Types
 *
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 *
 */

/**
 * An if-else-like type that resolves depending on whether the given type is `never`.
 * This is mainly used to conditionally resolve the type of a `memoizeOptions` object based on whether `memoize` is provided or not.
 * @see {@link https://github.com/sindresorhus/type-fest/blob/main/source/if-never.d.ts Source}
 *
 * @internal
 */
export type IfNever<T, TypeIfNever, TypeIfNotNever> = [T] extends [never]
  ? TypeIfNever
  : TypeIfNotNever

/**
 * Omit any index signatures from the given object type, leaving only explicitly defined properties.
 * This is mainly used to remove explicit `any`s from the return type of some memoizers (e.g, `microMemoize`).
 *
 * __Disclaimer:__ When used on an intersection of a function and an object,
 * the function is erased.
 *
 * @see {@link https://github.com/sindresorhus/type-fest/blob/main/source/omit-index-signature.d.ts Source}
 *
 * @internal
 */
export type OmitIndexSignature<ObjectType> = {
  [KeyType in keyof ObjectType as {} extends Record<KeyType, unknown>
    ? never
    : KeyType]: ObjectType[KeyType]
}

/**
 * The infamous "convert a union type to an intersection type" hack
 * @see {@link https://github.com/sindresorhus/type-fest/blob/main/source/union-to-intersection.d.ts Source}
 * @see {@link https://github.com/microsoft/TypeScript/issues/29594 Reference}
 *
 * @internal
 */
export type UnionToIntersection<Union> =
  // `extends unknown` is always going to be the case and is used to convert the
  // `Union` into a [distributive conditional
  // type](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-8.html#distributive-conditional-types).
  (
    Union extends unknown
      ? // The union type is used as the only argument to a function since the union
        // of function arguments is an intersection.
        (distributedUnion: Union) => void
      : // This won't happen.
        never
  ) extends // Infer the `Intersection` type since TypeScript represents the positional
  // arguments of unions of functions as an intersection of the union.
  (mergedIntersection: infer Intersection) => void
    ? // The `& Union` is to allow indexing by the resulting type
      Intersection & Union
    : never

/**
 * Code to convert a union of values into a tuple.
 * @see {@link https://stackoverflow.com/a/55128956/62937 Source}
 *
 * @internal
 */
type Push<T extends any[], V> = [...T, V]

/**
 * @see {@link https://stackoverflow.com/a/55128956/62937 Source}
 *
 * @internal
 */
type LastOf<T> = UnionToIntersection<
  T extends any ? () => T : never
> extends () => infer R
  ? R
  : never

/**
 * TS4.1+
 * @see {@link https://stackoverflow.com/a/55128956/62937 Source}
 *
 * @internal
 */
export type TuplifyUnion<
  T,
  L = LastOf<T>,
  N = [T] extends [never] ? true : false
> = true extends N ? [] : Push<TuplifyUnion<Exclude<T, L>>, L>

/**
 * Converts "the values of an object" into a tuple, like a type-level `Object.values()`
 * @see {@link https://stackoverflow.com/a/68695508/62937 Source}
 *
 * @internal
 */
export type ObjectValuesToTuple<
  T,
  KS extends any[] = TuplifyUnion<keyof T>,
  R extends any[] = []
> = KS extends [infer K, ...infer KT]
  ? ObjectValuesToTuple<T, KT, [...R, T[K & keyof T]]>
  : R

/**
 * Create a type that makes the given keys required.
 * The remaining keys are kept as is.
 *
 * @see {@link https://github.com/sindresorhus/type-fest/blob/main/source/set-required.d.ts Source}
 *
 * @internal
 */
export type SetRequired<BaseType, Keys extends keyof BaseType> = Omit<
  BaseType,
  Keys
> &
  Required<Pick<BaseType, Keys>>

/**
 * An if-else-like type that resolves depending on whether the given type is `unknown`.
 * @see {@link https://github.com/sindresorhus/type-fest/blob/main/source/if-unknown.d.ts Source}
 *
 * @internal
 */
export type IfUnknown<T, TypeIfUnknown, TypeIfNotUnknown> = unknown extends T // `T` can be `unknown` or `any`
  ? [T] extends [null] // `any` can be `null`, but `unknown` can't be
    ? TypeIfNotUnknown
    : TypeIfUnknown
  : TypeIfNotUnknown

/**
 * When a type is resolves to `unknown`, fallback to a different type.
 *
 * @template T - Type to be checked.
 * @template FallbackTo - Type to fallback to if `T` resolves to `unknown`.
 *
 * @internal
 */
export type FallbackIfUnknown<T, FallbackTo> = IfUnknown<T, FallbackTo, T>

/**
 *
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 *
 * Type Expansion Utilities
 *
 * -----------------------------------------------------------------------------
 * -----------------------------------------------------------------------------
 *
 */

/**
 * Check whether `U` contains `U1`.
 * @see {@link https://millsp.github.io/ts-toolbelt/modules/union_has.html Source}
 *
 * @internal
 */
export type Has<U, U1> = [U1] extends [U] ? 1 : 0

/**
 * @internal
 */
export type Boolean2 = 0 | 1

/**
 * @internal
 */
export type If2<B extends Boolean2, Then, Else = never> = B extends 1
  ? Then
  : Else

/**
 * @internal
 */
export type BuiltIn =
  | Function
  | Error
  | Date
  | { readonly [Symbol.toStringTag]: string }
  | RegExp
  | Generator

/**
 * Expand an item a single level.
 * @see {@link https://stackoverflow.com/a/69288824/62937 Source}
 *
 * @internal
 */
export type Expand<T> = T extends (...args: infer A) => infer R
  ? (...args: Expand<A>) => Expand<R>
  : T extends infer O
  ? { [K in keyof O]: O[K] }
  : never

/**
 * Expand an item recursively.
 * @see {@link https://stackoverflow.com/a/69288824/62937 Source}
 *
 * @internal
 */
export type ExpandRecursively<T> = T extends (...args: infer A) => infer R
  ? (...args: ExpandRecursively<A>) => ExpandRecursively<R>
  : T extends object
  ? T extends infer O
    ? { [K in keyof O]: ExpandRecursively<O[K]> }
    : never
  : T

/**
 * @internal
 */
export type Identity<T> = T

/**
 * Another form of type value expansion
 * @see {@link https://github.com/microsoft/TypeScript/issues/35247 Source}
 *
 * @internal
 */
export type Mapped<T> = Identity<{ [k in keyof T]: T[k] }>

/**
 * This utility type is primarily used to expand a function type in order to
 * improve its visual display in hover previews within IDEs.
 *
 * __Disclaimer:__ Functions expanded using this type will not display their
 * original JSDoc information in hover previews.
 *
 * @template FunctionType - The type of the function to be expanded.
 *
 * @internal
 */
export type ExpandFunction<FunctionType extends AnyFunction> =
  FunctionType extends FunctionType
    ? (...args: Parameters<FunctionType>) => ReturnType<FunctionType>
    : never

/**
 * Useful to flatten the type output to improve type hints shown in editors.
 * And also to transform an interface into a type to aide with assignability.
 * @see {@link https://github.com/sindresorhus/type-fest/blob/main/source/simplify.d.ts Source}
 *
 * @internal
 */
export type Simplify<T> = T extends AnyFunction
  ? T
  : {
      [KeyType in keyof T]: T[KeyType]
    } & AnyNonNullishValue

/**
 * Fully expand a type, deeply
 * @see {@link https://github.com/millsp/ts-toolbelt Any.Compute}
 *
 * @internal
 */
export type ComputeDeep<A, Seen = never> = A extends BuiltIn
  ? A
  : If2<
      Has<Seen, A>,
      A,
      A extends any[]
        ? A extends Record<PropertyKey, any>[]
          ? ({
              [K in keyof A[number]]: ComputeDeep<A[number][K], A | Seen>
            } & unknown)[]
          : A
        : A extends readonly any[]
        ? A extends readonly Record<PropertyKey, any>[]
          ? readonly ({
              [K in keyof A[number]]: ComputeDeep<A[number][K], A | Seen>
            } & unknown)[]
          : A
        : { [K in keyof A]: ComputeDeep<A[K], A | Seen> } & unknown
    >