import { ZodIssueOptionalMessage } from "./ZodError";
declare type ErrorMapCtx = {
    defaultError: string;
    data: any;
};
export declare type ZodErrorMap = typeof defaultErrorMap;
export declare const defaultErrorMap: (error: ZodIssueOptionalMessage, _ctx: ErrorMapCtx) => {
    message: string;
};
export {};
