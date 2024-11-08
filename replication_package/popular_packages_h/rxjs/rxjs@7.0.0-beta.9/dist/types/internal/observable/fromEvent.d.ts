/** @prettier */
import { Observable } from '../Observable';
export interface NodeStyleEventEmitter {
    addListener: (eventName: string | symbol, handler: NodeEventHandler) => this;
    removeListener: (eventName: string | symbol, handler: NodeEventHandler) => this;
}
export declare type NodeEventHandler = (...args: any[]) => void;
export interface NodeCompatibleEventEmitter {
    addListener: (eventName: string, handler: NodeEventHandler) => void | {};
    removeListener: (eventName: string, handler: NodeEventHandler) => void | {};
}
export interface JQueryStyleEventEmitter<TContext, T> {
    on: (eventName: string, handler: (this: TContext, t: T, ...args: any[]) => any) => void;
    off: (eventName: string, handler: (this: TContext, t: T, ...args: any[]) => any) => void;
}
export interface HasEventTargetAddRemove<E> {
    addEventListener(type: string, listener: ((evt: E) => void) | null, options?: boolean | AddEventListenerOptions): void;
    removeEventListener(type: string, listener?: ((evt: E) => void) | null, options?: EventListenerOptions | boolean): void;
}
export declare type EventTargetLike<T> = HasEventTargetAddRemove<T> | NodeStyleEventEmitter | NodeCompatibleEventEmitter | JQueryStyleEventEmitter<any, T>;
export declare type FromEventTarget<T> = EventTargetLike<T> | ArrayLike<EventTargetLike<T>>;
export interface EventListenerOptions {
    capture?: boolean;
    passive?: boolean;
    once?: boolean;
}
export interface AddEventListenerOptions extends EventListenerOptions {
    once?: boolean;
    passive?: boolean;
}
export declare function fromEvent<T>(target: FromEventTarget<T>, eventName: string): Observable<T>;
/** @deprecated resultSelector no longer supported, pipe to map instead */
export declare function fromEvent<T>(target: FromEventTarget<T>, eventName: string, resultSelector?: (...args: any[]) => T): Observable<T>;
export declare function fromEvent<T>(target: FromEventTarget<T>, eventName: string, options?: EventListenerOptions): Observable<T>;
/** @deprecated resultSelector no longer supported, pipe to map instead */
export declare function fromEvent<T>(target: FromEventTarget<T>, eventName: string, options: EventListenerOptions, resultSelector: (...args: any[]) => T): Observable<T>;
//# sourceMappingURL=fromEvent.d.ts.map