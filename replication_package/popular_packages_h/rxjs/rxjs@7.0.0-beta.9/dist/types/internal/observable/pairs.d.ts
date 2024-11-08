/** @prettier */
import { Observable } from '../Observable';
import { SchedulerLike } from '../types';
/**
 * @deprecated To be removed in version 8. Use `from(Object.entries(obj))` instead.
 */
export declare function pairs<T>(arr: readonly T[], scheduler?: SchedulerLike): Observable<[string, T]>;
/**
 * @deprecated To be removed in version 8. Use `from(Object.entries(obj))` instead.
 */
export declare function pairs<O extends Record<string, unknown>>(obj: O, scheduler?: SchedulerLike): Observable<[keyof O, O[keyof O]]>;
/**
 * @deprecated To be removed in version 8. Use `from(Object.entries(obj))` instead.
 */
export declare function pairs<T>(iterable: Iterable<T>, scheduler?: SchedulerLike): Observable<[string, T]>;
/**
 * @deprecated To be removed in version 8. Use `from(Object.entries(obj))` instead.
 */
export declare function pairs(n: number | bigint | boolean | ((...args: any[]) => any) | symbol, scheduler?: SchedulerLike): Observable<[never, never]>;
//# sourceMappingURL=pairs.d.ts.map