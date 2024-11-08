export declare class Deferred<T> {
    resolve: (value: T | PromiseLike<T>) => void;
    reject: (reason?: any) => void;
    promise: Promise<T>;
}
//# sourceMappingURL=deferred.d.ts.map