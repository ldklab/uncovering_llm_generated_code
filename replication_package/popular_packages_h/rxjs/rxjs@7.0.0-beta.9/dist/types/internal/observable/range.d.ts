/** @prettier */
import { SchedulerLike } from '../types';
import { Observable } from '../Observable';
export declare function range(start: number, count?: number): Observable<number>;
/**
 * @deprecated To be removed in v8. Passing a scheduler is deprecated, use `range(start, count).pipe(observeOn(scheduler))` instead.
 */
export declare function range(start: number, count: number | undefined, scheduler: SchedulerLike): Observable<number>;
//# sourceMappingURL=range.d.ts.map