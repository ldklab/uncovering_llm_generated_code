import { Context } from '@opentelemetry/context-base';
import { TextMapPropagator } from './TextMapPropagator';
/**
 * No-op implementations of {@link TextMapPropagator}.
 */
export declare class NoopTextMapPropagator implements TextMapPropagator {
    /** Noop inject function does nothing */
    inject(_context: Context, _carrier: unknown): void;
    /** Noop extract function does nothing and returns the input context */
    extract(context: Context, _carrier: unknown): Context;
    fields(): string[];
}
export declare const NOOP_TEXT_MAP_PROPAGATOR: NoopTextMapPropagator;
//# sourceMappingURL=NoopTextMapPropagator.d.ts.map