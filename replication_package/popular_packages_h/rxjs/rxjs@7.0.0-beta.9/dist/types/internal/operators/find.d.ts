/** @prettier */
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { OperatorFunction, TruthyTypesOf } from '../types';
export declare function find<T>(predicate: BooleanConstructor): OperatorFunction<T, TruthyTypesOf<T>>;
export declare function find<T, S extends T>(predicate: (value: T, index: number, source: Observable<T>) => value is S, thisArg?: any): OperatorFunction<T, S | undefined>;
export declare function find<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg?: any): OperatorFunction<T, T | undefined>;
export declare function createFind<T>(predicate: (value: T, index: number, source: Observable<T>) => boolean, thisArg: any, emit: 'value' | 'index'): (source: Observable<T>, subscriber: Subscriber<any>) => void;
//# sourceMappingURL=find.d.ts.map