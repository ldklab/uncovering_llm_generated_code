/** @prettier */
import { Observable } from '../Observable';
import { ObservableInput } from '../types';
export declare function iif<T>(condition: () => true, trueResult: ObservableInput<T>, falseResult: ObservableInput<any>): Observable<T>;
export declare function iif<F>(condition: () => false, trueResult: ObservableInput<any>, falseResult: ObservableInput<F>): Observable<F>;
export declare function iif<T, F>(condition: () => boolean, trueResult: ObservableInput<T>, falseResult: ObservableInput<F>): Observable<T | F>;
//# sourceMappingURL=iif.d.ts.map