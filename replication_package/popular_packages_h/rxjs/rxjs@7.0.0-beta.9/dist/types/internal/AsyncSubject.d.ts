/** @prettier */
import { Subject } from './Subject';
import { Subscriber } from './Subscriber';
/**
 * A variant of Subject that only emits a value when it completes. It will emit
 * its latest value to all its observers on completion.
 *
 * @class AsyncSubject<T>
 */
export declare class AsyncSubject<T> extends Subject<T> {
    private value;
    private hasValue;
    private isComplete;
    protected _checkFinalizedStatuses(subscriber: Subscriber<T>): void;
    next(value: T): void;
    complete(): void;
}
//# sourceMappingURL=AsyncSubject.d.ts.map