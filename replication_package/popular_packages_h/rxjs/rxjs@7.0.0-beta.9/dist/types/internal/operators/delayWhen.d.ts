/** @prettier */
import { Observable } from '../Observable';
import { MonoTypeOperatorFunction } from '../types';
/** @deprecated In future versions, empty notifiers will no longer re-emit the source value on the output observable. */
export declare function delayWhen<T>(delayDurationSelector: (value: T, index: number) => Observable<never>, subscriptionDelay?: Observable<any>): MonoTypeOperatorFunction<T>;
/** @deprecated In future versions, `subscriptionDelay` will no longer be supported. */
export declare function delayWhen<T>(delayDurationSelector: (value: T, index: number) => Observable<any>, subscriptionDelay: Observable<any>): MonoTypeOperatorFunction<T>;
export declare function delayWhen<T>(delayDurationSelector: (value: T, index: number) => Observable<any>): MonoTypeOperatorFunction<T>;
//# sourceMappingURL=delayWhen.d.ts.map