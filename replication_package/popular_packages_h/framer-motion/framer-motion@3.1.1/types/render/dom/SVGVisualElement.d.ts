import { HTMLVisualElement } from "./HTMLVisualElement";
import { DOMVisualElementConfig } from "./types";
import { ResolvedValues } from "../VisualElement/types";
import { MotionProps } from "../../motion";
/**
 * A VisualElement for SVGElements. Inherits from and extends HTMLVisualElement as the two
 * share data structures.
 */
export declare class SVGVisualElement extends HTMLVisualElement<SVGElement | SVGPathElement> {
    /**
     * A mutable record of attributes we want to apply directly to the rendered Element
     * every frame. We use a mutable data structure to reduce GC during animations.
     */
    attrs: ResolvedValues;
    /**
     * Measured dimensions of the SVG element to be used to calculate a transform-origin.
     */
    private dimensions;
    /**
     * Measured path length if this is a SVGPathElement
     */
    private totalPathLength;
    /**
     * We disable hardware acceleration for SVG transforms as they're not currently able to be accelerated.
     */
    protected defaultConfig: DOMVisualElementConfig;
    /**
     * Without duplicating this call from HTMLVisualElement we end up with HTMLVisualElement.defaultConfig
     * being assigned to config
     */
    config: DOMVisualElementConfig;
    /**
     * Measure the SVG element on mount. This can affect page rendering so there might be a
     * better time to perform this - for instance dynamically only if there's a transform-origin dependent
     * transform being set (like rotate)
     */
    protected mount(element: SVGElement): void;
    /**
     * Update the SVG dimensions and path length
     */
    private measure;
    getBaseValue(key: string, props: MotionProps): any;
    /**
     * Empty the mutable data structures in case attrs have been removed between renders.
     */
    clean(): void;
    /**
     * Read an attribute directly from the SVGElement
     */
    read(key: string): string | null;
    build(): void;
    render(): void;
}
