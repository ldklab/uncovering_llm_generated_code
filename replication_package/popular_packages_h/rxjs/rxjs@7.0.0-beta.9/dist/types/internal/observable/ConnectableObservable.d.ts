/** @prettier */
import { Subject } from '../Subject';
import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { Subscription } from '../Subscription';
/**
 * @class ConnectableObservable<T>
 */
export declare class ConnectableObservable<T> extends Observable<T> {
    source: Observable<T>;
    protected subjectFactory: () => Subject<T>;
    protected _subject: Subject<T> | null;
    protected _refCount: number;
    protected _connection: Subscription | null;
    constructor(source: Observable<T>, subjectFactory: () => Subject<T>);
    protected _subscribe(subscriber: Subscriber<T>): Subscription;
    protected getSubject(): Subject<T>;
    protected _teardown(): void;
    connect(): Subscription;
    refCount(): Observable<T>;
}
//# sourceMappingURL=ConnectableObservable.d.ts.map