/** @prettier */
import { combineLatestInit } from '../observable/combineLatest';
import { ObservableInput, ObservableInputTuple, OperatorFunction, Cons } from '../types';
import { operate } from '../util/lift';
import { argsOrArgArray } from '../util/argsOrArgArray';
import { mapOneOrManyArgs } from '../util/mapOneOrManyArgs';
import { pipe } from '../util/pipe';
import { popResultSelector } from '../util/args';

/* tslint:disable:max-line-length */
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, R>(project: (v1: T) => R): OperatorFunction<T, R>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, T2, R>(v2: ObservableInput<T2>, project: (v1: T, v2: T2) => R): OperatorFunction<T, R>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, T2, T3, R>(
  v2: ObservableInput<T2>,
  v3: ObservableInput<T3>,
  project: (v1: T, v2: T2, v3: T3) => R
): OperatorFunction<T, R>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, T2, T3, T4, R>(
  v2: ObservableInput<T2>,
  v3: ObservableInput<T3>,
  v4: ObservableInput<T4>,
  project: (v1: T, v2: T2, v3: T3, v4: T4) => R
): OperatorFunction<T, R>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, T2, T3, T4, T5, R>(
  v2: ObservableInput<T2>,
  v3: ObservableInput<T3>,
  v4: ObservableInput<T4>,
  v5: ObservableInput<T5>,
  project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5) => R
): OperatorFunction<T, R>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, T2, T3, T4, T5, T6, R>(
  v2: ObservableInput<T2>,
  v3: ObservableInput<T3>,
  v4: ObservableInput<T4>,
  v5: ObservableInput<T5>,
  v6: ObservableInput<T6>,
  project: (v1: T, v2: T2, v3: T3, v4: T4, v5: T5, v6: T6) => R
): OperatorFunction<T, R>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, T2>(v2: ObservableInput<T2>): OperatorFunction<T, [T, T2]>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, T2, T3>(v2: ObservableInput<T2>, v3: ObservableInput<T3>): OperatorFunction<T, [T, T2, T3]>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, T2, T3, T4>(
  v2: ObservableInput<T2>,
  v3: ObservableInput<T3>,
  v4: ObservableInput<T4>
): OperatorFunction<T, [T, T2, T3, T4]>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, T2, T3, T4, T5>(
  v2: ObservableInput<T2>,
  v3: ObservableInput<T3>,
  v4: ObservableInput<T4>,
  v5: ObservableInput<T5>
): OperatorFunction<T, [T, T2, T3, T4, T5]>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, T2, T3, T4, T5, T6>(
  v2: ObservableInput<T2>,
  v3: ObservableInput<T3>,
  v4: ObservableInput<T4>,
  v5: ObservableInput<T5>,
  v6: ObservableInput<T6>
): OperatorFunction<T, [T, T2, T3, T4, T5, T6]>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, R>(...observables: Array<ObservableInput<T> | ((...values: Array<T>) => R)>): OperatorFunction<T, R>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, R>(array: ObservableInput<T>[]): OperatorFunction<T, Array<T>>;
/** @deprecated use {@link combineLatestWith} */
export function combineLatest<T, TOther, R>(
  array: ObservableInput<TOther>[],
  project: (v1: T, ...values: Array<TOther>) => R
): OperatorFunction<T, R>;
/* tslint:enable:max-line-length */

/**
 * @deprecated Deprecated, use {@link combineLatestWith} or static {@link combineLatest}
 */
export function combineLatest<T, R>(...args: (ObservableInput<any> | ((...values: any[]) => R))[]): OperatorFunction<T, unknown> {
  const resultSelector = popResultSelector(args);
  return resultSelector
    ? pipe(combineLatest(...args), mapOneOrManyArgs(resultSelector))
    : operate((source, subscriber) => {
        combineLatestInit([source, ...argsOrArgArray(args)])(subscriber);
      });
}

/**
 * Create an observable that combines the latest values from all passed observables and the source
 * into arrays and emits them.
 *
 * Returns an observable, that when subscribed to, will subscribe to the source observable and all
 * sources provided as arguments. Once all sources emit at least one value, all of the latest values
 * will be emitted as an array. After that, every time any source emits a value, all of the latest values
 * will be emitted as an array.
 *
 * This is a useful operator for eagerly calculating values based off of changed inputs.
 *
 * ### Example
 *
 * Simple calculation from two inputs.
 *
 * ```
 * // Setup: Add two inputs to the page
 * const input1 = document.createElement('input');
 * document.body.appendChild(input1);
 * const input2 = document.createElement('input');
 * document.body.appendChild(input2);
 *
 * // Get streams of changes
 * const input1Changes$ = fromEvent(input1, 'change');
 * const input2Changes$ = fromEvent(input2, 'change');
 *
 * // Combine the changes by adding them together
 * input1Changes$.pipe(
 *   combineLatestWith(input2Changes$),
 *   map(([e1, e2]) => Number(e1.target.value) + Number(e2.target.value)),
 * )
 * .subscribe(x => console.log(x));
 *
 * ```
 * @param otherSources the other sources to subscribe to.
 */
export function combineLatestWith<T, A extends readonly unknown[]>(
  ...otherSources: [...ObservableInputTuple<A>]
): OperatorFunction<T, Cons<T, A>> {
  return combineLatest(...otherSources);
}
