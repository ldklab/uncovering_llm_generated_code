export declare const INVALID: unique symbol;
export declare namespace util {
    type AssertEqual<T, Expected> = T extends Expected ? Expected extends T ? true : false : false;
    function assertNever(_x: never): never;
    type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
    type OmitKeys<T, K extends string> = Pick<T, Exclude<keyof T, K>>;
    type MakePartial<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
    const arrayToEnum: <T extends string, U extends [T, ...T[]]>(items: U) => { [k in U[number]]: k; };
    const getValidEnumValues: (obj: any) => any[];
    const getValues: (obj: any) => any[];
    const objectValues: (obj: any) => any[];
    const find: <T>(arr: T[], checker: (arg: T) => any) => T | undefined;
}
