import { TargetAndTransition, TargetResolver, Transition } from "../types";
import { VisualElement } from "../render/VisualElement";
declare type ControlsAnimationDefinition = string | string[] | TargetAndTransition | TargetResolver;
/**
 * Control animations on one or more components.
 *
 * @public
 */
export declare class AnimationControls {
    /**
     * Track whether the host component has mounted.
     *
     * @internal
     */
    private hasMounted;
    /**
     * Pending animations that are started before a component is mounted.
     *
     * @internal
     */
    private pendingAnimations;
    /**
     * A collection of linked component animation controls.
     *
     * @internal
     */
    private subscribers;
    /**
     * Subscribes a component's animation controls to this.
     *
     * @param controls - The controls to subscribe
     * @returns An unsubscribe function.
     *
     * @internal
     */
    subscribe(visualElement: VisualElement): () => boolean;
    /**
     * Starts an animation on all linked components.
     *
     * @remarks
     *
     * ```jsx
     * controls.start("variantLabel")
     * controls.start({
     *   x: 0,
     *   transition: { duration: 1 }
     * })
     * ```
     *
     * @param definition - Properties or variant label to animate to
     * @param transition - Optional `transtion` to apply to a variant
     * @returns - A `Promise` that resolves when all animations have completed.
     *
     * @public
     */
    start(definition: ControlsAnimationDefinition, transitionOverride?: Transition): Promise<any>;
    /**
     * Instantly set to a set of properties or a variant.
     *
     * ```jsx
     * // With properties
     * controls.set({ opacity: 0 })
     *
     * // With variants
     * controls.set("hidden")
     * ```
     *
     * @internalremarks
     * We could perform a similar trick to `.start` where this can be called before mount
     * and we maintain a list of of pending actions that get applied on mount. But the
     * expectation of `set` is that it happens synchronously and this would be difficult
     * to do before any children have even attached themselves. It's also poor practise
     * and we should discourage render-synchronous `.start` calls rather than lean into this.
     *
     * @public
     */
    set(definition: ControlsAnimationDefinition): void;
    /**
     * Stops animations on all linked components.
     *
     * ```jsx
     * controls.stop()
     * ```
     *
     * @public
     */
    stop(): void;
    /**
     * Initialises the animation controls.
     *
     * @internal
     */
    mount(): void;
    /**
     * Stops all child animations when the host component unmounts.
     *
     * @internal
     */
    unmount(): void;
}
/**
 * @internal
 */
export declare const animationControls: () => AnimationControls;
export {};
