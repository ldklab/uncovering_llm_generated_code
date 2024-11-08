import * as z from "./base";
export interface ZodNeverDef extends z.ZodTypeDef {
    t: z.ZodTypes.never;
}
export declare class ZodNever extends z.ZodType<never, ZodNeverDef> {
    toJSON: () => ZodNeverDef;
    static create: () => ZodNever;
}
