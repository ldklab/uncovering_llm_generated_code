import * as z from "./base";
export interface ZodNativeEnumDef<T extends EnumLike = EnumLike> extends z.ZodTypeDef {
    t: z.ZodTypes.nativeEnum;
    values: T;
}
declare type EnumLike = {
    [k: string]: string | number;
    [nu: number]: string;
};
export declare class ZodNativeEnum<T extends EnumLike> extends z.ZodType<T[keyof T], ZodNativeEnumDef<T>> {
    toJSON: () => ZodNativeEnumDef<T>;
    static create: <T_1 extends EnumLike>(values: T_1) => ZodNativeEnum<T_1>;
}
export {};
