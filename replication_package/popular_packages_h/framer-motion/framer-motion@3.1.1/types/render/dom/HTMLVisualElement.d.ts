import { VisualElement } from "../VisualElement";
import { AxisBox2D, Point2D, BoxDelta } from "../../types/geometry";
import { ResolvedValues } from "../VisualElement/types";
import { DOMVisualElementConfig, TransformOrigin } from "./types";
import { Presence, SharedLayoutAnimationConfig } from "../../components/AnimateSharedLayout/types";
import { TargetAndTransition, Transition } from "../../types";
import { MotionValue } from "../../value";
import { OnViewportBoxUpdate } from "../../motion/features/layout/types";
import { MotionProps } from "../../motion";
export declare type LayoutUpdateHandler = (layout: AxisBox2D, prev: AxisBox2D, config?: SharedLayoutAnimationConfig) => void;
/**
 * A VisualElement for HTMLElements
 */
export declare class HTMLVisualElement<E extends HTMLElement | SVGElement = HTMLElement> extends VisualElement<E> {
    /**
     *
     */
    protected defaultConfig: DOMVisualElementConfig;
    /**
     * A mutable record of styles we want to apply directly to the rendered Element
     * every frame. We use a mutable data structure to reduce GC during animations.
     */
    style: ResolvedValues;
    /**
     * A record of styles we only want to apply via React. This gets set in useMotionValues
     * and applied in the render function. I'd prefer this to live somewhere else to decouple
     * VisualElement from React but works for now.
     */
    reactStyle: ResolvedValues;
    /**
     * A mutable record of CSS variables we want to apply directly to the rendered Element
     * every frame. We use a mutable data structure to reduce GC during animations.
     */
    vars: ResolvedValues;
    /**
     * Presence data. This is hydrated by useDomVisualElement and used by AnimateSharedLayout
     * to decide how to animate entering/exiting layoutId
     */
    presence?: Presence;
    isPresent?: boolean;
    /**
     * A mutable record of transforms we want to apply directly to the rendered Element
     * every frame. We use a mutable data structure to reduce GC during animations.
     */
    protected transform: ResolvedValues;
    /**
     * A mutable record of transform origins we want to apply directly to the rendered Element
     * every frame. We use a mutable data structure to reduce GC during animations.
     */
    protected transformOrigin: TransformOrigin;
    /**
     * A mutable record of transform keys we want to apply to the rendered Element. We order
     * this to order transforms in the desired order. We use a mutable data structure to reduce GC during animations.
     */
    protected transformKeys: string[];
    config: DOMVisualElementConfig;
    /**
     * When a value is removed, we want to make sure it's removed from all rendered data structures.
     */
    removeValue(key: string): void;
    /**
     * Empty the mutable data structures by re-creating them. We can do this every React render
     * as the comparative workload to the rest of the render is very low and this is also when
     * we want to reflect values that might have been removed by the render.
     */
    clean(): void;
    updateConfig(config?: DOMVisualElementConfig): void;
    /**
     * Read a value directly from the HTMLElement style.
     */
    read(key: string): number | string | null;
    addValue(key: string, value: MotionValue): void;
    /**
     * Read a value directly from the HTMLElement in case it's not defined by a Motion
     * prop. If it's a transform, we just return a pre-defined default value as reading these
     * out of a matrix is either error-prone or can incur a big payload for little benefit.
     */
    readNativeValue(key: string): any;
    getBaseValue(key: string, props: MotionProps): any;
    /**
     * Ensure that HTML and Framer-specific value types like `px`->`%` and `Color`
     * can be animated by Motion.
     */
    makeTargetAnimatable({ transition, transitionEnd, ...target }: TargetAndTransition, parseDOMValues?: boolean): TargetAndTransition;
    /**
     * ========================================
     * Layout
     * ========================================
     */
    isLayoutProjectionEnabled: boolean;
    enableLayoutProjection(): void;
    /**
     * A set of layout update event handlers. These are only called once all layouts have been read,
     * making it safe to perform DOM write operations.
     */
    private layoutUpdateListeners;
    private layoutMeasureListeners;
    private viewportBoxUpdateListeners;
    /**
     * Keep track of whether the viewport box has been updated since the last render.
     * If it has, we want to fire the onViewportBoxUpdate listener.
     */
    private hasViewportBoxUpdated;
    /**
     * Optional id. If set, and this is the child of an AnimateSharedLayout component,
     * the targetBox can be transferred to a new component with the same ID.
     */
    layoutId?: string;
    /**
     * The measured bounding box as it exists on the page with no transforms applied.
     *
     * To calculate the visual output of a component in any given frame, we:
     *
     *   1. box -> boxCorrected
     *      Apply the delta between the tree transform when the box was measured and
     *      the tree transform in this frame to the box
     *   2. targetBox -> targetBoxFinal
     *      Apply the VisualElement's `transform` properties to the targetBox
     *   3. Calculate the delta between boxCorrected and targetBoxFinal and apply
     *      it as a transform style.
     */
    box: AxisBox2D;
    /**
     * The `box` layout with transforms applied from up the
     * tree. We use this as the final bounding box from which we calculate a transform
     * delta to our desired visual position on any given frame.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    private boxCorrected;
    /**
     * The visual target we want to project our component into on a given frame
     * before applying transforms defined in `animate` or `style`.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    targetBox: AxisBox2D;
    /**
     * The visual target we want to project our component into on a given frame
     * before applying transforms defined in `animate` or `style`.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    protected targetBoxFinal: AxisBox2D;
    /**
     * Can be used to store a snapshot of the measured viewport bounding box before
     * a re-render.
     */
    prevViewportBox?: AxisBox2D;
    /**
     * The overall scale of the local coordinate system as transformed by all parents
     * of this component. We use this for scale correction on our calculated layouts
     * and scale-affected values like `boxShadow`.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    treeScale: Point2D;
    /**
     * The delta between the boxCorrected and the desired
     * targetBox (before user-set transforms are applied). The calculated output will be
     * handed to the renderer and used as part of the style correction calculations, for
     * instance calculating how to display the desired border-radius correctly.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    delta: BoxDelta;
    /**
     * The delta between the boxCorrected and the desired targetBoxFinal. The calculated
     * output will be handed to the renderer and used to project the boxCorrected into
     * the targetBoxFinal.
     *
     * This is considered mutable to avoid object creation on each frame.
     */
    deltaFinal: BoxDelta;
    /**
     * The computed transform string to apply deltaFinal to the element. Currently this is only
     * being used to diff and decide whether to render on the current frame, but a minor optimisation
     * could be to provide this to the buildHTMLStyle function.
     */
    deltaTransform: string;
    /**
     * If we've got a rotate motion value, we force layout projection calculations
     * to use o layout origin of 0.5 rather than dynamically calculating one based
     * on relative positioning. This is so the component always rotates around its centre rather
     * than an arbitrarily computed point.
     */
    private layoutOrigin;
    /**
     *
     */
    stopLayoutAxisAnimation: {
        x: () => void;
        y: () => void;
    };
    isVisible?: boolean;
    hide(): void;
    show(): void;
    /**
     * Register an event listener to fire when the layout is updated. We might want to expose support
     * for this via a `motion` prop.
     */
    onLayoutUpdate(callback: LayoutUpdateHandler): () => undefined;
    onLayoutMeasure(callback: LayoutUpdateHandler): () => undefined;
    onViewportBoxUpdate(callback: OnViewportBoxUpdate): () => undefined;
    /**
     * To be called when all layouts are successfully updated. In turn we can notify layoutUpdate
     * subscribers.
     */
    layoutReady(config?: SharedLayoutAnimationConfig): void;
    /**
     * Measure and return the Element's bounding box. We convert it to a AxisBox2D
     * structure to make it easier to work on each individual axis generically.
     */
    getBoundingBox(): AxisBox2D;
    getBoundingBoxWithoutTransforms(): AxisBox2D;
    /**
     * Return the computed style after a render.
     */
    getComputedStyle(): CSSStyleDeclaration;
    /**
     * Record the bounding box as it exists before a re-render.
     */
    snapshotBoundingBox(): void;
    rebaseTargetBox(force?: boolean, box?: AxisBox2D): void;
    /**
     * The viewport scroll at the time of the previous layout measurement.
     */
    viewportScroll: Point2D;
    measureLayout(): void;
    isTargetBoxLocked: boolean;
    lockTargetBox(): void;
    unlockTargetBox(): void;
    /**
     * Reset the transform on the current Element. This is called as part
     * of a batched process across the entire layout tree. To remove this write
     * cycle it'd be interesting to see if it's possible to "undo" all the current
     * layout transforms up the tree in the same way this.getBoundingBoxWithoutTransforms
     * works
     */
    resetTransform(): void;
    /**
     * Set new min/max boundaries to project an axis into
     */
    setAxisTarget(axis: "x" | "y", min: number, max: number): void;
    private axisProgress?;
    getAxisProgress(): MotionPoint;
    /**
     *
     */
    startLayoutAxisAnimation(axis: "x" | "y", transition: Transition): Promise<void> | undefined;
    stopLayoutAnimation(): void;
    updateLayoutDelta: () => void;
    withoutTransform(callback: () => void): void;
    /**
     * Update the layout deltas to reflect the relative positions of the layout
     * and the desired target box
     */
    updateLayoutDeltas(): void;
    updateTransformDeltas(): void;
    /**
     * ========================================
     * Build & render
     * ========================================
     */
    /**
     * Build a style prop using the latest resolved MotionValues
     */
    build(): void;
    /**
     * Render the Element by rebuilding and applying the latest styles and vars.
     */
    render(): void;
}
interface MotionPoint {
    x: MotionValue<number>;
    y: MotionValue<number>;
}
export {};
