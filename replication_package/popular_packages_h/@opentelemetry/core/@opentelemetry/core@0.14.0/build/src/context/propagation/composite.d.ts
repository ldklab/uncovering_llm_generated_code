import { Context, TextMapGetter, TextMapPropagator, TextMapSetter } from '@opentelemetry/api';
import { CompositePropagatorConfig } from './types';
/** Combines multiple propagators into a single propagator. */
export declare class CompositePropagator implements TextMapPropagator {
    private readonly _propagators;
    private readonly _logger;
    private readonly _fields;
    /**
     * Construct a composite propagator from a list of propagators.
     *
     * @param [config] Configuration object for composite propagator
     */
    constructor(config?: CompositePropagatorConfig);
    /**
     * Run each of the configured propagators with the given context and carrier.
     * Propagators are run in the order they are configured, so if multiple
     * propagators write the same carrier key, the propagator later in the list
     * will "win".
     *
     * @param context Context to inject
     * @param carrier Carrier into which context will be injected
     */
    inject(context: Context, carrier: unknown, setter: TextMapSetter): void;
    /**
     * Run each of the configured propagators with the given context and carrier.
     * Propagators are run in the order they are configured, so if multiple
     * propagators write the same context key, the propagator later in the list
     * will "win".
     *
     * @param context Context to add values to
     * @param carrier Carrier from which to extract context
     */
    extract(context: Context, carrier: unknown, getter: TextMapGetter): Context;
    fields(): string[];
}
//# sourceMappingURL=composite.d.ts.map