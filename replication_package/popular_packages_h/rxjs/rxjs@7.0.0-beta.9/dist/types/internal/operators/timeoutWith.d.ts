import { ObservableInput, OperatorFunction, SchedulerLike } from '../types';
/**
 * If the time of the Date object passed arrives before the first value arrives from the source, it will unsubscribe
 * from the source and switch the subscription to another observable.
 *
 * <span class="informal">Use to switch to a different observable if the first value doesn't arrive by a specific time</span>
 *
 * Can be used to set a timeout only for the first value, however it's recommended to use the {@link timeout} operator with
 * the `first` configuration to get that effect.
 *
 * @param dueBy The exact time, as a `Date`, at which the timeout will be triggered if the first value does not arrive.
 * @param switchTo The observable to switch to when timeout occurs.
 * @param scheduler The scheduler to use with time-related operations within this operator. Defaults to {@link asyncScheduler}
 * @deprecated This will be removed in v8. Use the configuration object with {@link timeout} instead: `timeoutWith(someDate, a$, scheduler)` -> `timeout({ first: someDate, with: () => a$, scheduler })`
 */
export declare function timeoutWith<T, R>(dueBy: Date, switchTo: ObservableInput<R>, scheduler?: SchedulerLike): OperatorFunction<T, T | R>;
/**
 * When the passed timespan ellapses before the source emits any given value, it will unsubscribe from the source,
 * and switch the subscription to another observable.
 *
 * <span class="informal">Used to switch to a different observable if your source is being slow</span>
 *
 * Useful in cases where:
 *
 * - You want to switch to a different source that may be faster
 * - You want to notify a user that the data stream is slow
 * - You want to emit a custom error rather than the {@link TimeoutError} emitted
 *   by the default usage of {@link timeout}.
 *
 * ## Example
 *
 * Fallback to a faster observable
 *
 * ```ts
 * import { interval } from 'rxjs';
 * import { timeoutWith } from 'rxjs/operators';
 *
 * const slow$ = interval(1000);
 * const faster$ = interval(500);
 *
 * slow$.pipe(
 *    timeoutWith(900, faster$)
 * )
 * .subscribe(console.log)
 * ```
 *
 * ### Example
 *
 * Emit your own custom timeout error
 *
 * ```ts
 * import { interval, throwError } from 'rxjs';
 * import { timeoutWith } from 'rxjs/operators';
 *
 * class CustomTimeoutError extends Error {
 *   constructor() {
 *      super('It was too slow');
 *      this.name = 'CustomTimeoutError';
 *   }
 * }
 *
 * const slow = interval(1000);
 *
 * slow$.pipe(
 *    timeoutWith(900, throwError(new CustomTimeoutError()))
 * )
 * .subscribe({
 *    error: console.error
 * })
 * ```
 * @param waitFor The time allowed between values from the source before timeout is triggered.
 * @param switchTo The observable to switch to when timeout occurs.
 * @param scheduler The scheduler to use with time-related operations within this operator. Defaults to {@link asyncScheduler}
 * @deprecated This will be removed in v8. Use the configuration object with {@link timeout} instead: `timeoutWith(100, a$, scheduler)` -> `timeout({ each: 100, with: () => a$, scheduler })`
 */
export declare function timeoutWith<T, R>(waitFor: number, switchTo: ObservableInput<R>, scheduler?: SchedulerLike): OperatorFunction<T, T | R>;
//# sourceMappingURL=timeoutWith.d.ts.map