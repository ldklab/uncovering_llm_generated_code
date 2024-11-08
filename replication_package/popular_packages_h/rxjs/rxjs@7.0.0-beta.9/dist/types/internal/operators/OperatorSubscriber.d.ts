/** @prettier */
import { Subscriber } from '../Subscriber';
/**
 * A generic helper for allowing operators to be created with a Subscriber and
 * use closures to capture neceessary state from the operator function itself.
 */
export declare class OperatorSubscriber<T> extends Subscriber<T> {
    private onUnsubscribe?;
    /**
     * Creates an instance of an `OperatorSubscriber`.
     * @param destination The downstream subscriber.
     * @param onNext Handles next values, only called if this subscriber is not stopped or closed. Any
     * error that occurs in this function is caught and sent to the `error` method of this subscriber.
     * @param onError Handles errors from the subscription, any errors that occur in this handler are caught
     * and send to the `destination` error handler.
     * @param onComplete Handles completion notification from the subscription. Any errors that occur in
     * this handler are sent to the `destination` error handler.
     * @param onUnsubscribe Additional teardown logic here. This will only be called on teardown if the
     * subscriber itself is not already closed. Called before any additional teardown logic is called.
     */
    constructor(destination: Subscriber<any>, onNext?: (value: T) => void, onError?: (err: any) => void, onComplete?: () => void, onUnsubscribe?: (() => void) | undefined);
    unsubscribe(): void;
}
//# sourceMappingURL=OperatorSubscriber.d.ts.map