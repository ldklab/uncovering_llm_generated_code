/** @prettier */
import { SchedulerLike, ValueFromArray } from '../types';
import { Observable } from '../Observable';
/** @deprecated The scheduler argument is deprecated, use scheduled. Details: https://rxjs.dev/deprecations/scheduler-argument */
export declare function of(scheduler: SchedulerLike): Observable<never>;
/** @deprecated The scheduler argument is deprecated, use scheduled. Details: https://rxjs.dev/deprecations/scheduler-argument */
export declare function of<T>(a: T, scheduler: SchedulerLike): Observable<T>;
/** @deprecated The scheduler argument is deprecated, use scheduled. Details: https://rxjs.dev/deprecations/scheduler-argument */
export declare function of<T, T2>(a: T, b: T2, scheduler: SchedulerLike): Observable<T | T2>;
/** @deprecated The scheduler argument is deprecated, use scheduled. Details: https://rxjs.dev/deprecations/scheduler-argument */
export declare function of<T, T2, T3>(a: T, b: T2, c: T3, scheduler: SchedulerLike): Observable<T | T2 | T3>;
/** @deprecated The scheduler argument is deprecated, use scheduled. Details: https://rxjs.dev/deprecations/scheduler-argument */
export declare function of<T, T2, T3, T4>(a: T, b: T2, c: T3, d: T4, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4>;
/** @deprecated The scheduler argument is deprecated, use scheduled. Details: https://rxjs.dev/deprecations/scheduler-argument */
export declare function of<T, T2, T3, T4, T5>(a: T, b: T2, c: T3, d: T4, e: T5, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4 | T5>;
/** @deprecated The scheduler argument is deprecated, use scheduled. Details: https://rxjs.dev/deprecations/scheduler-argument */
export declare function of<T, T2, T3, T4, T5, T6>(a: T, b: T2, c: T3, d: T4, e: T5, f: T6, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6>;
/** @deprecated The scheduler argument is deprecated, use scheduled. Details: https://rxjs.dev/deprecations/scheduler-argument */
export declare function of<T, T2, T3, T4, T5, T6, T7>(a: T, b: T2, c: T3, d: T4, e: T5, f: T6, g: T7, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6 | T7>;
/** @deprecated The scheduler argument is deprecated, use scheduled. Details: https://rxjs.dev/deprecations/scheduler-argument */
export declare function of<T, T2, T3, T4, T5, T6, T7, T8>(a: T, b: T2, c: T3, d: T4, e: T5, f: T6, g: T7, h: T8, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6 | T7 | T8>;
/** @deprecated The scheduler argument is deprecated, use scheduled. Details: https://rxjs.dev/deprecations/scheduler-argument */
export declare function of<T, T2, T3, T4, T5, T6, T7, T8, T9>(a: T, b: T2, c: T3, d: T4, e: T5, f: T6, g: T7, h: T8, i: T9, scheduler: SchedulerLike): Observable<T | T2 | T3 | T4 | T5 | T6 | T7 | T8 | T9>;
export declare function of(): Observable<never>;
/** @deprecated remove in v8. Do not use generic arguments directly, allow inference or cast with `as` */
export declare function of<T>(): Observable<T>;
export declare function of<T>(value: T): Observable<T>;
export declare function of<A extends readonly unknown[]>(...args: A): Observable<ValueFromArray<A>>;
//# sourceMappingURL=of.d.ts.map