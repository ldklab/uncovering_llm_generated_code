import * as z from "./base";
export interface ZodMapDef<Key extends z.ZodTypeAny = z.ZodTypeAny, Value extends z.ZodTypeAny = z.ZodTypeAny> extends z.ZodTypeDef {
    t: z.ZodTypes.map;
    valueType: Value;
    keyType: Key;
}
export declare class ZodMap<Key extends z.ZodTypeAny = z.ZodTypeAny, Value extends z.ZodTypeAny = z.ZodTypeAny> extends z.ZodType<Map<Key["_output"], Value["_output"]>, ZodMapDef<Key, Value>, Map<Key["_input"], Value["_input"]>> {
    readonly _value: Value;
    toJSON: () => {
        t: z.ZodTypes.map;
        valueType: object;
        keyType: object;
    };
    static create: <Key_1 extends z.ZodTypeAny = z.ZodTypeAny, Value_1 extends z.ZodTypeAny = z.ZodTypeAny>(keyType: Key_1, valueType: Value_1) => ZodMap<Key_1, Value_1>;
}
