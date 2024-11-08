/** @prettier */
import { OperatorFunction, MonoTypeOperatorFunction, TruthyTypesOf } from '../types';
export declare function filter<T>(predicate: (value: T, index: number) => false, thisArg?: any): OperatorFunction<T, never>;
export declare function filter<T, S extends T>(predicate: (value: T, index: number) => value is S, thisArg?: any): OperatorFunction<T, S>;
export declare function filter<T>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
export declare function filter<T>(predicate: (value: T, index: number) => boolean, thisArg?: any): MonoTypeOperatorFunction<T>;
//# sourceMappingURL=filter.d.ts.map