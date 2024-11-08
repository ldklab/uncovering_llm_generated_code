/** @prettier */
import { Observable } from '../Observable';
import { SchedulerLike } from '../types';
/** @deprecated resultSelector is deprecated, pipe to map instead */
export declare function bindNodeCallback(callbackFunc: (...args: any[]) => void, resultSelector: (...args: any[]) => any, scheduler?: SchedulerLike): (...args: any[]) => Observable<any>;
export declare function bindNodeCallback<A extends readonly unknown[], R extends readonly unknown[]>(callbackFunc: (...args: [...A, (err: any, ...res: R) => void]) => void, schedulerLike?: SchedulerLike): (...arg: A) => Observable<R extends [] ? void : R extends [any] ? R[0] : R>;
//# sourceMappingURL=bindNodeCallback.d.ts.map