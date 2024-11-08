import * as z from "./base";
export interface ZodPromiseDef<T extends z.ZodTypeAny = z.ZodTypeAny> extends z.ZodTypeDef {
    t: z.ZodTypes.promise;
    type: T;
}
export declare class ZodPromise<T extends z.ZodTypeAny> extends z.ZodType<Promise<T["_output"]>, ZodPromiseDef<T>, Promise<T["_input"]>> {
    toJSON: () => {
        t: z.ZodTypes.promise;
        type: object;
    };
    static create: <T_1 extends z.ZodTypeAny>(schema: T_1) => ZodPromise<T_1>;
}
