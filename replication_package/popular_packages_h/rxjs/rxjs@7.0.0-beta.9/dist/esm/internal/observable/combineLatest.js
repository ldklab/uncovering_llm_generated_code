import { Observable } from '../Observable';
import { argsArgArrayOrObject } from '../util/argsArgArrayOrObject';
import { Subscriber } from '../Subscriber';
import { from } from './from';
import { identity } from '../util/identity';
import { mapOneOrManyArgs } from '../util/mapOneOrManyArgs';
import { popResultSelector, popScheduler } from '../util/args';
export function combineLatest(...args) {
    const scheduler = popScheduler(args);
    const resultSelector = popResultSelector(args);
    const { args: observables, keys } = argsArgArrayOrObject(args);
    const result = new Observable(combineLatestInit(observables, scheduler, keys
        ?
            (values) => {
                const value = {};
                for (let i = 0; i < values.length; i++) {
                    value[keys[i]] = values[i];
                }
                return value;
            }
        :
            identity));
    if (resultSelector) {
        return result.pipe(mapOneOrManyArgs(resultSelector));
    }
    return result;
}
class CombineLatestSubscriber extends Subscriber {
    constructor(destination, _next, shouldComplete) {
        super(destination);
        this._next = _next;
        this.shouldComplete = shouldComplete;
    }
    _complete() {
        if (this.shouldComplete()) {
            super._complete();
        }
        else {
            this.unsubscribe();
        }
    }
}
export function combineLatestInit(observables, scheduler, valueTransform = identity) {
    return (subscriber) => {
        const primarySubscribe = () => {
            const { length } = observables;
            const values = new Array(length);
            let active = length;
            const hasValues = observables.map(() => false);
            let waitingForFirstValues = true;
            const emit = () => subscriber.next(valueTransform(values.slice()));
            for (let i = 0; i < length; i++) {
                const subscribe = () => {
                    const source = from(observables[i], scheduler);
                    source.subscribe(new CombineLatestSubscriber(subscriber, (value) => {
                        values[i] = value;
                        if (waitingForFirstValues) {
                            hasValues[i] = true;
                            waitingForFirstValues = !hasValues.every(identity);
                        }
                        if (!waitingForFirstValues) {
                            emit();
                        }
                    }, () => --active === 0));
                };
                maybeSchedule(scheduler, subscribe, subscriber);
            }
        };
        maybeSchedule(scheduler, primarySubscribe, subscriber);
    };
}
function maybeSchedule(scheduler, execute, subscription) {
    if (scheduler) {
        subscription.add(scheduler.schedule(execute));
    }
    else {
        execute();
    }
}
//# sourceMappingURL=combineLatest.js.map