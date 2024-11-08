/** @prettier */
import { Observable } from '../Observable';
import { ObservableInputTuple } from '../types';
export declare function zip<A extends readonly unknown[]>(sources: [...ObservableInputTuple<A>]): Observable<A>;
/** @deprecated resultSelector is no longer supported, pipe to map instead */
export declare function zip<A extends readonly unknown[], R>(sources: [...ObservableInputTuple<A>], resultSelector: (...values: A) => R): Observable<R>;
export declare function zip<A extends readonly unknown[]>(...sources: [...ObservableInputTuple<A>]): Observable<A>;
/** @deprecated resultSelector is no longer supported, pipe to map instead */
export declare function zip<A extends readonly unknown[], R>(...sourcesAndResultSelector: [...ObservableInputTuple<A>, (...values: A) => R]): Observable<R>;
//# sourceMappingURL=zip.d.ts.map