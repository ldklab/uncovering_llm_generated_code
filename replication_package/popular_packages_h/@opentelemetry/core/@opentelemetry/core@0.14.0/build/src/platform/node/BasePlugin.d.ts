import { Logger, TracerProvider } from '@opentelemetry/api';
import { Plugin, PluginConfig } from '../../trace/Plugin';
import { BaseAbstractPlugin } from '../BaseAbstractPlugin';
/** This class represent the base to patch plugin. */
export declare abstract class BasePlugin<T> extends BaseAbstractPlugin<T> implements Plugin<T> {
    enable(moduleExports: T, tracerProvider: TracerProvider, logger: Logger, config?: PluginConfig): T;
    disable(): void;
    /**
     * @TODO: To avoid circular dependencies, internal file loading functionality currently
     * lives in BasePlugin. It is not meant to work in the browser and so this logic
     * should eventually be moved somewhere else where it makes more sense.
     * https://github.com/open-telemetry/opentelemetry-js/issues/285
     */
    private _loadInternalFilesExports;
    private _loadInternalModule;
    private _requireInternalFiles;
    protected abstract patch(): T;
    protected abstract unpatch(): void;
}
//# sourceMappingURL=BasePlugin.d.ts.map