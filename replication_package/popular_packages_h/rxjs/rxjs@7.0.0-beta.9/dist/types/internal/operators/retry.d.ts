/** @prettier */
import { MonoTypeOperatorFunction } from '../types';
export interface RetryConfig {
    count: number;
    resetOnSuccess?: boolean;
}
/**
 * Returns an Observable that mirrors the source Observable with the exception of an `error`. If the source Observable
 * calls `error`, this method will resubscribe to the source Observable for a maximum of `count` resubscriptions (given
 * as a number parameter) rather than propagating the `error` call.
 *
 * ![](retry.png)
 *
 * Any and all items emitted by the source Observable will be emitted by the resulting Observable, even those emitted
 * during failed subscriptions. For example, if an Observable fails at first but emits [1, 2] then succeeds the second
 * time and emits: [1, 2, 3, 4, 5] then the complete stream of emissions and notifications
 * would be: [1, 2, 1, 2, 3, 4, 5, `complete`].
 *
 * ## Example
 * ```ts
 * import { interval, of, throwError } from 'rxjs';
 * import { mergeMap, retry } from 'rxjs/operators';
 *
 * const source = interval(1000);
 * const example = source.pipe(
 *   mergeMap(val => {
 *     if(val > 5){
 *       return throwError('Error!');
 *     }
 *     return of(val);
 *   }),
 *   //retry 2 times on error
 *   retry(2)
 * );
 *
 * const subscribe = example.subscribe({
 *   next: val => console.log(val),
 *   error: val => console.log(`${val}: Retried 2 times then quit!`)
 * });
 *
 * // Output:
 * // 0..1..2..3..4..5..
 * // 0..1..2..3..4..5..
 * // 0..1..2..3..4..5..
 * // "Error!: Retried 2 times then quit!"
 * ```
 *
 * @param {number} count - Number of retry attempts before failing.
 * @param {boolean} resetOnSuccess - When set to `true` every successful emission will reset the error count
 * @return {Observable} The source Observable modified with the retry logic.
 */
export declare function retry<T>(count?: number): MonoTypeOperatorFunction<T>;
export declare function retry<T>(config: RetryConfig): MonoTypeOperatorFunction<T>;
//# sourceMappingURL=retry.d.ts.map