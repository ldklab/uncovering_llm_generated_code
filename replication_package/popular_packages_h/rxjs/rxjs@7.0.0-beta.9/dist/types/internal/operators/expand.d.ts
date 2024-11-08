/** @prettier */
import { OperatorFunction, ObservableInput, SchedulerLike } from '../types';
export declare function expand<T, R>(project: (value: T, index: number) => ObservableInput<R>, concurrent?: number, scheduler?: SchedulerLike): OperatorFunction<T, R>;
/**
 * @deprecated Will be removed in v8. If you need to schedule the inner subscription,
 * use `subscribeOn` within the projection function: `expand((value) => fn(value).pipe(subscribeOn(scheduler)))`.
 */
export declare function expand<T, R>(project: (value: T, index: number) => ObservableInput<R>, concurrent: number | undefined, scheduler: SchedulerLike): OperatorFunction<T, R>;
//# sourceMappingURL=expand.d.ts.map