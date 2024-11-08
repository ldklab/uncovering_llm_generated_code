/** @prettier */
import { Observable } from '../Observable';
import { Falsy, OperatorFunction } from '../types';
export declare function findIndex<T>(predicate: (value: T, index: number, source: Observable<T>) => false, thisArg?: any): OperatorFunction<T, -1>;
export declare function findIndex<T>(predicate: BooleanConstructor, thisArg?: any): OperatorFunction<T, T extends Falsy ? -1 : number>;
export declare function findIndex<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): OperatorFunction<T, number>;
//# sourceMappingURL=findIndex.d.ts.map