/** @prettier */
import { Observable } from '../Observable';
import { Falsy, OperatorFunction } from '../types';
export declare function every<T>(predicate: BooleanConstructor, thisArg?: any): OperatorFunction<T, Exclude<T, Falsy> extends never ? false : boolean>;
export declare function every<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): OperatorFunction<T, boolean>;
//# sourceMappingURL=every.d.ts.map