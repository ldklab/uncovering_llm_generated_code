declare type Func = (arg: any, ctx: {
    async: boolean;
}) => any;
declare type FuncItem = {
    type: "function";
    function: Func;
};
declare type Catcher = (error: Error, ctx: {
    async: boolean;
}) => any;
declare type CatcherItem = {
    type: "catcher";
    catcher: Catcher;
};
declare type Items = (FuncItem | CatcherItem)[];
export declare const NOSET: unique symbol;
export declare class PseudoPromise<ReturnType = undefined> {
    readonly _return: ReturnType;
    items: Items;
    constructor(funcs?: Items);
    static all: <T extends PseudoPromise<any>[]>(pps: T) => PseudoPromise<{ [k in keyof T]: T[k] extends PseudoPromise<any> ? T[k]["_return"] : never; }>;
    all: <T extends PseudoPromise<any>[]>(pps: T) => PseudoPromise<{ [k in keyof T]: T[k] extends PseudoPromise<any> ? T[k]["_return"] : never; }>;
    static object: (pps: {
        [k: string]: PseudoPromise<any>;
    }) => PseudoPromise<any>;
    static resolve: <T>(value: T) => PseudoPromise<T>;
    then: <NewReturn>(func: (arg: ReturnType, ctx: {
        async: boolean;
    }) => NewReturn) => PseudoPromise<NewReturn extends Promise<infer U> ? U : NewReturn>;
    catch: (catcher: (err: Error, ctx: {
        async: boolean;
    }) => unknown) => this;
    getValueSync: () => ReturnType;
    getValueAsync: () => Promise<ReturnType>;
}
export {};
