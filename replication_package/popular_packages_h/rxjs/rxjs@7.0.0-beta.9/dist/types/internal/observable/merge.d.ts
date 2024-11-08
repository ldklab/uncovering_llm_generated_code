/** @prettier */
import { Observable } from '../Observable';
import { ObservableInputTuple, SchedulerLike } from '../types';
export declare function merge<A extends readonly unknown[]>(...args: [...ObservableInputTuple<A>]): Observable<A[number]>;
export declare function merge<A extends readonly unknown[]>(...args: [...ObservableInputTuple<A>, number?]): Observable<A[number]>;
/** @deprecated The scheduler argument is deprecated, use scheduled and mergeAll. Details: https://rxjs.dev/deprecations/scheduler-argument */
export declare function merge<A extends readonly unknown[]>(...args: [...ObservableInputTuple<A>, SchedulerLike?]): Observable<A[number]>;
/** @deprecated The scheduler argument is deprecated, use scheduled and mergeAll. Details: https://rxjs.dev/deprecations/scheduler-argument */
export declare function merge<A extends readonly unknown[]>(...args: [...ObservableInputTuple<A>, number?, SchedulerLike?]): Observable<A[number]>;
//# sourceMappingURL=merge.d.ts.map