import { Observable } from '../Observable';
import { map } from '../operators/map';
import { argsArgArrayOrObject } from '../util/argsArgArrayOrObject';
import { innerFrom } from './from';
import { popResultSelector } from '../util/args';
export function forkJoin(...args) {
    const resultSelector = popResultSelector(args);
    const { args: sources, keys } = argsArgArrayOrObject(args);
    if (resultSelector) {
        return forkJoinInternal(sources, keys).pipe(map((values) => resultSelector(...values)));
    }
    return forkJoinInternal(sources, keys);
}
function forkJoinInternal(sources, keys) {
    return new Observable((subscriber) => {
        const len = sources.length;
        if (len === 0) {
            subscriber.complete();
            return;
        }
        const values = new Array(len);
        let completed = 0;
        let emitted = 0;
        for (let sourceIndex = 0; sourceIndex < len; sourceIndex++) {
            const source = innerFrom(sources[sourceIndex]);
            let hasValue = false;
            subscriber.add(source.subscribe({
                next: (value) => {
                    if (!hasValue) {
                        hasValue = true;
                        emitted++;
                    }
                    values[sourceIndex] = value;
                },
                error: (err) => subscriber.error(err),
                complete: () => {
                    completed++;
                    if (completed === len || !hasValue) {
                        if (emitted === len) {
                            subscriber.next(keys ? keys.reduce((result, key, i) => ((result[key] = values[i]), result), {}) : values);
                        }
                        subscriber.complete();
                    }
                },
            }));
        }
    });
}
//# sourceMappingURL=forkJoin.js.map