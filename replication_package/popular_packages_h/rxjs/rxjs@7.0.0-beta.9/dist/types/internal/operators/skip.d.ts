/** @prettier */
import { MonoTypeOperatorFunction } from '../types';
/**
 * Returns an Observable that skips the first `count` items emitted by the source Observable.
 *
 * ![](skip.png)
 *
 * Skips the values until the sent notifications are equal or less than provided skip count. It raises
 * an error if skip count is equal or more than the actual number of emits and source raises an error.
 *
 * ## Example
 * Skip the values before the emission
 * ```ts
 * import { interval } from 'rxjs';
 * import { skip } from 'rxjs/operators';
 *
 * //emit every half second
 * const source = interval(500);
 * //skip the first 10 emitted values
 * const example = source.pipe(skip(10));
 * //output: 10...11...12...13........
 * const subscribe = example.subscribe(val => console.log(val));
 * ```
 *
 * @see {@link last}
 * @see {@link skipWhile}
 * @see {@link skipUntil}
 * @see {@link skipLast}
 *
 * @param {Number} count - The number of times, items emitted by source Observable should be skipped.
 * @return {Observable} An Observable that skips values emitted by the source Observable.
 */
export declare function skip<T>(count: number): MonoTypeOperatorFunction<T>;
//# sourceMappingURL=skip.d.ts.map