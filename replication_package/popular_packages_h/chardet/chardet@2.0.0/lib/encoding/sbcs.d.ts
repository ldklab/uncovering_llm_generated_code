import { Context, Recogniser } from '../encoding/index';
import { Match } from '../match';
declare class NGramsPlusLang {
    fLang: string;
    fNGrams: number[];
    constructor(la: string, ng: number[]);
}
declare class sbcs implements Recogniser {
    spaceChar: number;
    private nGramLang?;
    ngrams(): NGramsPlusLang[] | number[];
    byteMap(): number[];
    name(_input: Context): string;
    language(): string | undefined;
    match(det: Context): Match | null;
}
export declare class ISO_8859_1 extends sbcs {
    byteMap(): number[];
    ngrams(): NGramsPlusLang[];
    name(input: Context): string;
}
export declare class ISO_8859_2 extends sbcs {
    byteMap(): number[];
    ngrams(): NGramsPlusLang[];
    name(det: Context): string;
}
export declare class ISO_8859_5 extends sbcs {
    byteMap(): number[];
    ngrams(): number[];
    name(): string;
    language(): string;
}
export declare class ISO_8859_6 extends sbcs {
    byteMap(): number[];
    ngrams(): number[];
    name(): string;
    language(): string;
}
export declare class ISO_8859_7 extends sbcs {
    byteMap(): number[];
    ngrams(): number[];
    name(det: Context): string;
    language(): string;
}
export declare class ISO_8859_8 extends sbcs {
    byteMap(): number[];
    ngrams(): NGramsPlusLang[];
    name(det: Context): string;
    language(): string;
}
export declare class ISO_8859_9 extends sbcs {
    byteMap(): number[];
    ngrams(): number[];
    name(det: Context): string;
    language(): string;
}
export declare class windows_1251 extends sbcs {
    byteMap(): number[];
    ngrams(): number[];
    name(): string;
    language(): string;
}
export declare class windows_1256 extends sbcs {
    byteMap(): number[];
    ngrams(): number[];
    name(): string;
    language(): string;
}
export declare class KOI8_R extends sbcs {
    byteMap(): number[];
    ngrams(): number[];
    name(): string;
    language(): string;
}
export {};
