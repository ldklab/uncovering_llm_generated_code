/** @prettier */
import { Observable } from '../Observable';
import { ObservedValueOf, ObservableInputTuple } from '../types';
export declare function forkJoin(sources: readonly []): Observable<never>;
export declare function forkJoin<A extends readonly unknown[]>(sources: readonly [...ObservableInputTuple<A>]): Observable<A>;
/** @deprecated resultSelector is deprecated, pipe to map instead */
export declare function forkJoin<A extends readonly unknown[], R>(sources: readonly [...ObservableInputTuple<A>], resultSelector: (...values: A) => R): Observable<R>;
/** @deprecated Use the version that takes an array of Observables instead */
export declare function forkJoin<A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): Observable<A>;
/** @deprecated resultSelector is deprecated, pipe to map instead */
export declare function forkJoin<A extends readonly unknown[], R>(...sourcesAndResultSelector: [...ObservableInputTuple<A>, (...values: A) => R]): Observable<R>;
export declare function forkJoin(sourcesObject: {
    [K in any]: never;
}): Observable<never>;
export declare function forkJoin<T>(sourcesObject: T): Observable<{
    [K in keyof T]: ObservedValueOf<T[K]>;
}>;
//# sourceMappingURL=forkJoin.d.ts.map