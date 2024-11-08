import { ZodType } from "./types/base";
declare type TypeResult = {
    schema: any;
    id: string;
    type: string;
};
export declare class ZodCodeGenerator {
    seen: TypeResult[];
    serial: number;
    randomId: () => string;
    findBySchema: (schema: ZodType<any, any, any>) => TypeResult | undefined;
    findById: (id: string) => TypeResult;
    dump: () => string;
    setType: (id: string, type: string) => TypeResult;
    generate: (schema: ZodType<any, any, any>) => TypeResult;
    static create: () => ZodCodeGenerator;
}
export {};
