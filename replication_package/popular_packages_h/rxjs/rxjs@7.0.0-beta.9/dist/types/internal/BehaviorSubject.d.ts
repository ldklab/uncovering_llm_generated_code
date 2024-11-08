/** @prettier */
import { Subject } from './Subject';
import { Subscriber } from './Subscriber';
import { Subscription } from './Subscription';
/**
 * A variant of Subject that requires an initial value and emits its current
 * value whenever it is subscribed to.
 *
 * @class BehaviorSubject<T>
 */
export declare class BehaviorSubject<T> extends Subject<T> {
    private _value;
    constructor(_value: T);
    get value(): T;
    /** @deprecated This is an internal implementation detail, do not use. */
    protected _subscribe(subscriber: Subscriber<T>): Subscription;
    getValue(): T;
    next(value: T): void;
}
//# sourceMappingURL=BehaviorSubject.d.ts.map