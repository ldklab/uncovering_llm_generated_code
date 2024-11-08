export declare type Level = 'xml' | 'html4' | 'html5' | 'all';
interface CommonOptions {
    level?: Level;
}
export declare type EncodeMode = 'specialChars' | 'nonAsciiPrintable' | 'nonAscii';
export interface EncodeOptions extends CommonOptions {
    mode?: EncodeMode;
    numeric?: 'decimal' | 'hexadecimal';
}
export declare type DecodeScope = 'strict' | 'body' | 'attribute';
export interface DecodeOptions extends CommonOptions {
    scope?: DecodeScope;
}
export declare function encode(text: string | undefined | null, { mode, numeric, level }?: EncodeOptions): string;
export declare function decode(text: string | undefined | null, { level, scope }?: DecodeOptions): string;
export {};
