import { Logger } from 'bs-logger';
import { CompilerOptions, CustomTransformers, Diagnostic, ParsedCommandLine } from 'typescript';
import type { ProjectConfigTsJest, TTypeScript } from '../types';
export declare class ConfigSet {
    readonly jestConfig: ProjectConfigTsJest;
    readonly parentLogger?: Logger | undefined;
    readonly tsJestDigest: string;
    readonly logger: Logger;
    readonly compilerModule: TTypeScript;
    readonly isolatedModules: boolean;
    readonly cwd: string;
    readonly rootDir: string;
    tsCacheDir: string | undefined;
    parsedTsConfig: ParsedCommandLine | Record<string, any>;
    customTransformers: CustomTransformers;
    useESM: boolean;
    constructor(jestConfig: ProjectConfigTsJest, parentLogger?: Logger | undefined);
    private _getAndResolveTsConfig;
    protected _resolveTsConfig(compilerOptions?: CompilerOptions, resolvedConfigFile?: string): Record<string, any>;
    isTestFile(fileName: string): boolean;
    shouldStringifyContent(filePath: string): boolean;
    raiseDiagnostics(diagnostics: Diagnostic[], filePath?: string, logger?: Logger): void;
    shouldReportDiagnostics(filePath: string): boolean;
    resolvePath(inputPath: string, { throwIfMissing, nodeResolve }?: {
        throwIfMissing?: boolean;
        nodeResolve?: boolean;
    }): string;
}
