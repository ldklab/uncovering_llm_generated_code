import { Tracer, Logger, TracerProvider } from '@opentelemetry/api';
import { Plugin, PluginConfig, PluginInternalFiles } from '../trace/Plugin';
/** This class represent the base to patch plugin. */
export declare abstract class BaseAbstractPlugin<T> implements Plugin<T> {
    protected readonly _tracerName: string;
    protected readonly _tracerVersion?: string | undefined;
    abstract readonly moduleName: string;
    supportedVersions?: string[];
    readonly version?: string;
    protected readonly _basedir?: string;
    protected _config: PluginConfig;
    protected _internalFilesExports: {
        [module: string]: unknown;
    };
    protected readonly _internalFilesList?: PluginInternalFiles;
    protected _logger: Logger;
    protected _moduleExports: T;
    protected _tracer: Tracer;
    constructor(_tracerName: string, _tracerVersion?: string | undefined);
    disable(): void;
    abstract enable(moduleExports: T, tracerProvider: TracerProvider, logger: Logger, config?: PluginConfig): T;
    protected abstract patch(): T;
    protected abstract unpatch(): void;
}
//# sourceMappingURL=BaseAbstractPlugin.d.ts.map