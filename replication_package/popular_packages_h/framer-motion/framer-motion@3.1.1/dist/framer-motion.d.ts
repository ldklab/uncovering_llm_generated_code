/// <reference types="react" />
import * as CSS from 'csstype';
import { CSSProperties } from 'react';
import { DetailedHTMLFactory } from 'react';
import { Easing as Easing_2 } from 'popmotion';
import { ForwardRefExoticComponent } from 'react';
import { HTMLAttributes } from 'react';
import { PropsWithoutRef } from 'react';
import * as PropTypes from 'prop-types';
import * as React from 'react';
import { ReactHTML } from 'react';
import { Ref } from 'react';
import { RefAttributes } from 'react';
import { RefObject } from 'react';
import { SpringOptions } from 'popmotion';
import { SVGAttributes } from 'react';

/**
 * @internal
 */
export declare function addScaleCorrection(correctors: ScaleCorrectionDefinitionMap): void;

declare type AlwaysPresent = [true, null];

/**
 * Animate a single value or a `MotionValue`.
 *
 * The first argument is either a `MotionValue` to animate, or an initial animation value.
 *
 * The second is either a value to animate to, or an array of keyframes to animate through.
 *
 * The third argument can be either tween or spring options, and optional lifecycle methods: `onUpdate`, `onPlay`, `onComplete`, `onRepeat` and `onStop`.
 *
 * Returns `PlaybackControls`, currently just a `stop` method.
 *
 * ```javascript
 * const x = useMotionValue(0)
 *
 * useEffect(() => {
 *   const controls = animate(x, 100, {
 *     type: "spring",
 *     stiffness: 2000,
 *     onComplete: v => {}
 *   })
 *
 *   return controls.stop
 * })
 * ```
 *
 * @public
 */
export declare function animate<V>(from: MotionValue<V> | V, to: V | V[], transition?: AnimationOptions_2<V>): PlaybackControls;

/**
 * @public
 */
export declare const AnimateLayoutFeature: MotionFeature;

/**
 * `AnimatePresence` enables the animation of components that have been removed from the tree.
 *
 * When adding/removing more than a single child, every child **must** be given a unique `key` prop.
 *
 * @library
 *
 * Any `Frame` components that have an `exit` property defined will animate out when removed from
 * the tree.
 *
 * ```jsx
 * import { Frame, AnimatePresence } from 'framer'
 *
 * // As items are added and removed from `items`
 * export function Items({ items }) {
 *   return (
 *     <AnimatePresence>
 *       {items.map(item => (
 *         <Frame
 *           key={item.id}
 *           initial={{ opacity: 0 }}
 *           animate={{ opacity: 1 }}
 *           exit={{ opacity: 0 }}
 *         />
 *       ))}
 *     </AnimatePresence>
 *   )
 * }
 * ```
 *
 * You can sequence exit animations throughout a tree using variants.
 *
 * @motion
 *
 * Any `motion` components that have an `exit` property defined will animate out when removed from
 * the tree.
 *
 * ```jsx
 * import { motion, AnimatePresence } from 'framer-motion'
 *
 * export const Items = ({ items }) => (
 *   <AnimatePresence>
 *     {items.map(item => (
 *       <motion.div
 *         key={item.id}
 *         initial={{ opacity: 0 }}
 *         animate={{ opacity: 1 }}
 *         exit={{ opacity: 0 }}
 *       />
 *     ))}
 *   </AnimatePresence>
 * )
 * ```
 *
 * You can sequence exit animations throughout a tree using variants.
 *
 * If a child contains multiple `motion` components with `exit` props, it will only unmount the child
 * once all `motion` components have finished animating out. Likewise, any components using
 * `usePresence` all need to call `safeToRemove`.
 *
 * @public
 */
export declare const AnimatePresence: React.FunctionComponent<AnimatePresenceProps>;

/**
 * @public
 */
export declare interface AnimatePresenceProps {
    /**
     * By passing `initial={false}`, `AnimatePresence` will disable any initial animations on children
     * that are present when the component is first rendered.
     *
     * @library
     *
     * ```jsx
     * <AnimatePresence initial={false}>
     *   {isVisible && (
     *     <Frame
     *       key="modal"
     *       initial={{ opacity: 0 }}
     *       animate={{ opacity: 1 }}
     *       exit={{ opacity: 0 }}
     *     />
     *   )}
     * </AnimatePresence>
     * ```
     *
     * @motion
     *
     * ```jsx
     * <AnimatePresence initial={false}>
     *   {isVisible && (
     *     <motion.div
     *       key="modal"
     *       initial={{ opacity: 0 }}
     *       animate={{ opacity: 1 }}
     *       exit={{ opacity: 0 }}
     *     />
     *   )}
     * </AnimatePresence>
     * ```
     *
     * @public
     */
    initial?: boolean;
    /**
     * When a component is removed, there's no longer a chance to update its props. So if a component's `exit`
     * prop is defined as a dynamic variant and you want to pass a new `custom` prop, you can do so via `AnimatePresence`.
     * This will ensure all leaving components animate using the latest data.
     *
     * @public
     */
    custom?: any;
    /**
     * Fires when all exiting nodes have completed animating out.
     *
     * @public
     */
    onExitComplete?: () => void;
    /**
     * If set to `true`, `AnimatePresence` will only render one component at a time. The exiting component
     * will finished its exit animation before the entering component is rendered.
     *
     * @library
     *
     * ```jsx
     * function MyComponent({ currentItem }) {
     *   return (
     *     <AnimatePresence exitBeforeEnter>
     *       <Frame key={currentItem} exit={{ opacity: 0 }} />
     *     </AnimatePresence>
     *   )
     * }
     * ```
     *
     * @motion
     *
     * ```jsx
     * const MyComponent = ({ currentItem }) => (
     *   <AnimatePresence exitBeforeEnter>
     *     <motion.div key={currentItem} exit={{ opacity: 0 }} />
     *   </AnimatePresence>
     * )
     * ```
     *
     * @beta
     */
    exitBeforeEnter?: boolean;
    /**
     * Used in Framer to flag that sibling children *shouldn't* re-render as a result of a
     * child being removed.
     *
     * @internal
     */
    presenceAffectsLayout?: boolean;
}

/**
 * @public
 */
export declare class AnimateSharedLayout extends React.Component<SharedLayoutProps> {
    static contextType: React.Context<import("../../motion/context/MotionContext").MotionContextProps>;
    /**
     * A list of all the children in the shared layout
     */
    private children;
    /**
     * As animate components with a defined `layoutId` are added/removed to the tree,
     * we store them in order. When one is added, it will animate out from the
     * previous one, and when it's removed, it'll animate to the previous one.
     */
    private stacks;
    /**
     * Track whether the component has mounted. If it hasn't, the presence of added children
     * are set to Present, whereas if it has they're considered Entering
     */
    private hasMounted;
    /**
     * Track whether we already have an update scheduled. If we don't, we'll run snapshots
     * and schedule one.
     */
    private updateScheduled;
    /**
     * Tracks whether we already have a render scheduled. If we don't, we'll force one with this.forceRender
     */
    private renderScheduled;
    /**
     * The methods provided to all children in the shared layout tree.
     */
    syncContext: SharedLayoutSyncMethods;
    componentDidMount(): void;
    componentDidUpdate(): void;
    shouldComponentUpdate(): boolean;
    startLayoutAnimation(): void;
    updateStacks(): void;
    scheduleUpdate(force?: boolean): void;
    addChild(child: HTMLVisualElement): void;
    removeChild(child: HTMLVisualElement): void;
    addToStack(child: HTMLVisualElement): void;
    removeFromStack(child: HTMLVisualElement): void;
    /**
     * Return a stack of animate children based on the provided layoutId.
     * Will create a stack if none currently exists with that layoutId.
     */
    getStack(id?: string): LayoutStack | undefined;
    render(): JSX.Element;
}

/**
 * @internal
 */
export declare function animateVisualElement(visualElement: VisualElement, definition: AnimationDefinition, options?: AnimationOptions): Promise<void>;

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

declare type AnimationDefinition = VariantLabels | TargetAndTransition | TargetResolver;

/**
 * @public
 */
export declare const AnimationFeature: MotionFeature;

declare type AnimationOptions = {
    delay?: number;
    transitionOverride?: Transition;
    custom?: any;
    type?: AnimationType;
};

declare type AnimationOptions_2<V> = (Tween | Spring) & PlaybackLifecycles<V> & {
    delay?: number;
    type?: "tween" | "spring";
};

/**
 * @public
 */
export declare interface AnimationProps {
    /**
     * Values to animate to, variant label(s), or `AnimationControls`.
     *
     * @library
     *
     * ```jsx
     * // As values
     * <Frame animate={{ opacity: 1 }} />
     *
     * // As variant
     * <Frame animate="visible" variants={variants} />
     *
     * // Multiple variants
     * <Frame animate={["visible", "active"]} variants={variants} />
     *
     * // AnimationControls
     * <Frame animate={animation} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * // As values
     * <motion.div animate={{ opacity: 1 }} />
     *
     * // As variant
     * <motion.div animate="visible" variants={variants} />
     *
     * // Multiple variants
     * <motion.div animate={["visible", "active"]} variants={variants} />
     *
     * // AnimationControls
     * <motion.div animate={animation} />
     * ```
     */
    animate?: AnimationControls | TargetAndTransition | VariantLabels | boolean;
    /**
     * A target to animate to when this component is removed from the tree.
     *
     * This component **must** be the first animatable child of an `AnimatePresence` to enable this exit animation.
     *
     * This limitation exists because React doesn't allow components to defer unmounting until after
     * an animation is complete. Once this limitation is fixed, the `AnimatePresence` component will be unnecessary.
     *
     * @library
     *
     * ```jsx
     * import { Frame, AnimatePresence } from 'framer'
     *
     * export function MyComponent(props) {
     *   return (
     *     <AnimatePresence>
     *        {props.isVisible && (
     *          <Frame
     *            initial={{ opacity: 0 }}
     *            animate={{ opacity: 1 }}
     *            exit={{ opacity: 0 }}
     *          />
     *        )}
     *     </AnimatePresence>
     *   )
     * }
     * ```
     *
     * @motion
     *
     * ```jsx
     * import { AnimatePresence, motion } from 'framer-motion'
     *
     * export const MyComponent = ({ isVisible }) => {
     *   return (
     *     <AnimatePresence>
     *        {isVisible && (
     *          <motion.div
     *            initial={{ opacity: 0 }}
     *            animate={{ opacity: 1 }}
     *            exit={{ opacity: 0 }}
     *          />
     *        )}
     *     </AnimatePresence>
     *   )
     * }
     * ```
     */
    exit?: TargetAndTransition | VariantLabels;
    /**
     * Variants allow you to define animation states and organise them by name. They allow
     * you to control animations throughout a component tree by switching a single `animate` prop.
     *
     * Using `transition` options like `delayChildren` and `staggerChildren`, you can orchestrate
     * when children animations play relative to their parent.
     *
     * @library
     *
     * After passing variants to one or more `Frame`'s `variants` prop, these variants
     * can be used in place of values on the `animate`, `initial`, `whileFocus`, `whileTap` and `whileHover` props.
     *
     * ```jsx
     * const variants = {
     *   active: {
     *     backgroundColor: "#f00"
     *   },
     *   inactive: {
     *     backgroundColor: "#fff",
     *     transition: { duration: 2 }
     *   }
     * }
     *
     * <Frame variants={variants} animate="active" />
     * ```
     *
     * @motion
     *
     * After passing variants to one or more `motion` component's `variants` prop, these variants
     * can be used in place of values on the `animate`, `initial`, `whileFocus`, `whileTap` and `whileHover` props.
     *
     * ```jsx
     * const variants = {
     *   active: {
     *       backgroundColor: "#f00"
     *   },
     *   inactive: {
     *     backgroundColor: "#fff",
     *     transition: { duration: 2 }
     *   }
     * }
     *
     * <motion.div variants={variants} animate="active" />
     * ```
     */
    variants?: Variants;
    /**
     * Default transition. If no `transition` is defined in `animate`, it will use the transition defined here.
     *
     * @library
     *
     * ```jsx
     * const spring = {
     *   type: "spring",
     *   damping: 10,
     *   stiffness: 100
     * }
     *
     * <Frame transition={spring} animate={{ scale: 1.2 }} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * const spring = {
     *   type: "spring",
     *   damping: 10,
     *   stiffness: 100
     * }
     *
     * <motion.div transition={spring} animate={{ scale: 1.2 }} />
     * ```
     */
    transition?: Transition;
}

declare interface AnimationState {
    setProps: (props: MotionProps, context?: VariantContextProps, options?: AnimationOptions, type?: AnimationType) => Promise<any>;
    setActive: (type: AnimationType, isActive: boolean, options?: AnimationOptions) => Promise<any>;
    setAnimateFunction: (fn: any) => void;
    getProtectedKeys: (type: AnimationType) => {
        [key: string]: any;
    };
}

declare enum AnimationType {
    Animate = "animate",
    Hover = "whileHover",
    Tap = "whileTap",
    Drag = "whileDrag",
    Focus = "whileFocus",
    Exit = "exit"
}

declare type AnyPointerEvent = MouseEvent | TouchEvent | PointerEvent;

/**
 * A description of a single axis using non-axis specific terms to denote the min and max
 * value of any axis.
 *
 * @public
 */
export declare interface Axis {
    min: number;
    max: number;
}

/**
 * A description of a bounding box describing each axis individually. This allows us
 * to treate each axis generically.
 *
 * @public
 */
export declare interface AxisBox2D {
    x: Axis;
    y: Axis;
}

/**
 * @public
 */
export declare interface AxisBox3D extends AxisBox2D {
    z: Axis;
}

/**
 * The transform delta that, when applied to Axis a will visually transform it to Axis b
 * @public
 */
export declare interface AxisDelta {
    translate: number;
    scale: number;
    origin: number;
    originPoint: number;
}

declare type Booleanish = boolean | 'true' | 'false';

/**
 * A typically user-facing description of a bounding box using traditional t/l/r/b
 *
 * @public
 */
export declare interface BoundingBox2D {
    top: number;
    left: number;
    bottom: number;
    right: number;
}

/**
 * A 3D bounding box
 *
 * @public
 */
export declare interface BoundingBox3D extends BoundingBox2D {
    front: number;
    back: number;
}

/**
 * The transform delta that, when applied to Box a will visually transform it to Box b.
 * @public
 */
export declare interface BoxDelta {
    x: AxisDelta;
    y: AxisDelta;
}

declare type ControlsAnimationDefinition = string | string[] | TargetAndTransition | TargetResolver;

/**
 * Create a batcher to process VisualElements
 */
export declare function createBatcher(): SyncLayoutBatcher;

/**
 * Create a DOM `motion` component with the provided string. This is primarily intended
 * as a full alternative to `motion` for consumers who have to support environments that don't
 * support `Proxy`.
 *
 * ```javascript
 * import { createDomMotionComponent } from "framer-motion"
 *
 * const motion = {
 *   div: createDomMotionComponent('div')
 * }
 * ```
 *
 * @public
 */
export declare function createDomMotionComponent(key: string): React.ForwardRefExoticComponent<MotionProps & React.RefAttributes<unknown>>;

/**
 * Create a `motion` component.
 *
 * This function accepts a Component argument, which can be either a string (ie "div"
 * for `motion.div`), or an actual React component.
 *
 * Alongside this is a config option which provides a way of rendering the provided
 * component "offline", or outside the React render cycle.
 *
 * @internal
 */
export declare function createMotionComponent<P extends {}, E>(Component: string | React.ComponentType<P>, { defaultFeatures, useVisualElement, useRender }: MotionComponentConfig<E>): React.ForwardRefExoticComponent<React.PropsWithoutRef<P & MotionProps> & React.RefAttributes<E>>;

declare type CSSPropertiesWithoutTransitionOrSingleTransforms = Omit<CSSProperties, "transition" | "rotate" | "scale" | "perspective">;

/**
 * I'd rather the return type of `custom` to be implicit but this throws
 * incorrect relative paths in the exported types and API Extractor throws
 * a wobbly.
 */
export declare type CustomDomComponent<Props> = React.ForwardRefExoticComponent<React.PropsWithoutRef<Props & MotionProps> & React.RefAttributes<SVGElement | HTMLElement>>;

declare interface CustomStyles {
    /**
     * Framer Library custom prop types. These are not actually supported in Motion - preferably
     * we'd have a way of external consumers injecting supported styles into this library.
     */
    size?: string | number;
    radius?: string | number;
    shadow?: string;
    image?: string;
}

/**
 * @public
 */
export declare interface CustomValueType {
    mix: (from: any, to: any) => (p: number) => number | string;
    toValue: () => number | string;
}

declare type Cycle = (i?: number) => void;

declare type CycleState<T> = [T, Cycle];

/**
 * Configuration for the HTML and SVGVisualElement renderers.
 */
declare interface DOMVisualElementConfig extends VisualElementConfig {
    /**
     * Whether to permit `transform: none` if the calculated transform equals zero.
     */
    allowTransformNone?: boolean;
    /**
     * Whether to enable hardware acceleration. This will force the layer to the GPU
     * by setting `translateZ(0)` to the transform style.
     */
    enableHardwareAcceleration?: boolean;
    /**
     * An optional function that can take a page point and return a new one.
     * Used to enable drag and layout animations in the scaled canvases of Framer Desktop preview.
     */
    transformPagePoint?: TransformPoint2D;
    /**
     * A function that can accept the generated transform property and return a new one.
     * Used for custom transform property orders. In the medium-term I'd like to ditch this
     * and replace with a template function that can scoop up other animated values so
     * we can do, for instance:
     *
     * ```jsx
     * <motion.div
     *   animate={{ blur: 20 }}
     *   style={{ filter: combine`blur(${"blur"}px)` }}
     * />
     * ```
     */
    transformTemplate?: MotionProps["transformTemplate"];
    transformValues?: MotionProps["transformValues"];
    transition?: MotionProps["transition"];
    safeToRemove?: () => void;
}

declare interface DragControlConfig {
    visualElement: HTMLVisualElement;
}

declare interface DragControlOptions {
    snapToCursor?: boolean;
    cursorProgress?: Point2D;
}

/**
 * Can manually trigger a drag gesture on one or more `drag`-enabled `motion` components.
 *
 * @library
 *
 * ```jsx
 * const dragControls = useDragControls()
 *
 * function startDrag(event) {
 *   dragControls.start(event, { snapToCursor: true })
 * }
 *
 * return (
 *   <>
 *     <Frame onTapStart={startDrag} />
 *     <Frame drag="x" dragControls={dragControls} />
 *   </>
 * )
 * ```
 *
 * @motion
 *
 * ```jsx
 * const dragControls = useDragControls()
 *
 * function startDrag(event) {
 *   dragControls.start(event, { snapToCursor: true })
 * }
 *
 * return (
 *   <>
 *     <div onPointerDown={startDrag} />
 *     <motion.div drag="x" dragControls={dragControls} />
 *   </>
 * )
 * ```
 *
 * @public
 */
export declare class DragControls {
    private componentControls;
    /**
     * Subscribe a component's internal `VisualElementDragControls` to the user-facing API.
     *
     * @internal
     */
    subscribe(controls: VisualElementDragControls): () => void;
    /**
     * Start a drag gesture on every `motion` component that has this set of drag controls
     * passed into it via the `dragControls` prop.
     *
     * ```jsx
     * dragControls.start(e, {
     *   snapToCursor: true
     * })
     * ```
     *
     * @param event - PointerEvent
     * @param options - Options
     *
     * @public
     */
    start(event: React.MouseEvent | React.TouchEvent | React.PointerEvent | MouseEvent | TouchEvent | PointerEvent, options?: DragControlOptions): void;
    updateConstraints(): void;
}

declare interface DragControlsProps extends DraggableProps {
    transformPagePoint?: TransformPoint2D;
}

declare type DragDirection = "x" | "y";

/**
 * @public
 */
export declare const DragFeature: MotionFeature;

/**
 * @public
 */
export declare interface DraggableProps extends DragHandlers {
    /**
     * Enable dragging for this element. Set to `false` by default.
     * Set `true` to drag in both directions.
     * Set `"x"` or `"y"` to only drag in a specific direction.
     *
     * @library
     *
     * ```jsx
     * <Frame drag="x" />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div drag="x" />
     * ```
     */
    drag?: boolean | "x" | "y";
    /**
     * Properties or variant label to animate to while the drag gesture is recognised.
     *
     * ```jsx
     * <motion.div whileDrag={{ scale: 1.2 }} />
     * ```
     */
    whileDrag?: VariantLabels | TargetAndTransition;
    /**
     * If `true`, this will lock dragging to the initially-detected direction. Defaults to `false`.
     *
     * @library
     *
     * ```jsx
     * <Frame drag={true} dragDirectionLock={true} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div drag dragDirectionLock />
     * ```
     */
    dragDirectionLock?: boolean;
    /**
     * Allows drag gesture propagation to child components. Set to `false` by
     * default.
     *
     * @library
     *
     * ```jsx
     * <Frame drag="x" dragPropagation={true} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div drag="x" dragPropagation />
     * ```
     */
    dragPropagation?: boolean;
    /**
     * Applies constraints on the permitted draggable area.
     *
     * It can accept an object of optional `top`, `left`, `right`, and `bottom` values, measured in pixels.
     * This will define a distance the named edge of the draggable component.
     *
     * Alternatively, it can accept a `ref` to another component created with React's `useRef` hook.
     * This `ref` should be passed both to the draggable component's `dragConstraints` prop, and the `ref`
     * of the component you want to use as constraints.
     *
     * @library
     *
     * ```jsx
     * // In pixels
     * <Frame
     *   drag="x"
     *   dragConstraints={{ left: 0, right: 300 }}
     * />
     *
     * // As a ref to another component
     * function MyComponent() {
     *   const constraintsRef = useRef(null)
     *
     *   return (
     *      <Frame ref={constraintsRef} width={400} height={400}>
     *          <Frame drag dragConstraints={constraintsRef} />
     *      </Frame>
     *   )
     * }
     * ```
     *
     * @motion
     *
     * ```jsx
     * // In pixels
     * <motion.div
     *   drag="x"
     *   dragConstraints={{ left: 0, right: 300 }}
     * />
     *
     * // As a ref to another component
     * const MyComponent = () => {
     *   const constraintsRef = useRef(null)
     *
     *   return (
     *      <motion.div ref={constraintsRef}>
     *          <motion.div drag dragConstraints={constraintsRef} />
     *      </motion.div>
     *   )
     * }
     * ```
     */
    dragConstraints?: false | Partial<BoundingBox2D> | RefObject<Element>;
    /**
     * The degree of movement allowed outside constraints. 0 = no movement, 1 =
     * full movement. Set to `0.5` by default.
     *
     * @library
     *
     * ```jsx
     * <Frame
     *   drag={true}
     *   dragConstraints={{ left: 0, right: 300 }}
     *   dragElastic={0.2}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragConstraints={{ left: 0, right: 300 }}
     *   dragElastic={0.2}
     * />
     * ```
     */
    dragElastic?: boolean | number;
    /**
     * Apply momentum from the pan gesture to the component when dragging
     * finishes. Set to `true` by default.
     *
     * @library
     *
     * ```jsx
     * <Frame
     *   drag={true}
     *   dragConstraints={{ left: 0, right: 300 }}
     *   dragMomentum={false}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragConstraints={{ left: 0, right: 300 }}
     *   dragMomentum={false}
     * />
     * ```
     */
    dragMomentum?: boolean;
    /**
     * Allows you to change dragging inertia parameters.
     * When releasing a draggable Frame, an animation with type `inertia` starts. The animation is based on your dragging velocity. This property allows you to customize it.
     * See {@link https://framer.com/api/animation/#inertia | Inertia} for all properties you can use.
     *
     * @library
     *
     * ```jsx
     * <Frame
     *   drag={true}
     *   dragTransition={{ bounceStiffness: 600, bounceDamping: 10 }}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragTransition={{ bounceStiffness: 600, bounceDamping: 10 }}
     * />
     * ```
     */
    dragTransition?: InertiaOptions;
    /**
     * Usually, dragging is initiated by pressing down on a component and moving it. For some
     * use-cases, for instance clicking at an arbitrary point on a video scrubber, we
     * might want to initiate dragging from a different component than the draggable one.
     *
     * By creating a `dragControls` using the `useDragControls` hook, we can pass this into
     * the draggable component's `dragControls` prop. It exposes a `start` method
     * that can start dragging from pointer events on other components.
     *
     * @library
     *
     * ```jsx
     * const dragControls = useDragControls()
     *
     * function startDrag(event) {
     *   dragControls.start(event, { snapToCursor: true })
     * }
     *
     * return (
     *   <>
     *     <Frame onTapStart={startDrag} />
     *     <Frame drag="x" dragControls={dragControls} />
     *   </>
     * )
     * ```
     *
     * @motion
     *
     * ```jsx
     * const dragControls = useDragControls()
     *
     * function startDrag(event) {
     *   dragControls.start(event, { snapToCursor: true })
     * }
     *
     * return (
     *   <>
     *     <div onPointerDown={startDrag} />
     *     <motion.div drag="x" dragControls={dragControls} />
     *   </>
     * )
     * ```
     */
    dragControls?: DragControls;
    /**
     * By default, if `drag` is defined on a component then an event listener will be attached
     * to automatically initiate dragging when a user presses down on it.
     *
     * By setting `dragListener` to `false`, this event listener will not be created.
     *
     * @library
     *
     * ```jsx
     * const dragControls = useDragControls()
     *
     * function startDrag(event) {
     *   dragControls.start(event, { snapToCursor: true })
     * }
     *
     * return (
     *   <>
     *     <Frame onTapStart={startDrag} />
     *     <Frame
     *       drag="x"
     *       dragControls={dragControls}
     *       dragListener={false}
     *     />
     *   </>
     * )
     * ```
     *
     * @motion
     *
     * ```jsx
     * const dragControls = useDragControls()
     *
     * function startDrag(event) {
     *   dragControls.start(event, { snapToCursor: true })
     * }
     *
     * return (
     *   <>
     *     <div onPointerDown={startDrag} />
     *     <motion.div
     *       drag="x"
     *       dragControls={dragControls}
     *       dragListener={false}
     *     />
     *   </>
     * )
     * ```
     */
    dragListener?: boolean;
    /**
     * If `dragConstraints` is set to a React ref, this callback will call with the measured drag constraints.
     *
     * @public
     */
    onMeasureDragConstraints?: (constraints: BoundingBox2D) => BoundingBox2D | void;
    /**
     * Usually, dragging uses the layout project engine, and applies transforms to the underlying VisualElement.
     * Passing MotionValues as _dragX and _dragY instead applies drag updates to these motion values.
     * This allows you to manually control how updates from a drag gesture on an element is applied.
     *
     * @public
     */
    _dragX?: MotionValue<number>;
    /**
     * Usually, dragging uses the layout project engine, and applies transforms to the underlying VisualElement.
     * Passing MotionValues as _dragX and _dragY instead applies drag updates to these motion values.
     * This allows you to manually control how updates from a drag gesture on an element is applied.
     *
     * @public
     */
    _dragY?: MotionValue<number>;
}

/**
 * @public
 */
export declare interface DragHandlers {
    /**
     * Callback function that fires when dragging starts.
     *
     * @library
     *
     * ```jsx
     * function onDragStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame drag onDragStart={onDragStart} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   onDragStart={
     *     (event, info) => console.log(info.point.x, info.point.y)
     *   }
     * />
     * ```
     *
     * @public
     */
    onDragStart?(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void;
    /**
     * Callback function that fires when dragging ends.
     *
     * @library
     *
     * ```jsx
     * function onDragEnd(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame drag onDragEnd={onDragEnd} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   onDragEnd={
     *     (event, info) => console.log(info.point.x, info.point.y)
     *   }
     * />
     * ```
     *
     * @public
     */
    onDragEnd?(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void;
    /**
     * Callback function that fires when the component is dragged.
     *
     * @library
     *
     * ```jsx
     * function onDrag(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame drag onDrag={onDrag} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   onDrag={
     *     (event, info) => console.log(info.point.x, info.point.y)
     *   }
     * />
     * ```
     *
     * @public
     */
    onDrag?(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void;
    /**
     * Callback function that fires a drag direction is determined.
     *
     * @library
     *
     * ```jsx
     * function onDirectionLock(axis) {
     *   console.log(axis)
     * }
     *
     * <Frame
     *   drag
     *   dragDirectionLock
     *   onDirectionLock={onDirectionLock}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragDirectionLock
     *   onDirectionLock={axis => console.log(axis)}
     * />
     * ```
     *
     * @public
     */
    onDirectionLock?(axis: "x" | "y"): void;
    /**
     * Callback function that fires when drag momentum/bounce transition finishes.
     *
     * @library
     *
     * ```jsx
     * function onDragTransitionEnd() {
     *   console.log('drag transition has ended')
     * }
     *
     * <Frame
     *   drag
     *   onDragTransitionEnd={onDragTransitionEnd}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   onDragTransitionEnd={() => console.log('Drag transition complete')}
     * />
     * ```
     *
     * @public
     */
    onDragTransitionEnd?(): void;
}

/**
 * The easing function to use. Set as one of:
 *
 * - The name of an in-built easing function.
 * - An array of four numbers to define a cubic bezier curve.
 * - An easing function, that accepts and returns a progress value between `0` and `1`.
 *
 * @public
 */
declare type Easing = [number, number, number, number] | "linear" | "easeIn" | "easeOut" | "easeInOut" | "circIn" | "circOut" | "circInOut" | "backIn" | "backOut" | "backInOut" | "anticipate" | EasingFunction;

/**
 * A function that accepts a progress value between `0` and `1` and returns a
 * new one.
 *
 * @library
 *
 * ```jsx
 * const transition = {
 *   ease: progress => progress * progress
 * }
 *
 * <Frame
 *   animate={{ opacity: 0 }}
 *   transition={transition}
 * />
 * ```
 *
 * @motion
 *
 * ```jsx
 * <motion.div
 *   animate={{ opacity: 0 }}
 *   transition={{
 *     duration: 1,
 *     ease: progress => progress * progress
 *   }}
 * />
 * ```
 *
 * @public
 */
export declare type EasingFunction = (v: number) => number;

/** @public */
export declare interface EventInfo {
    point: Point2D;
}

/**
 * @public
 */
export declare const ExitFeature: MotionFeature;

/**
 * @public
 */
export declare interface FeatureProps extends MotionProps {
    visualElement: HTMLVisualElement;
}

/**
 * @public
 */
export declare interface FocusHandlers {
    /**
     * Properties or variant label to animate to while the focus gesture is recognised.
     *
     * @motion
     *
     * ```jsx
     * <motion.input whileFocus={{ scale: 1.2 }} />
     * ```
     */
    whileFocus?: VariantLabels | TargetAndTransition;
}

/**
 * @public
 */
export declare type ForwardRefComponent<T, P> = ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;

/**
 * @internal
 */
export declare const FramerTreeLayoutContext: import("react").Context<SyncLayoutBatcher | SharedLayoutSyncMethods>;

declare type GenericHandler = (...args: any) => void;

/**
 * @public
 */
export declare type GestureHandlers = PanHandlers & TapHandlers & HoverHandlers & FocusHandlers;

/**
 * @public
 */
export declare const GesturesFeature: MotionFeature;

/**
 * @public
 */
export declare interface HoverHandlers {
    /**
     * Properties or variant label to animate to while the hover gesture is recognised.
     *
     * @library
     *
     * ```jsx
     * <Frame whileHover={{ scale: 1.2 }} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div whileHover={{ scale: 1.2 }} />
     * ```
     */
    whileHover?: VariantLabels | TargetAndTransition;
    /**
     * Callback function that fires when pointer starts hovering over the component.
     *
     * @library
     *
     * ```jsx
     * function onHoverStart(event) {
     *   console.log("Hover starts")
     * }
     *
     * <Frame onHoverStart={onHoverStart} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div onHoverStart={() => console.log('Hover starts')} />
     * ```
     */
    onHoverStart?(event: MouseEvent, info: EventInfo): void;
    /**
     * Callback function that fires when pointer stops hovering over the component.
     *
     * @library
     *
     * ```jsx
     * function onHoverEnd(event) {
     *   console.log("Hover ends")
     * }
     *
     * <Frame onHoverEnd={onHoverEnd} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div onHoverEnd={() => console.log("Hover ends")} />
     * ```
     */
    onHoverEnd?(event: MouseEvent, info: EventInfo): void;
}

declare type HTMLAttributesWithoutMotionProps<Attributes extends HTMLAttributes<Element>, Element extends HTMLElement> = {
    [K in Exclude<keyof Attributes, keyof MotionProps>]?: Attributes[K];
};

declare type HTMLElements = UnionStringArray<typeof htmlElements>;

/**
 * @internal
 */
declare const htmlElements: readonly ["a", "abbr", "address", "area", "article", "aside", "audio", "b", "base", "bdi", "bdo", "big", "blockquote", "body", "br", "button", "canvas", "caption", "cite", "code", "col", "colgroup", "data", "datalist", "dd", "del", "details", "dfn", "dialog", "div", "dl", "dt", "em", "embed", "fieldset", "figcaption", "figure", "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "head", "header", "hgroup", "hr", "html", "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend", "li", "link", "main", "map", "mark", "menu", "menuitem", "meta", "meter", "nav", "noscript", "object", "ol", "optgroup", "option", "output", "p", "param", "picture", "pre", "progress", "q", "rp", "rt", "ruby", "s", "samp", "script", "section", "select", "small", "source", "span", "strong", "style", "sub", "summary", "sup", "table", "tbody", "td", "textarea", "tfoot", "th", "thead", "time", "title", "tr", "track", "u", "ul", "var", "video", "wbr", "webview"];

/**
 * Motion-optimised versions of React's HTML components.
 *
 * @public
 */
declare type HTMLMotionComponents = {
    [K in HTMLElements]: ForwardRefComponent<UnwrapFactoryElement<ReactHTML[K]>, HTMLMotionProps<K>>;
};

/**
 * @public
 */
export declare type HTMLMotionProps<TagName extends keyof ReactHTML> = HTMLAttributesWithoutMotionProps<UnwrapFactoryAttributes<ReactHTML[TagName]>, UnwrapFactoryElement<ReactHTML[TagName]>> & MotionProps;

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

/**
 * An animation that decelerates a value based on its initial velocity,
 * usually used to implement inertial scrolling.
 *
 * Optionally, `min` and `max` boundaries can be defined, and inertia
 * will snap to these with a spring animation.
 *
 * This animation will automatically precalculate a target value,
 * which can be modified with the `modifyTarget` property.
 *
 * This allows you to add snap-to-grid or similar functionality.
 *
 * Inertia is also the animation used for `dragTransition`, and can be configured via that prop.
 *
 * @public
 */
export declare interface Inertia {
    /**
     * Set `type` to animate using the inertia animation. Set to `"tween"` by
     * default. This can be used for natural deceleration, like momentum scrolling.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   type: "inertia",
     *   velocity: 50
     * }
     *
     * <Frame
     *   animate={{ rotate: 180 }}
     *   transition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   animate={{ rotate: 180 }}
     *   transition={{ type: "inertia", velocity: 50 }}
     * />
     * ```
     *
     * @public
     */
    type: "inertia";
    /**
     * A function that receives the automatically-calculated target and returns a new one. Useful for snapping the target to a grid.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   power: 0,
     *   // Snap calculated target to nearest 50 pixels
     *   modifyTarget: target => Math.round(target / 50) * 50
     * }
     *
     * <Frame
     *   drag
     *   dragTransition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragTransition={{
     *     power: 0,
     *     // Snap calculated target to nearest 50 pixels
     *     modifyTarget: target => Math.round(target / 50) * 50
     *   }}
     * />
     * ```
     *
     * @public
     */
    modifyTarget?(v: number): number;
    /**
     * If `min` or `max` is set, this affects the stiffness of the bounce
     * spring. Higher values will create more sudden movement. Set to `500` by
     * default.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   min: 0,
     *   max: 100,
     *   bounceStiffness: 100
     * }
     *
     * <Frame
     *   drag
     *   dragTransition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragTransition={{
     *     min: 0,
     *     max: 100,
     *     bounceStiffness: 100
     *   }}
     * />
     * ```
     *
     * @public
     */
    bounceStiffness?: number;
    /**
     * If `min` or `max` is set, this affects the damping of the bounce spring.
     * If set to `0`, spring will oscillate indefinitely. Set to `10` by
     * default.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   min: 0,
     *   max: 100,
     *   bounceDamping: 8
     * }
     *
     * <Frame
     *   drag
     *   dragTransition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragTransition={{
     *     min: 0,
     *     max: 100,
     *     bounceDamping: 8
     *   }}
     * />
     * ```
     *
     * @public
     */
    bounceDamping?: number;
    /**
     * A higher power value equals a further target. Set to `0.8` by default.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   min: 0,
     *   max: 100,
     *   power: 0.2
     * }
     *
     * <Frame
     *   drag
     *   dragTransition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragTransition={{ power: 0.2 }}
     * />
     * ```
     *
     * @public
     */
    power?: number;
    /**
     * Adjusting the time constant will change the duration of the
     * deceleration, thereby affecting its feel. Set to `700` by default.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   min: 0,
     *   max: 100,
     *   timeConstant: 200
     * }
     *
     * <Frame
     *   drag
     *   dragTransition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragTransition={{ timeConstant: 200 }}
     * />
     * ```
     *
     * @public
     */
    timeConstant?: number;
    /**
     * End the animation if the distance to the animation target is below this value, and the absolute speed is below `restSpeed`.
     * When the animation ends, the value gets snapped to the animation target. Set to `0.01` by default.
     * Generally the default values provide smooth animation endings, only in rare cases should you need to customize these.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   min: 0,
     *   max: 100,
     *   restDelta: 10
     * }
     *
     * <Frame
     *   drag
     *   dragTransition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragTransition={{ restDelta: 10 }}
     * />
     * ```
     *
     * @public
     */
    restDelta?: number;
    /**
     * Minimum constraint. If set, the value will "bump" against this value (or immediately spring to it if the animation starts as less than this value).
     *
     * @library
     *
     * ```jsx
     * <Frame
     *   drag
     *   dragTransition={{ min: 0, max: 100 }}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragTransition={{ min: 0, max: 100 }}
     * />
     * ```
     *
     * @public
     */
    min?: number;
    /**
     * Maximum constraint. If set, the value will "bump" against this value (or immediately snap to it, if the initial animation value exceeds this value).
     *
     * @library
     *
     * ```jsx
     * <Frame
     *   drag
     *   dragTransition={{ min: 0, max: 100 }}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   drag
     *   dragTransition={{ min: 0, max: 100 }}
     * />
     * ```
     *
     * @public
     */
    max?: number;
    /**
     * The value to animate from. By default, this is the current state of the animating value.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   min: 0,
     *   max: 100,
     *   from: 50
     * }
     *
     * <Frame
     *   drag
     *   dragTransition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <Frame
     *   drag
     *   dragTransition={{ from: 50 }}
     * />
     * ```
     *
     * @public
     */
    from?: number | string;
    /**
     * The initial velocity of the animation.
     * By default this is the current velocity of the component.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   type: "inertia",
     *   velocity: 200
     * }
     *
     * <Frame
     *   animate={{ rotate: 180 }}
     *   transition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   animate={{ rotate: 180 }}
     *   transition={{ type: 'inertia', velocity: 200 }}
     * />
     * ```
     *
     * @public
     */
    velocity?: number;
    /**
     * @internal
     */
    delay?: number;
}

/**
 * @public
 */
declare type InertiaOptions = Partial<Omit<Inertia, "velocity" | "type">>;

declare type InputRange = number[];

/**
 * Check whether a prop name is a valid `MotionProp` key.
 *
 * @param key - Name of the property to check
 * @returns `true` is key is a valid `MotionProp`.
 *
 * @public
 */
export declare function isValidMotionProp(key: string): boolean;

/**
 * @internal
 */
declare interface Just {
    type: "just";
    to?: number | string | ValueTarget;
    from?: number | string;
    delay?: number;
    velocity?: number;
}

/**
 * Keyframes tweens between multiple `values`.
 *
 * These tweens can be arranged using the `duration`, `easings`, and `times` properties.
 *
 * @internalremarks
 * We could possibly make the `type` property redundant, if not for all animations
 * then for this one quite easily.
 *
 * @internal
 */
export declare interface Keyframes {
    /**
     * Set `type` to `"keyframes"` to animate using the keyframes animation.
     * Set to `"tween"` by default. This can be used to animate between a series of values.
     *
     * @public
     */
    type: "keyframes";
    /**
     * An array of values to animate between.
     *
     * @internal
     */
    values: KeyframesTarget;
    /**
     * An array of numbers between 0 and 1, where `1` represents the `total` duration.
     *
     * Each value represents at which point during the animation each item in the animation target should be hit, so the array should be the same length as `values`.
     *
     * Defaults to an array of evenly-spread durations.
     *
     * @public
     */
    times?: number[];
    /**
     * An array of easing functions for each generated tween, or a single easing function applied to all tweens.
     *
     * This array should be one item less than `values`, as these easings apply to the transitions *between* the `values`.
     *
     * ```jsx
     * const transition = {
     *   backgroundColor: {
     *     type: 'keyframes',
     *     easings: ['circIn', 'circOut']
     *   }
     * }
     * ```
     *
     * @public
     */
    ease?: Easing | Easing[];
    /**
     * Popmotion's easing prop to define individual easings. `ease` will be mapped to this prop in keyframes animations.
     *
     * @internal
     */
    easings?: Easing | Easing[];
    /**
     * @internal
     */
    elapsed?: number;
    /**
     * The total duration of the animation. Set to `0.3` by default.
     *
     * ```jsx
     * const transition = {
     *   type: "keyframes",
     *   duration: 2
     * }
     *
     * <Frame
     *   animate={{ opacity: 0 }}
     *   transition={transition}
     * />
     * ```
     *
     * @public
     */
    duration?: number;
    /**
     * @public
     */
    repeatDelay?: number;
    /**
     * @internal
     */
    from?: number | string;
    /**
     * @internal
     */
    to?: number | string | ValueTarget;
    /**
     * @internal
     */
    velocity?: number;
    /**
     * @internal
     */
    delay?: number;
}

/**
 * @public
 */
export declare type KeyframesTarget = ResolvedKeyframesTarget | [null, ...CustomValueType[]] | CustomValueType[];

/**
 * @internal
 */
export declare const LayoutGroupContext: import("react").Context<string | null>;

/**
 * @public
 */
export declare interface LayoutProps {
    /**
     * If `true`, this component will automatically animate to its new position when
     * its layout changes.
     *
     * ```jsx
     * <motion.div layout />
     * ```
     *
     * This will perform a layout animation using performant transforms. Part of this technique
     * involved animating an element's scale. This can introduce visual distortions on children,
     * `boxShadow` and `borderRadius`.
     *
     * To correct distortion on immediate children, add `layout` to those too.
     *
     * `boxShadow` and `borderRadius` will automatically be corrected if they are already being
     * animated on this component. Otherwise, set them directly via the `initial` prop.
     *
     * If `layout` is set to `"position"`, the size of the component will change instantly and
     * only its position will animate.
     *
     * @public
     */
    layout?: boolean | "position";
    /**
     * Enable shared layout transitions between components for children of `AnimateSharedLayout`.
     *
     * When a component with a layoutId is removed from the React tree, and then
     * added elsewhere, it will visually animate from the previous component's bounding box
     * and its latest animated values.
     *
     * ```jsx
     * <AnimateSharedLayout>
     *   {items.map(item => (
     *      <motion.li layout>
     *         {item.name}
     *         {item.isSelected && <motion.div layoutId="underline" />}
     *      </motion.li>
     *   ))}
     * </AnimateSharedLayout>
     * ```
     *
     * If the previous component remains in the tree it will either get hidden immediately or,
     * if `type="crossfade"` is set on `AnimateSharedLayout`, it will crossfade to the new component.
     *
     * @public
     */
    layoutId?: string;
    /**
     * A callback that will fire when a layout animation on this component completes.
     *
     * @public
     */
    onLayoutAnimationComplete?(): void;
    /**
     * A callback that fires whenever the viewport-relative bounding box updates.
     *
     * @public
     */
    onViewportBoxUpdate?(box: AxisBox2D, delta: BoxDelta): void;
}

declare class LayoutStack {
    order: HTMLVisualElement[];
    lead?: HTMLVisualElement | undefined;
    follow?: HTMLVisualElement | undefined;
    prevLead?: HTMLVisualElement | undefined;
    prevFollow?: HTMLVisualElement | undefined;
    snapshot?: Snapshot;
    hasChildren: boolean;
    add(child: HTMLVisualElement): void;
    remove(child: HTMLVisualElement): void;
    updateLeadAndFollow(): void;
    updateSnapshot(): void;
    isLeadPresent(): boolean | undefined;
    getFollowOrigin(): AxisBox2D | undefined;
    getFollowTarget(): AxisBox2D | undefined;
    getLeadOrigin(): AxisBox2D | undefined;
    getLeadTarget(): AxisBox2D | undefined;
    getLeadTransition(): Transition | undefined;
}

declare type LayoutUpdateHandler = (layout: AxisBox2D, prev: AxisBox2D, config?: SharedLayoutAnimationConfig) => void;

/**
 * @public
 */
export declare const m: import("./types").HTMLMotionComponents & import("./types").SVGMotionComponents & {
    custom: <Props>(Component: string | import("react").ComponentClass<Props, any> | import("react").FunctionComponent<Props>) => import(".").CustomDomComponent<Props>;
};

declare type MakeCustomValueType<T> = {
    [K in keyof T]: T[K] | CustomValueType;
};

declare type MakeKeyframes<T> = {
    [K in keyof T]: T[K] | T[K][] | [null, ...T[K][]];
};

declare type MakeMotion<T> = MakeCustomValueType<{
    [K in keyof T]: T[K] | MotionValue<number> | MotionValue<string> | MotionValue<any>;
}>;

/**
 * HTML & SVG components, optimised for use with gestures and animation. These can be used as
 * drop-in replacements for any HTML & SVG component, all CSS & SVG properties are supported.
 *
 * @public
 */
export declare const motion: HTMLMotionComponents & SVGMotionComponents & {
    custom: <Props>(Component: string | React.ComponentClass<Props, any> | React.FunctionComponent<Props>) => CustomDomComponent<Props>;
};

/**
 * @public
 */
export declare interface MotionAdvancedProps {
    /**
     * Custom data to use to resolve dynamic variants differently for each animating component.
     *
     * @library
     *
     * ```jsx
     * const variants = {
     *   visible: (custom) => ({
     *     opacity: 1,
     *     transition: { delay: custom * 0.2 }
     *   })
     * }
     *
     * <Frame custom={0} animate="visible" variants={variants} />
     * <Frame custom={1} animate="visible" variants={variants} />
     * <Frame custom={2} animate="visible" variants={variants} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * const variants = {
     *   visible: (custom) => ({
     *     opacity: 1,
     *     transition: { delay: custom * 0.2 }
     *   })
     * }
     *
     * <motion.div custom={0} animate="visible" variants={variants} />
     * <motion.div custom={1} animate="visible" variants={variants} />
     * <motion.div custom={2} animate="visible" variants={variants} />
     * ```
     *
     * @public
     */
    custom?: any;
    /**
     * @public
     * Set to `false` to prevent inheriting variant changes from its parent.
     */
    inherit?: boolean;
}

/**
 * @public
 */
export declare interface MotionCallbacks {
    /**
     * Callback with latest motion values, fired max once per frame.
     *
     * @library
     *
     * ```jsx
     * function onUpdate(latest) {
     *   console.log(latest.x, latest.opacity)
     * }
     *
     * <Frame animate={{ x: 100, opacity: 0 }} onUpdate={onUpdate} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onUpdate(latest) {
     *   console.log(latest.x, latest.opacity)
     * }
     *
     * <motion.div animate={{ x: 100, opacity: 0 }} onUpdate={onUpdate} />
     * ```
     */
    onUpdate?(latest: {
        [key: string]: string | number;
    }): void;
    /**
     * Callback when animation defined in `animate` begins.
     *
     * @library
     *
     * ```jsx
     * function onStart() {
     *   console.log("Animation started")
     * }
     *
     * <Frame animate={{ x: 100 }} onAnimationStart={onStart} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onStart() {
     *   console.log("Animation started")
     * }
     *
     * <motion.div animate={{ x: 100 }} onAnimationStart={onStart} />
     * ```
     */
    onAnimationStart?(): void;
    /**
     * Callback when animation defined in `animate` is complete.
     *
     * @library
     *
     * ```jsx
     * function onComplete() {
     *   console.log("Animation completed")
     * }
     *
     * <Frame animate={{ x: 100 }} onAnimationComplete={onComplete} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onComplete() {
     *   console.log("Animation completed")
     * }
     *
     * <motion.div animate={{ x: 100 }} onAnimationComplete={onComplete} />
     * ```
     */
    onAnimationComplete?(): void;
}

declare interface MotionComponentConfig<E> {
    defaultFeatures: MotionFeature[];
    useVisualElement: UseVisualElement<E>;
    useRender: RenderComponent;
}

/**
 * MotionConfig can be used in combination with the `m` component to cut bundle size
 * and dynamically load only the features you use.
 *
 * ```jsx
 * import {
 *   m as motion,
 *   AnimationFeature,
 *   MotionConfig
 * } from "framer-motion"
 *
 * export function App() {
 *   return (
 *     <MotionConfig features={[AnimationFeature]}>
 *       <motion.div animate={{ x: 100 }} />
 *     </MotionConfig>
 *   )
 * }
 * ```
 *
 * @public
 */
export declare function MotionConfig({ children, features, ...props }: MotionConfigProps): JSX.Element;

/**
 * @public
 */
export declare interface MotionConfigContext {
    /**
     * @internal
     */
    transformPagePoint: TransformPoint2D;
    /**
     * An array of features to provide to children.
     *
     * @public
     */
    features: MotionFeature[];
    /**
     * Determines whether this is a static context ie the Framer canvas. If so,
     * it'll disable all dynamic functionality.
     *
     * @internal
     */
    isStatic: boolean;
}

/**
 * @public
 */
export declare const MotionConfigContext: React.Context<MotionConfigContext>;

declare interface MotionConfigProps extends Partial<MotionConfigContext> {
    children?: React.ReactNode;
}

declare type MotionCSS = MakeMotion<Omit<CSSProperties, "rotate" | "scale" | "perspective">>;

/**
 * @public
 */
export declare interface MotionFeature {
    key: string;
    shouldRender: (props: MotionProps) => boolean;
    getComponent: (props: MotionProps) => React.ComponentType<FeatureProps> | undefined;
}

declare interface MotionPoint {
    x: MotionValue<number>;
    y: MotionValue<number>;
}

/**
 * Props for `motion` components.
 *
 * @public
 */
export declare interface MotionProps extends AnimationProps, MotionCallbacks, GestureHandlers, DraggableProps, LayoutProps, MotionAdvancedProps {
    /**
     * Properties, variant label or array of variant labels to start in.
     *
     * Set to `false` to initialise with the values in `animate` (disabling the mount animation)
     *
     * @library
     *
     * ```jsx
     * // As values
     * <Frame initial={{ opacity: 1 }} />
     *
     * // As variant
     * <Frame initial="visible" variants={variants} />
     *
     * // Multiple variants
     * <Frame initial={["visible", "active"]} variants={variants} />
     *
     * // As false (disable mount animation)
     * <Frame initial={false} animate={{ opacity: 0 }} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * // As values
     * <motion.div initial={{ opacity: 1 }} />
     *
     * // As variant
     * <motion.div initial="visible" variants={variants} />
     *
     * // Multiple variants
     * <motion.div initial={["visible", "active"]} variants={variants} />
     *
     * // As false (disable mount animation)
     * <motion.div initial={false} animate={{ opacity: 0 }} />
     * ```
     */
    initial?: boolean | Target | VariantLabels;
    /**
     * @library
     *
     * The React DOM `style` prop, useful for setting CSS properties that aren't explicitly exposed by `Frame` props.
     *
     * ```jsx
     * <Frame style={{ mixBlendMode: "difference" }}  />
     * ```
     *
     * @motion
     *
     * The React DOM `style` prop, enhanced with support for `MotionValue`s and separate `transform` values.
     *
     * ```jsx
     * export const MyComponent = () => {
     *   const x = useMotionValue(0)
     *
     *   return <motion.div style={{ x, opacity: 1, scale: 0.5 }} />
     * }
     * ```
     */
    style?: MotionStyle;
    /**
     * By default, Framer Motion generates a `transform` property with a sensible transform order. `transformTemplate`
     * can be used to create a different order, or to append/preprend the automatically generated `transform` property.
     *
     * @library
     *
     * ```jsx
     * function transformTemplate({ x, rotate }) {
     *   return `rotate(${rotate}deg) translateX(${x}px)`
     * }
     *
     * <Frame x={0} rotate={180} transformTemplate={transformTemplate} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   style={{ x: 0, rotate: 180 }}
     *   transformTemplate={
     *     ({ x, rotate }) => `rotate(${rotate}deg) translateX(${x}px)`
     *   }
     * />
     * ```
     *
     * @param transform - The latest animated transform props.
     * @param generatedTransform - The transform string as automatically generated by Framer Motion
     *
     * @public
     */
    transformTemplate?(transform: TransformProperties, generatedTransform: string): string;
    /**
     * This allows values to be transformed before being animated or set as styles.
     *
     * For instance, this allows custom values in Framer Library like `size` to be converted into `width` and `height`.
     * It also allows us a chance to take a value like `Color` and convert it to an animatable color string.
     *
     * A few structural typing changes need making before this can be a public property:
     * - Allow `Target` values to be appended by user-defined types (delete `CustomStyles` - does `size` throw a type error?)
     * - Extract `CustomValueType` as a separate user-defined type (delete `CustomValueType` and animate a `Color` - does this throw a type error?).
     *
     * @param values -
     *
     * @internal
     */
    transformValues?<V extends ResolvedValues>(values: V): V;
}

/**
 * @public
 */
export declare type MotionStyle = MotionCSS & MotionTransform & MakeMotion<SVGPathProperties> & MakeCustomValueType<CustomStyles>;

/**
 * @public
 */
export declare type MotionTransform = MakeMotion<TransformProperties>;

/**
 * `MotionValue` is used to track the state and velocity of motion values.
 *
 * @public
 */
export declare class MotionValue<V = any> {
    /**
     * The current state of the `MotionValue`.
     *
     * @internal
     */
    private current;
    /**
     * The previous state of the `MotionValue`.
     *
     * @internal
     */
    private prev;
    /**
     * Duration, in milliseconds, since last updating frame.
     *
     * @internal
     */
    private timeDelta;
    /**
     * Timestamp of the last time this `MotionValue` was updated.
     *
     * @internal
     */
    private lastUpdated;
    /**
     * Functions to notify when the `MotionValue` updates.
     *
     * @internal
     */
    updateSubscribers: SubscriptionManager<Subscriber<V>>;
    /**
     * Functions to notify when the `MotionValue` updates and `render` is set to `true`.
     *
     * @internal
     */
    private renderSubscribers;
    /**
     * Add a passive effect to this `MotionValue`.
     *
     * A passive effect intercepts calls to `set`. For instance, `useSpring` adds
     * a passive effect that attaches a `spring` to the latest
     * set value. Hypothetically there could be a `useSmooth` that attaches an input smoothing effect.
     *
     * @internal
     */
    private passiveEffect?;
    /**
     * A reference to the currently-controlling Popmotion animation
     *
     * @internal
     */
    private stopAnimation?;
    /**
     * Tracks whether this value can output a velocity. Currently this is only true
     * if the value is numerical, but we might be able to widen the scope here and support
     * other value types.
     *
     * @internal
     */
    private canTrackVelocity;
    /**
     * @param init - The initiating value
     * @param config - Optional configuration options
     *
     * -  `transformer`: A function to transform incoming values with.
     *
     * @internal
     */
    constructor(init: V);
    /**
     * Adds a function that will be notified when the `MotionValue` is updated.
     *
     * It returns a function that, when called, will cancel the subscription.
     *
     * When calling `onChange` inside a React component, it should be wrapped with the
     * `useEffect` hook. As it returns an unsubscribe function, this should be returned
     * from the `useEffect` function to ensure you don't add duplicate subscribers..
     *
     * @library
     *
     * ```jsx
     * function MyComponent() {
     *   const x = useMotionValue(0)
     *   const y = useMotionValue(0)
     *   const opacity = useMotionValue(1)
     *
     *   useEffect(() => {
     *     function updateOpacity() {
     *       const maxXY = Math.max(x.get(), y.get())
     *       const newOpacity = transform(maxXY, [0, 100], [1, 0])
     *       opacity.set(newOpacity)
     *     }
     *
     *     const unsubscribeX = x.onChange(updateOpacity)
     *     const unsubscribeY = y.onChange(updateOpacity)
     *
     *     return () => {
     *       unsubscribeX()
     *       unsubscribeY()
     *     }
     *   }, [])
     *
     *   return <Frame x={x} />
     * }
     * ```
     *
     * @motion
     *
     * ```jsx
     * export const MyComponent = () => {
     *   const x = useMotionValue(0)
     *   const y = useMotionValue(0)
     *   const opacity = useMotionValue(1)
     *
     *   useEffect(() => {
     *     function updateOpacity() {
     *       const maxXY = Math.max(x.get(), y.get())
     *       const newOpacity = transform(maxXY, [0, 100], [1, 0])
     *       opacity.set(newOpacity)
     *     }
     *
     *     const unsubscribeX = x.onChange(updateOpacity)
     *     const unsubscribeY = y.onChange(updateOpacity)
     *
     *     return () => {
     *       unsubscribeX()
     *       unsubscribeY()
     *     }
     *   }, [])
     *
     *   return <motion.div style={{ x }} />
     * }
     * ```
     *
     * @internalremarks
     *
     * We could look into a `useOnChange` hook if the above lifecycle management proves confusing.
     *
     * ```jsx
     * useOnChange(x, () => {})
     * ```
     *
     * @param subscriber - A function that receives the latest value.
     * @returns A function that, when called, will cancel this subscription.
     *
     * @public
     */
    onChange(subscription: Subscriber<V>): () => void;
    clearListeners(): void;
    /**
     * Adds a function that will be notified when the `MotionValue` requests a render.
     *
     * @param subscriber - A function that's provided the latest value.
     * @returns A function that, when called, will cancel this subscription.
     *
     * @internal
     */
    onRenderRequest(subscription: Subscriber<V>): () => undefined;
    /**
     * Attaches a passive effect to the `MotionValue`.
     *
     * @internal
     */
    attach(passiveEffect: PassiveEffect<V>): void;
    /**
     * Sets the state of the `MotionValue`.
     *
     * @remarks
     *
     * ```jsx
     * const x = useMotionValue(0)
     * x.set(10)
     * ```
     *
     * @param latest - Latest value to set.
     * @param render - Whether to notify render subscribers. Defaults to `true`
     *
     * @public
     */
    set(v: V, render?: boolean): void;
    updateAndNotify: (v: V, render?: boolean) => void;
    /**
     * Returns the latest state of `MotionValue`
     *
     * @returns - The latest state of `MotionValue`
     *
     * @public
     */
    get(): V;
    /**
     * @public
     */
    getPrevious(): V;
    /**
     * Returns the latest velocity of `MotionValue`
     *
     * @returns - The latest velocity of `MotionValue`. Returns `0` if the state is non-numerical.
     *
     * @public
     */
    getVelocity(): number;
    /**
     * Schedule a velocity check for the next frame.
     *
     * This is an instanced and bound function to prevent generating a new
     * function once per frame.
     *
     * @internal
     */
    private scheduleVelocityCheck;
    /**
     * Updates `prev` with `current` if the value hasn't been updated this frame.
     * This ensures velocity calculations return `0`.
     *
     * This is an instanced and bound function to prevent generating a new
     * function once per frame.
     *
     * @internal
     */
    private velocityCheck;
    /**
     * Registers a new animation to control this `MotionValue`. Only one
     * animation can drive a `MotionValue` at one time.
     *
     * ```jsx
     * value.start()
     * ```
     *
     * @param animation - A function that starts the provided animation
     *
     * @internal
     */
    start(animation: StartAnimation): Promise<void>;
    /**
     * Stop the currently active animation.
     *
     * @public
     */
    stop(): void;
    /**
     * Returns `true` if this value is currently animating.
     *
     * @public
     */
    isAnimating(): boolean;
    private clearAnimation;
    /**
     * Destroy and clean up subscribers to this `MotionValue`.
     *
     * The `MotionValue` hooks like `useMotionValue` and `useTransform` automatically
     * handle the lifecycle of the returned `MotionValue`, so this method is only necessary if you've manually
     * created a `MotionValue` via the `motionValue` function.
     *
     * @public
     */
    destroy(): void;
}

/**
 * @internal
 */
export declare function motionValue<V>(init: V): MotionValue<V>;

declare type MultiTransformer<I, O> = (input: I[]) => O;

declare type NativeAnimationEvent = AnimationEvent;

declare type NativeClipboardEvent = ClipboardEvent;

declare type NativeCompositionEvent = CompositionEvent;

declare type NativeDragEvent = DragEvent;

declare type NativeFocusEvent = FocusEvent;

declare type NativeKeyboardEvent = KeyboardEvent;

declare type NativeMouseEvent = MouseEvent;

declare type NativePointerEvent = PointerEvent;

declare type NativeTouchEvent = TouchEvent;

declare type NativeTransitionEvent = TransitionEvent;

declare type NativeUIEvent = UIEvent;

declare type NativeWheelEvent = WheelEvent;

/**
 * @public
 */
export declare interface None {
    /**
     * Set `type` to `false` for an instant transition.
     *
     * @public
     */
    type: false;
    /**
     * @internal
     */
    from?: number | string;
    /**
     * @internal
     */
    delay?: number;
    /**
     * @internal
     */
    velocity?: number;
}

declare type NotPresent = [false, SafeToRemove];

declare type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

declare type OnViewportBoxUpdate = (box: AxisBox2D, delta: BoxDelta) => void;

/**
 * Options for orchestrating the timing of animations.
 *
 * @public
 */
export declare interface Orchestration {
    /**
     * Delay the animation by this duration (in seconds). Defaults to `0`.
     *
     * @remarks
     * ```javascript
     * const transition = {
     *   delay: 0.2
     * }
     * ```
     *
     * @public
     */
    delay?: number;
    /**
     * Describes the relationship between the transition and its children. Set
     * to `false` by default.
     *
     * @remarks
     * When using variants, the transition can be scheduled in relation to its
     * children with either `"beforeChildren"` to finish this transition before
     * starting children transitions, `"afterChildren"` to finish children
     * transitions before starting this transition.
     *
     * @library
     *
     * ```jsx
     * const container = {
     *   hidden: {
     *     opacity: 0,
     *     transition: { when: "afterChildren" }
     *   }
     * }
     *
     * const item = {
     *   hidden: {
     *     opacity: 0,
     *     transition: { duration: 2 }
     *   }
     * }
     *
     * return (
     *   <Frame variants={container} animate="hidden">
     *     <Frame variants={item} size={50} />
     *     <Frame variants={item} size={50} />
     *   </Frame>
     * )
     * ```
     *
     * @motion
     *
     * ```jsx
     * const list = {
     *   hidden: {
     *     opacity: 0,
     *     transition: { when: "afterChildren" }
     *   }
     * }
     *
     * const item = {
     *   hidden: {
     *     opacity: 0,
     *     transition: { duration: 2 }
     *   }
     * }
     *
     * return (
     *   <motion.ul variants={list} animate="hidden">
     *     <motion.li variants={item} />
     *     <motion.li variants={item} />
     *   </motion.ul>
     * )
     * ```
     *
     * @public
     */
    when?: false | "beforeChildren" | "afterChildren" | string;
    /**
     * When using variants, children animations will start after this duration
     * (in seconds). You can add the `transition` property to both the `Frame` and the `variant` directly. Adding it to the `variant` generally offers more flexibility, as it allows you to customize the delay per visual state.
     *
     * @library
     *
     * ```jsx
     * const container = {
     *   hidden: { opacity: 0 },
     *   show: {
     *     opacity: 1,
     *     transition: {
     *       delayChildren: 0.5
     *     }
     *   }
     * }
     *
     * const item = {
     *   hidden: { opacity: 0 },
     *   show: { opacity: 1 }
     * }
     *
     * return (
     *   <Frame
     *     variants={container}
     *     initial="hidden"
     *     animate="show"
     *   >
     *     <Frame variants={item} size={50} />
     *     <Frame variants={item} size={50} />
     *   </Frame>
     * )
     * ```
     *
     * @motion
     *
     * ```jsx
     * const container = {
     *   hidden: { opacity: 0 },
     *   show: {
     *     opacity: 1,
     *     transition: {
     *       delayChildren: 0.5
     *     }
     *   }
     * }
     *
     * const item = {
     *   hidden: { opacity: 0 },
     *   show: { opacity: 1 }
     * }
     *
     * return (
     *   <motion.ul
     *     variants={container}
     *     initial="hidden"
     *     animate="show"
     *   >
     *     <motion.li variants={item} />
     *     <motion.li variants={item} />
     *   </motion.ul>
     * )
     * ```
     *
     * @public
     */
    delayChildren?: number;
    /**
     * When using variants, animations of child components can be staggered by this
     * duration (in seconds).
     *
     * For instance, if `staggerChildren` is `0.01`, the first child will be
     * delayed by `0` seconds, the second by `0.01`, the third by `0.02` and so
     * on.
     *
     * The calculated stagger delay will be added to `delayChildren`.
     *
     * @library
     *
     * ```jsx
     * const container = {
     *   hidden: { opacity: 0 },
     *   show: {
     *     opacity: 1,
     *     transition: {
     *       staggerChildren: 0.5
     *     }
     *   }
     * }
     *
     * const item = {
     *   hidden: { opacity: 0 },
     *   show: { opacity: 1 }
     * }
     *
     * return (
     *   <Frame
     *     variants={container}
     *     initial="hidden"
     *     animate="show"
     *   >
     *     <Frame variants={item} size={50} />
     *     <Frame variants={item} size={50} />
     *   </Frame>
     * )
     * ```
     *
     * @motion
     *
     * ```jsx
     * const container = {
     *   hidden: { opacity: 0 },
     *   show: {
     *     opacity: 1,
     *     transition: {
     *       staggerChildren: 0.5
     *     }
     *   }
     * }
     *
     * const item = {
     *   hidden: { opacity: 0 },
     *   show: { opacity: 1 }
     * }
     *
     * return (
     *   <motion.ol
     *     variants={container}
     *     initial="hidden"
     *     animate="show"
     *   >
     *     <motion.li variants={item} />
     *     <motion.li variants={item} />
     *   </motion.ol>
     * )
     * ```
     *
     * @public
     */
    staggerChildren?: number;
    /**
     * The direction in which to stagger children.
     *
     * A value of `1` staggers from the first to the last while `-1`
     * staggers from the last to the first.
     *
     * @library
     *
     * ```jsx
     * const container = {
     *   hidden: { opacity: 0 },
     *   show: {
     *     opacity: 1,
     *     transition: {
     *       delayChildren: 0.5,
     *       staggerDirection: -1
     *     }
     *   }
     * }
     *
     * const item = {
     *   hidden: { opacity: 0 },
     *   show: { opacity: 1 }
     * }
     *
     * return (
     *   <Frame
     *     variants={container}
     *     initial="hidden"
     *     animate="show"
     *   >
     *     <Frame variants={item} size={50} />
     *     <Frame variants={item} size={50} />
     *   </Frame>
     * )
     * ```
     *
     * @motion
     *
     * ```jsx
     * const container = {
     *   hidden: { opacity: 0 },
     *   show: {
     *     opacity: 1,
     *     transition: {
     *       delayChildren: 0.5,
     *       staggerDirection: -1
     *     }
     *   }
     * }
     *
     * const item = {
     *   hidden: { opacity: 0 },
     *   show: { opacity: 1 }
     * }
     *
     * return (
     *   <motion.ul
     *     variants={container}
     *     initial="hidden"
     *     animate="show"
     *   >
     *     <motion.li variants={item} size={50} />
     *     <motion.li variants={item} size={50} />
     *   </motion.ul>
     * )
     * ```
     *
     * @public
     */
    staggerDirection?: number;
}

/**
 * @public
 */
export declare interface PanHandlers {
    /**
     * Callback function that fires when the pan gesture is recognised on this element.
     *
     * @library
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame onPan={onPan} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onPan={onPan} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - A {@link PanInfo} object containing `x` and `y` values for:
     *
     *   - `point`: Relative to the device or page.
     *   - `delta`: Distance moved since the last event.
     *   - `offset`: Offset from the original pan event.
     *   - `velocity`: Current velocity of the pointer.
     */
    onPan?(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void;
    /**
     * Callback function that fires when the pan gesture begins on this element.
     *
     * @library
     *
     * ```jsx
     * function onPanStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame onPanStart={onPanStart} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onPanStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onPanStart={onPanStart} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - A {@link PanInfo} object containing `x`/`y` values for:
     *
     *   - `point`: Relative to the device or page.
     *   - `delta`: Distance moved since the last event.
     *   - `offset`: Offset from the original pan event.
     *   - `velocity`: Current velocity of the pointer.
     */
    onPanStart?(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void;
    /**
     * Callback function that fires when we begin detecting a pan gesture. This
     * is analogous to `onMouseStart` or `onTouchStart`.
     *
     * @library
     *
     * ```jsx
     * function onPanSessionStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame onPanSessionStart={onPanSessionStart} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onPanSessionStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onPanSessionStart={onPanSessionStart} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - An {@link EventInfo} object containing `x`/`y` values for:
     *
     *   - `point`: Relative to the device or page.
     */
    onPanSessionStart?(event: MouseEvent | TouchEvent | PointerEvent, info: EventInfo): void;
    /**
     * Callback function that fires when the pan gesture ends on this element.
     *
     * @library
     *
     * ```jsx
     * function onPanEnd(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame onPanEnd={onPanEnd} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onPanEnd(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onPanEnd={onPanEnd} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - A {@link PanInfo} object containing `x`/`y` values for:
     *
     *   - `point`: Relative to the device or page.
     *   - `delta`: Distance moved since the last event.
     *   - `offset`: Offset from the original pan event.
     *   - `velocity`: Current velocity of the pointer.
     */
    onPanEnd?(event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo): void;
}

/**
 * Passed in to pan event handlers like `onPan` the `PanInfo` object contains
 * information about the current state of the tap gesture such as its
 * `point`, `delta`, `offset` and `velocity`.
 *
 * @library
 *
 * ```jsx
 * function onPan(event, info) {
 *   console.log(info.point.x, info.point.y)
 * }
 *
 * <Frame onPan={onPan} />
 * ```
 *
 * @motion
 *
 * ```jsx
 * <motion.div onPan={(event, info) => {
 *   console.log(info.point.x, info.point.y)
 * }} />
 * ```
 *
 * @public
 */
export declare interface PanInfo {
    /**
     * Contains `x` and `y` values for the current pan position relative
     * to the device or page.
     *
     * @library
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame onPan={onPan} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onPan={onPan} />
     * ```
     *
     * @public
     */
    point: Point2D;
    /**
     * Contains `x` and `y` values for the distance moved since
     * the last event.
     *
     * @library
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.delta.x, info.delta.y)
     * }
     *
     * <Frame onPan={onPan} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.delta.x, info.delta.y)
     * }
     *
     * <motion.div onPan={onPan} />
     * ```
     *
     * @public
     */
    delta: Point2D;
    /**
     * Contains `x` and `y` values for the distance moved from
     * the first pan event.
     *
     * @library
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.offset.x, info.offset.y)
     * }
     *
     * <Frame onPan={onPan} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.offset.x, info.offset.y)
     * }
     *
     * <motion.div onPan={onPan} />
     * ```
     *
     * @public
     */
    offset: Point2D;
    /**
     * Contains `x` and `y` values for the current velocity of the pointer.
     *
     * @library
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.velocity.x, info.velocity.y)
     * }
     *
     * <Frame onPan={onPan} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onPan(event, info) {
     *   console.log(info.velocity.x, info.velocity.y)
     * }
     *
     * <motion.div onPan={onPan} />
     * ```
     *
     * @public
     */
    velocity: Point2D;
}

/**
 * @public
 */
export declare type PassiveEffect<T> = (v: T, safeSetter: (v: T) => void) => void;

declare type PermissiveTransitionDefinition = {
    [key: string]: any;
};

declare interface PlaybackControls {
    stop: () => void;
}

declare interface PlaybackLifecycles<V> {
    onUpdate?: (latest: V) => void;
    onPlay?: () => void;
    onComplete?: () => void;
    onRepeat?: () => void;
    onStop?: () => void;
}

/**
 * A description of a two-dimensional point
 *
 * @public
 */
export declare interface Point2D {
    x: number;
    y: number;
}

/**
 * A description of a three-dimensional point
 *
 * @public
 */
export declare interface Point3D extends Point2D {
    z: number;
}

declare enum Presence {
    Entering = 0,
    Present = 1,
    Exiting = 2
}

/**
 * @public
 */
export declare const PresenceContext: import("react").Context<PresenceContextProps | null>;

/**
 * @public
 */
declare interface PresenceContextProps {
    id: number;
    isPresent: boolean;
    register: (id: number) => () => void;
    onExitComplete?: (id: number) => void;
    initial?: false | VariantLabels;
    custom?: any;
}

declare type Present = [true];

declare namespace React_2 {
    //
    // React Elements
    // ----------------------------------------------------------------------

    type ElementType<P = any> =
        {
            [K in keyof JSX.IntrinsicElements]: P extends JSX.IntrinsicElements[K] ? K : never
        }[keyof JSX.IntrinsicElements] |
        ComponentType<P>;
    /**
     * @deprecated Please use `ElementType`
     */
    type ReactType<P = any> = ElementType<P>;
    type ComponentType<P = {}> = ComponentClass<P> | FunctionComponent<P>;

    type JSXElementConstructor<P> =
        | ((props: P) => ReactElement | null)
        | (new (props: P) => Component<P, any>);

    interface RefObject<T> {
        readonly current: T | null;
    }
    type RefCallback<T> = { bivarianceHack(instance: T | null): void }["bivarianceHack"];
    type Ref<T> = RefCallback<T> | RefObject<T> | null;
    type LegacyRef<T> = string | Ref<T>;
    /**
     * Gets the instance type for a React element. The instance will be different for various component types:
     *
     * - React class components will be the class instance. So if you had `class Foo extends React.Component<{}> {}`
     *   and used `React.ElementRef<typeof Foo>` then the type would be the instance of `Foo`.
     * - React stateless functional components do not have a backing instance and so `React.ElementRef<typeof Bar>`
     *   (when `Bar` is `function Bar() {}`) will give you the `undefined` type.
     * - JSX intrinsics like `div` will give you their DOM instance. For `React.ElementRef<'div'>` that would be
     *   `HTMLDivElement`. For `React.ElementRef<'input'>` that would be `HTMLInputElement`.
     * - React stateless functional components that forward a `ref` will give you the `ElementRef` of the forwarded
     *   to component.
     *
     * `C` must be the type _of_ a React component so you need to use typeof as in React.ElementRef<typeof MyComponent>.
     *
     * @todo In Flow, this works a little different with forwarded refs and the `AbstractComponent` that
     *       `React.forwardRef()` returns.
     */
    type ElementRef<
        C extends
            | ForwardRefExoticComponent<any>
            | { new (props: any): Component<any> }
            | ((props: any, context?: any) => ReactElement | null)
            | keyof JSX.IntrinsicElements
    > =
        // need to check first if `ref` is a valid prop for ts@3.0
        // otherwise it will infer `{}` instead of `never`
        "ref" extends keyof ComponentPropsWithRef<C>
            ? NonNullable<ComponentPropsWithRef<C>["ref"]> extends Ref<
                infer Instance
            >
                ? Instance
                : never
            : never;

    type ComponentState = any;

    type Key = string | number;

    /**
     * @internal You shouldn't need to use this type since you never see these attributes
     * inside your component or have to validate them.
     */
    interface Attributes {
        key?: Key | null;
    }
    interface RefAttributes<T> extends Attributes {
        ref?: Ref<T>;
    }
    interface ClassAttributes<T> extends Attributes {
        ref?: LegacyRef<T>;
    }

    interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
        type: T;
        props: P;
        key: Key | null;
    }

    interface ReactComponentElement<
        T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>,
        P = Pick<ComponentProps<T>, Exclude<keyof ComponentProps<T>, 'key' | 'ref'>>
    > extends ReactElement<P, Exclude<T, number>> { }

    /**
     * @deprecated Please use `FunctionComponentElement`
     */
    type SFCElement<P> = FunctionComponentElement<P>;

    interface FunctionComponentElement<P> extends ReactElement<P, FunctionComponent<P>> {
        ref?: 'ref' extends keyof P ? P extends { ref?: infer R } ? R : never : never;
    }

    type CElement<P, T extends Component<P, ComponentState>> = ComponentElement<P, T>;
    interface ComponentElement<P, T extends Component<P, ComponentState>> extends ReactElement<P, ComponentClass<P>> {
        ref?: LegacyRef<T>;
    }

    type ClassicElement<P> = CElement<P, ClassicComponent<P, ComponentState>>;

    // string fallback for custom web-components
    interface DOMElement<P extends HTMLAttributes<T> | SVGAttributes<T>, T extends Element> extends ReactElement<P, string> {
        ref: LegacyRef<T>;
    }

    // ReactHTML for ReactHTMLElement
    // tslint:disable-next-line:no-empty-interface
    interface ReactHTMLElement<T extends HTMLElement> extends DetailedReactHTMLElement<AllHTMLAttributes<T>, T> { }

    interface DetailedReactHTMLElement<P extends HTMLAttributes<T>, T extends HTMLElement> extends DOMElement<P, T> {
        type: keyof ReactHTML;
    }

    // ReactSVG for ReactSVGElement
    interface ReactSVGElement extends DOMElement<SVGAttributes<SVGElement>, SVGElement> {
        type: keyof ReactSVG;
    }

    interface ReactPortal extends ReactElement {
        key: Key | null;
        children: ReactNode;
    }

    //
    // Factories
    // ----------------------------------------------------------------------

    type Factory<P> = (props?: Attributes & P, ...children: ReactNode[]) => ReactElement<P>;

    /**
     * @deprecated Please use `FunctionComponentFactory`
     */
    type SFCFactory<P> = FunctionComponentFactory<P>;

    type FunctionComponentFactory<P> = (props?: Attributes & P, ...children: ReactNode[]) => FunctionComponentElement<P>;

    type ComponentFactory<P, T extends Component<P, ComponentState>> =
        (props?: ClassAttributes<T> & P, ...children: ReactNode[]) => CElement<P, T>;

    type CFactory<P, T extends Component<P, ComponentState>> = ComponentFactory<P, T>;
    type ClassicFactory<P> = CFactory<P, ClassicComponent<P, ComponentState>>;

    type DOMFactory<P extends DOMAttributes<T>, T extends Element> =
        (props?: ClassAttributes<T> & P | null, ...children: ReactNode[]) => DOMElement<P, T>;

    // tslint:disable-next-line:no-empty-interface
    interface HTMLFactory<T extends HTMLElement> extends DetailedHTMLFactory<AllHTMLAttributes<T>, T> {}

    interface DetailedHTMLFactory<P extends HTMLAttributes<T>, T extends HTMLElement> extends DOMFactory<P, T> {
        (props?: ClassAttributes<T> & P | null, ...children: ReactNode[]): DetailedReactHTMLElement<P, T>;
    }

    interface SVGFactory extends DOMFactory<SVGAttributes<SVGElement>, SVGElement> {
        (props?: ClassAttributes<SVGElement> & SVGAttributes<SVGElement> | null, ...children: ReactNode[]): ReactSVGElement;
    }

    //
    // React Nodes
    // http://facebook.github.io/react/docs/glossary.html
    // ----------------------------------------------------------------------

    type ReactText = string | number;
    type ReactChild = ReactElement | ReactText;

    interface ReactNodeArray extends Array<ReactNode> {}
    type ReactFragment = {} | ReactNodeArray;
    type ReactNode = ReactChild | ReactFragment | ReactPortal | boolean | null | undefined;

    //
    // Top Level API
    // ----------------------------------------------------------------------

    // DOM Elements
    function createFactory<T extends HTMLElement>(
        type: keyof ReactHTML): HTMLFactory<T>;
    function createFactory(
        type: keyof ReactSVG): SVGFactory;
    function createFactory<P extends DOMAttributes<T>, T extends Element>(
        type: string): DOMFactory<P, T>;

    // Custom components
    function createFactory<P>(type: FunctionComponent<P>): FunctionComponentFactory<P>;
    function createFactory<P>(
        type: ClassType<P, ClassicComponent<P, ComponentState>, ClassicComponentClass<P>>): CFactory<P, ClassicComponent<P, ComponentState>>;
    function createFactory<P, T extends Component<P, ComponentState>, C extends ComponentClass<P>>(
        type: ClassType<P, T, C>): CFactory<P, T>;
    function createFactory<P>(type: ComponentClass<P>): Factory<P>;

    // DOM Elements
    // TODO: generalize this to everything in `keyof ReactHTML`, not just "input"
    function createElement(
        type: "input",
        props?: InputHTMLAttributes<HTMLInputElement> & ClassAttributes<HTMLInputElement> | null,
        ...children: ReactNode[]): DetailedReactHTMLElement<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
    function createElement<P extends HTMLAttributes<T>, T extends HTMLElement>(
        type: keyof ReactHTML,
        props?: ClassAttributes<T> & P | null,
        ...children: ReactNode[]): DetailedReactHTMLElement<P, T>;
    function createElement<P extends SVGAttributes<T>, T extends SVGElement>(
        type: keyof ReactSVG,
        props?: ClassAttributes<T> & P | null,
        ...children: ReactNode[]): ReactSVGElement;
    function createElement<P extends DOMAttributes<T>, T extends Element>(
        type: string,
        props?: ClassAttributes<T> & P | null,
        ...children: ReactNode[]): DOMElement<P, T>;

    // Custom components

    function createElement<P extends {}>(
        type: FunctionComponent<P>,
        props?: Attributes & P | null,
        ...children: ReactNode[]): FunctionComponentElement<P>;
    function createElement<P extends {}>(
        type: ClassType<P, ClassicComponent<P, ComponentState>, ClassicComponentClass<P>>,
        props?: ClassAttributes<ClassicComponent<P, ComponentState>> & P | null,
        ...children: ReactNode[]): CElement<P, ClassicComponent<P, ComponentState>>;
    function createElement<P extends {}, T extends Component<P, ComponentState>, C extends ComponentClass<P>>(
        type: ClassType<P, T, C>,
        props?: ClassAttributes<T> & P | null,
        ...children: ReactNode[]): CElement<P, T>;
    function createElement<P extends {}>(
        type: FunctionComponent<P> | ComponentClass<P> | string,
        props?: Attributes & P | null,
        ...children: ReactNode[]): ReactElement<P>;

    // DOM Elements
    // ReactHTMLElement
    function cloneElement<P extends HTMLAttributes<T>, T extends HTMLElement>(
        element: DetailedReactHTMLElement<P, T>,
        props?: P,
        ...children: ReactNode[]): DetailedReactHTMLElement<P, T>;
    // ReactHTMLElement, less specific
    function cloneElement<P extends HTMLAttributes<T>, T extends HTMLElement>(
        element: ReactHTMLElement<T>,
        props?: P,
        ...children: ReactNode[]): ReactHTMLElement<T>;
    // SVGElement
    function cloneElement<P extends SVGAttributes<T>, T extends SVGElement>(
        element: ReactSVGElement,
        props?: P,
        ...children: ReactNode[]): ReactSVGElement;
    // DOM Element (has to be the last, because type checking stops at first overload that fits)
    function cloneElement<P extends DOMAttributes<T>, T extends Element>(
        element: DOMElement<P, T>,
        props?: DOMAttributes<T> & P,
        ...children: ReactNode[]): DOMElement<P, T>;

    // Custom components
    function cloneElement<P>(
        element: FunctionComponentElement<P>,
        props?: Partial<P> & Attributes,
        ...children: ReactNode[]): FunctionComponentElement<P>;
    function cloneElement<P, T extends Component<P, ComponentState>>(
        element: CElement<P, T>,
        props?: Partial<P> & ClassAttributes<T>,
        ...children: ReactNode[]): CElement<P, T>;
    function cloneElement<P>(
        element: ReactElement<P>,
        props?: Partial<P> & Attributes,
        ...children: ReactNode[]): ReactElement<P>;

    // Context via RenderProps
    interface ProviderProps<T> {
        value: T;
        children?: ReactNode;
    }

    interface ConsumerProps<T> {
        children: (value: T) => ReactNode;
    }

    // TODO: similar to how Fragment is actually a symbol, the values returned from createContext,
    // forwardRef and memo are actually objects that are treated specially by the renderer; see:
    // https://github.com/facebook/react/blob/v16.6.0/packages/react/src/ReactContext.js#L35-L48
    // https://github.com/facebook/react/blob/v16.6.0/packages/react/src/forwardRef.js#L42-L45
    // https://github.com/facebook/react/blob/v16.6.0/packages/react/src/memo.js#L27-L31
    // However, we have no way of telling the JSX parser that it's a JSX element type or its props other than
    // by pretending to be a normal component.
    //
    // We don't just use ComponentType or SFC types because you are not supposed to attach statics to this
    // object, but rather to the original function.
    interface ExoticComponent<P = {}> {
        /**
         * **NOTE**: Exotic components are not callable.
         */
        (props: P): (ReactElement|null);
        readonly $$typeof: symbol;
    }

    interface NamedExoticComponent<P = {}> extends ExoticComponent<P> {
        displayName?: string;
    }

    interface ProviderExoticComponent<P> extends ExoticComponent<P> {
        propTypes?: WeakValidationMap<P>;
    }

    type ContextType<C extends Context<any>> = C extends Context<infer T> ? T : never;

    // NOTE: only the Context object itself can get a displayName
    // https://github.com/facebook/react-devtools/blob/e0b854e4c/backend/attachRendererFiber.js#L310-L325
    type Provider<T> = ProviderExoticComponent<ProviderProps<T>>;
    type Consumer<T> = ExoticComponent<ConsumerProps<T>>;
    interface Context<T> {
        Provider: Provider<T>;
        Consumer: Consumer<T>;
        displayName?: string;
    }
    function createContext<T>(
        // If you thought this should be optional, see
        // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/24509#issuecomment-382213106
        defaultValue: T,
    ): Context<T>;

    function isValidElement<P>(object: {} | null | undefined): object is ReactElement<P>;

    const Children: ReactChildren;
    const Fragment: ExoticComponent<{ children?: ReactNode }>;
    const StrictMode: ExoticComponent<{ children?: ReactNode }>;

    interface SuspenseProps {
        children?: ReactNode;

        /** A fallback react tree to show when a Suspense child (like React.lazy) suspends */
        fallback: NonNullable<ReactNode>|null;
    }
    /**
     * This feature is not yet available for server-side rendering.
     * Suspense support will be added in a later release.
     */
    const Suspense: ExoticComponent<SuspenseProps>;
    const version: string;

    /**
     * {@link https://github.com/bvaughn/rfcs/blob/profiler/text/0000-profiler.md#detailed-design | API}
     */
    type ProfilerOnRenderCallback = (
        id: string,
        phase: "mount" | "update",
        actualDuration: number,
        baseDuration: number,
        startTime: number,
        commitTime: number,
        interactions: Set<SchedulerInteraction>,
    ) => void;
    interface ProfilerProps {
        children?: ReactNode;
        id: string;
        onRender: ProfilerOnRenderCallback;
    }

    const Profiler: ExoticComponent<ProfilerProps>;

    //
    // Component API
    // ----------------------------------------------------------------------

    type ReactInstance = Component<any> | Element;

    // Base component for plain JS classes
    // tslint:disable-next-line:no-empty-interface
    interface Component<P = {}, S = {}, SS = any> extends ComponentLifecycle<P, S, SS> { }
    class Component<P, S> {
        // tslint won't let me format the sample code in a way that vscode likes it :(
        /**
         * If set, `this.context` will be set at runtime to the current value of the given Context.
         *
         * Usage:
         *
         * ```ts
         * type MyContext = number
         * const Ctx = React.createContext<MyContext>(0)
         *
         * class Foo extends React.Component {
         *   static contextType = Ctx
         *   context!: React.ContextType<typeof Ctx>
         *   render () {
         *     return <>My context's value: {this.context}</>;
         *   }
         * }
         * ```
         *
         * @see https://reactjs.org/docs/context.html#classcontexttype
         */
        static contextType?: Context<any>;

        /**
         * If using the new style context, re-declare this in your class to be the
         * `React.ContextType` of your `static contextType`.
         * Should be used with type annotation or static contextType.
         *
         * ```ts
         * static contextType = MyContext
         * // For TS pre-3.7:
         * context!: React.ContextType<typeof MyContext>
         * // For TS 3.7 and above:
         * declare context: React.ContextType<typeof MyContext>
         * ```
         *
         * @see https://reactjs.org/docs/context.html
         */
        // TODO (TypeScript 3.0): unknown
        context: any;

        constructor(props: Readonly<P>);
        /**
         * @deprecated
         * @see https://reactjs.org/docs/legacy-context.html
         */
        constructor(props: P, context?: any);

        // We MUST keep setState() as a unified signature because it allows proper checking of the method return type.
        // See: https://github.com/DefinitelyTyped/DefinitelyTyped/issues/18365#issuecomment-351013257
        // Also, the ` | S` allows intellisense to not be dumbisense
        setState<K extends keyof S>(
            state: ((prevState: Readonly<S>, props: Readonly<P>) => (Pick<S, K> | S | null)) | (Pick<S, K> | S | null),
            callback?: () => void
        ): void;

        forceUpdate(callback?: () => void): void;
        render(): ReactNode;

        // React.Props<T> is now deprecated, which means that the `children`
        // property is not available on `P` by default, even though you can
        // always pass children as variadic arguments to `createElement`.
        // In the future, if we can define its call signature conditionally
        // on the existence of `children` in `P`, then we should remove this.
        readonly props: Readonly<P> & Readonly<{ children?: ReactNode }>;
        state: Readonly<S>;
        /**
         * @deprecated
         * https://reactjs.org/docs/refs-and-the-dom.html#legacy-api-string-refs
         */
        refs: {
            [key: string]: ReactInstance
        };
    }

    class PureComponent<P = {}, S = {}, SS = any> extends Component<P, S, SS> { }

    interface ClassicComponent<P = {}, S = {}> extends Component<P, S> {
        replaceState(nextState: S, callback?: () => void): void;
        isMounted(): boolean;
        getInitialState?(): S;
    }

    interface ChildContextProvider<CC> {
        getChildContext(): CC;
    }

    //
    // Class Interfaces
    // ----------------------------------------------------------------------

    /**
     * @deprecated as of recent React versions, function components can no
     * longer be considered 'stateless'. Please use `FunctionComponent` instead.
     *
     * @see [React Hooks](https://reactjs.org/docs/hooks-intro.html)
     */
    type SFC<P = {}> = FunctionComponent<P>;

    /**
     * @deprecated as of recent React versions, function components can no
     * longer be considered 'stateless'. Please use `FunctionComponent` instead.
     *
     * @see [React Hooks](https://reactjs.org/docs/hooks-intro.html)
     */
    type StatelessComponent<P = {}> = FunctionComponent<P>;

    type FC<P = {}> = FunctionComponent<P>;

    interface FunctionComponent<P = {}> {
        (props: PropsWithChildren<P>, context?: any): ReactElement<any, any> | null;
        propTypes?: WeakValidationMap<P>;
        contextTypes?: ValidationMap<any>;
        defaultProps?: Partial<P>;
        displayName?: string;
    }

    type VFC<P = {}> = VoidFunctionComponent<P>;

    interface VoidFunctionComponent<P = {}> {
        (props: P, context?: any): ReactElement<any, any> | null;
        propTypes?: WeakValidationMap<P>;
        contextTypes?: ValidationMap<any>;
        defaultProps?: Partial<P>;
        displayName?: string;
    }

    interface ForwardRefRenderFunction<T, P = {}> {
        (props: PropsWithChildren<P>, ref: ((instance: T | null) => void) | MutableRefObject<T | null> | null): ReactElement | null;
        displayName?: string;
        // explicit rejected with `never` required due to
        // https://github.com/microsoft/TypeScript/issues/36826
        /**
         * defaultProps are not supported on render functions
         */
        defaultProps?: never;
        /**
         * propTypes are not supported on render functions
         */
        propTypes?: never;
    }

    /**
     * @deprecated Use ForwardRefRenderFunction. forwardRef doesn't accept a
     *             "real" component.
     */
    interface RefForwardingComponent <T, P = {}> extends ForwardRefRenderFunction<T, P> {}

    interface ComponentClass<P = {}, S = ComponentState> extends StaticLifecycle<P, S> {
        new (props: P, context?: any): Component<P, S>;
        propTypes?: WeakValidationMap<P>;
        contextType?: Context<any>;
        contextTypes?: ValidationMap<any>;
        childContextTypes?: ValidationMap<any>;
        defaultProps?: Partial<P>;
        displayName?: string;
    }

    interface ClassicComponentClass<P = {}> extends ComponentClass<P> {
        new (props: P, context?: any): ClassicComponent<P, ComponentState>;
        getDefaultProps?(): P;
    }

    /**
     * We use an intersection type to infer multiple type parameters from
     * a single argument, which is useful for many top-level API defs.
     * See https://github.com/Microsoft/TypeScript/issues/7234 for more info.
     */
    type ClassType<P, T extends Component<P, ComponentState>, C extends ComponentClass<P>> =
        C &
        (new (props: P, context?: any) => T);

    //
    // Component Specs and Lifecycle
    // ----------------------------------------------------------------------

    // This should actually be something like `Lifecycle<P, S> | DeprecatedLifecycle<P, S>`,
    // as React will _not_ call the deprecated lifecycle methods if any of the new lifecycle
    // methods are present.
    interface ComponentLifecycle<P, S, SS = any> extends NewLifecycle<P, S, SS>, DeprecatedLifecycle<P, S> {
        /**
         * Called immediately after a component is mounted. Setting state here will trigger re-rendering.
         */
        componentDidMount?(): void;
        /**
         * Called to determine whether the change in props and state should trigger a re-render.
         *
         * `Component` always returns true.
         * `PureComponent` implements a shallow comparison on props and state and returns true if any
         * props or states have changed.
         *
         * If false is returned, `Component#render`, `componentWillUpdate`
         * and `componentDidUpdate` will not be called.
         */
        shouldComponentUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean;
        /**
         * Called immediately before a component is destroyed. Perform any necessary cleanup in this method, such as
         * cancelled network requests, or cleaning up any DOM elements created in `componentDidMount`.
         */
        componentWillUnmount?(): void;
        /**
         * Catches exceptions generated in descendant components. Unhandled exceptions will cause
         * the entire component tree to unmount.
         */
        componentDidCatch?(error: Error, errorInfo: ErrorInfo): void;
    }

    // Unfortunately, we have no way of declaring that the component constructor must implement this
    interface StaticLifecycle<P, S> {
        getDerivedStateFromProps?: GetDerivedStateFromProps<P, S>;
        getDerivedStateFromError?: GetDerivedStateFromError<P, S>;
    }

    type GetDerivedStateFromProps<P, S> =
        /**
         * Returns an update to a component's state based on its new props and old state.
         *
         * Note: its presence prevents any of the deprecated lifecycle methods from being invoked
         */
        (nextProps: Readonly<P>, prevState: S) => Partial<S> | null;

    type GetDerivedStateFromError<P, S> =
        /**
         * This lifecycle is invoked after an error has been thrown by a descendant component.
         * It receives the error that was thrown as a parameter and should return a value to update state.
         *
         * Note: its presence prevents any of the deprecated lifecycle methods from being invoked
         */
        (error: any) => Partial<S> | null;

    // This should be "infer SS" but can't use it yet
    interface NewLifecycle<P, S, SS> {
        /**
         * Runs before React applies the result of `render` to the document, and
         * returns an object to be given to componentDidUpdate. Useful for saving
         * things such as scroll position before `render` causes changes to it.
         *
         * Note: the presence of getSnapshotBeforeUpdate prevents any of the deprecated
         * lifecycle events from running.
         */
        getSnapshotBeforeUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>): SS | null;
        /**
         * Called immediately after updating occurs. Not called for the initial render.
         *
         * The snapshot is only present if getSnapshotBeforeUpdate is present and returns non-null.
         */
        componentDidUpdate?(prevProps: Readonly<P>, prevState: Readonly<S>, snapshot?: SS): void;
    }

    interface DeprecatedLifecycle<P, S> {
        /**
         * Called immediately before mounting occurs, and before `Component#render`.
         * Avoid introducing any side-effects or subscriptions in this method.
         *
         * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
         * prevents this from being invoked.
         *
         * @deprecated 16.3, use componentDidMount or the constructor instead; will stop working in React 17
         * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state
         * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
         */
        componentWillMount?(): void;
        /**
         * Called immediately before mounting occurs, and before `Component#render`.
         * Avoid introducing any side-effects or subscriptions in this method.
         *
         * This method will not stop working in React 17.
         *
         * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
         * prevents this from being invoked.
         *
         * @deprecated 16.3, use componentDidMount or the constructor instead
         * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#initializing-state
         * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
         */
        UNSAFE_componentWillMount?(): void;
        /**
         * Called when the component may be receiving new props.
         * React may call this even if props have not changed, so be sure to compare new and existing
         * props if you only want to handle changes.
         *
         * Calling `Component#setState` generally does not trigger this method.
         *
         * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
         * prevents this from being invoked.
         *
         * @deprecated 16.3, use static getDerivedStateFromProps instead; will stop working in React 17
         * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props
         * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
         */
        componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void;
        /**
         * Called when the component may be receiving new props.
         * React may call this even if props have not changed, so be sure to compare new and existing
         * props if you only want to handle changes.
         *
         * Calling `Component#setState` generally does not trigger this method.
         *
         * This method will not stop working in React 17.
         *
         * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
         * prevents this from being invoked.
         *
         * @deprecated 16.3, use static getDerivedStateFromProps instead
         * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#updating-state-based-on-props
         * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
         */
        UNSAFE_componentWillReceiveProps?(nextProps: Readonly<P>, nextContext: any): void;
        /**
         * Called immediately before rendering when new props or state is received. Not called for the initial render.
         *
         * Note: You cannot call `Component#setState` here.
         *
         * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
         * prevents this from being invoked.
         *
         * @deprecated 16.3, use getSnapshotBeforeUpdate instead; will stop working in React 17
         * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update
         * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
         */
        componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void;
        /**
         * Called immediately before rendering when new props or state is received. Not called for the initial render.
         *
         * Note: You cannot call `Component#setState` here.
         *
         * This method will not stop working in React 17.
         *
         * Note: the presence of getSnapshotBeforeUpdate or getDerivedStateFromProps
         * prevents this from being invoked.
         *
         * @deprecated 16.3, use getSnapshotBeforeUpdate instead
         * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#reading-dom-properties-before-an-update
         * @see https://reactjs.org/blog/2018/03/27/update-on-async-rendering.html#gradual-migration-path
         */
        UNSAFE_componentWillUpdate?(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void;
    }

    interface Mixin<P, S> extends ComponentLifecycle<P, S> {
        mixins?: Array<Mixin<P, S>>;
        statics?: {
            [key: string]: any;
        };

        displayName?: string;
        propTypes?: ValidationMap<any>;
        contextTypes?: ValidationMap<any>;
        childContextTypes?: ValidationMap<any>;

        getDefaultProps?(): P;
        getInitialState?(): S;
    }

    interface ComponentSpec<P, S> extends Mixin<P, S> {
        render(): ReactNode;

        [propertyName: string]: any;
    }

    function createRef<T>(): RefObject<T>;

    // will show `ForwardRef(${Component.displayName || Component.name})` in devtools by default,
    // but can be given its own specific name
    interface ForwardRefExoticComponent<P> extends NamedExoticComponent<P> {
        defaultProps?: Partial<P>;
        propTypes?: WeakValidationMap<P>;
    }

    function forwardRef<T, P = {}>(render: ForwardRefRenderFunction<T, P>): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;

    /** Ensures that the props do not include ref at all */
    type PropsWithoutRef<P> =
        // Just Pick would be sufficient for this, but I'm trying to avoid unnecessary mapping over union types
        // https://github.com/Microsoft/TypeScript/issues/28339
        'ref' extends keyof P
            ? Pick<P, Exclude<keyof P, 'ref'>>
            : P;
    /** Ensures that the props do not include string ref, which cannot be forwarded */
    type PropsWithRef<P> =
        // Just "P extends { ref?: infer R }" looks sufficient, but R will infer as {} if P is {}.
        'ref' extends keyof P
            ? P extends { ref?: infer R }
                ? string extends R
                    ? PropsWithoutRef<P> & { ref?: Exclude<R, string> }
                    : P
                : P
            : P;

    type PropsWithChildren<P> = P & { children?: ReactNode };

    /**
     * NOTE: prefer ComponentPropsWithRef, if the ref is forwarded,
     * or ComponentPropsWithoutRef when refs are not supported.
     */
    type ComponentProps<T extends keyof JSX.IntrinsicElements | JSXElementConstructor<any>> =
        T extends JSXElementConstructor<infer P>
            ? P
            : T extends keyof JSX.IntrinsicElements
                ? JSX.IntrinsicElements[T]
                : {};
    type ComponentPropsWithRef<T extends ElementType> =
        T extends ComponentClass<infer P>
            ? PropsWithoutRef<P> & RefAttributes<InstanceType<T>>
            : PropsWithRef<ComponentProps<T>>;
    type ComponentPropsWithoutRef<T extends ElementType> =
        PropsWithoutRef<ComponentProps<T>>;

    // will show `Memo(${Component.displayName || Component.name})` in devtools by default,
    // but can be given its own specific name
    type MemoExoticComponent<T extends ComponentType<any>> = NamedExoticComponent<ComponentPropsWithRef<T>> & {
        readonly type: T;
    };

    function memo<P extends object>(
        Component: SFC<P>,
        propsAreEqual?: (prevProps: Readonly<PropsWithChildren<P>>, nextProps: Readonly<PropsWithChildren<P>>) => boolean
    ): NamedExoticComponent<P>;
    function memo<T extends ComponentType<any>>(
        Component: T,
        propsAreEqual?: (prevProps: Readonly<ComponentProps<T>>, nextProps: Readonly<ComponentProps<T>>) => boolean
    ): MemoExoticComponent<T>;

    type LazyExoticComponent<T extends ComponentType<any>> = ExoticComponent<ComponentPropsWithRef<T>> & {
        readonly _result: T;
    };

    function lazy<T extends ComponentType<any>>(
        factory: () => Promise<{ default: T }>
    ): LazyExoticComponent<T>;

    //
    // React Hooks
    // ----------------------------------------------------------------------

    // based on the code in https://github.com/facebook/react/pull/13968

    // Unlike the class component setState, the updates are not allowed to be partial
    type SetStateAction<S> = S | ((prevState: S) => S);
    // this technically does accept a second argument, but it's already under a deprecation warning
    // and it's not even released so probably better to not define it.
    type Dispatch<A> = (value: A) => void;
    // Since action _can_ be undefined, dispatch may be called without any parameters.
    type DispatchWithoutAction = () => void;
    // Unlike redux, the actions _can_ be anything
    type Reducer<S, A> = (prevState: S, action: A) => S;
    // If useReducer accepts a reducer without action, dispatch may be called without any parameters.
    type ReducerWithoutAction<S> = (prevState: S) => S;
    // types used to try and prevent the compiler from reducing S
    // to a supertype common with the second argument to useReducer()
    type ReducerState<R extends Reducer<any, any>> = R extends Reducer<infer S, any> ? S : never;
    type ReducerAction<R extends Reducer<any, any>> = R extends Reducer<any, infer A> ? A : never;
    // The identity check is done with the SameValue algorithm (Object.is), which is stricter than ===
    type ReducerStateWithoutAction<R extends ReducerWithoutAction<any>> =
        R extends ReducerWithoutAction<infer S> ? S : never;
    // TODO (TypeScript 3.0): ReadonlyArray<unknown>
    type DependencyList = ReadonlyArray<any>;

    // NOTE: callbacks are _only_ allowed to return either void, or a destructor.
    // The destructor is itself only allowed to return void.
    type EffectCallback = () => (void | (() => void | undefined));

    interface MutableRefObject<T> {
        current: T;
    }

    // This will technically work if you give a Consumer<T> or Provider<T> but it's deprecated and warns
    /**
     * Accepts a context object (the value returned from `React.createContext`) and returns the current
     * context value, as given by the nearest context provider for the given context.
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#usecontext
     */
    function useContext<T>(context: Context<T>/*, (not public API) observedBits?: number|boolean */): T;
    /**
     * Returns a stateful value, and a function to update it.
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#usestate
     */
    function useState<S>(initialState: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
    // convenience overload when first argument is ommitted
    /**
     * Returns a stateful value, and a function to update it.
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#usestate
     */
    function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
    /**
     * An alternative to `useState`.
     *
     * `useReducer` is usually preferable to `useState` when you have complex state logic that involves
     * multiple sub-values. It also lets you optimize performance for components that trigger deep
     * updates because you can pass `dispatch` down instead of callbacks.
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#usereducer
     */
    // overload where dispatch could accept 0 arguments.
    function useReducer<R extends ReducerWithoutAction<any>, I>(
        reducer: R,
        initializerArg: I,
        initializer: (arg: I) => ReducerStateWithoutAction<R>
    ): [ReducerStateWithoutAction<R>, DispatchWithoutAction];
    /**
     * An alternative to `useState`.
     *
     * `useReducer` is usually preferable to `useState` when you have complex state logic that involves
     * multiple sub-values. It also lets you optimize performance for components that trigger deep
     * updates because you can pass `dispatch` down instead of callbacks.
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#usereducer
     */
    // overload where dispatch could accept 0 arguments.
    function useReducer<R extends ReducerWithoutAction<any>>(
        reducer: R,
        initializerArg: ReducerStateWithoutAction<R>,
        initializer?: undefined
    ): [ReducerStateWithoutAction<R>, DispatchWithoutAction];
    /**
     * An alternative to `useState`.
     *
     * `useReducer` is usually preferable to `useState` when you have complex state logic that involves
     * multiple sub-values. It also lets you optimize performance for components that trigger deep
     * updates because you can pass `dispatch` down instead of callbacks.
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#usereducer
     */
    // overload where "I" may be a subset of ReducerState<R>; used to provide autocompletion.
    // If "I" matches ReducerState<R> exactly then the last overload will allow initializer to be ommitted.
    // the last overload effectively behaves as if the identity function (x => x) is the initializer.
    function useReducer<R extends Reducer<any, any>, I>(
        reducer: R,
        initializerArg: I & ReducerState<R>,
        initializer: (arg: I & ReducerState<R>) => ReducerState<R>
    ): [ReducerState<R>, Dispatch<ReducerAction<R>>];
    /**
     * An alternative to `useState`.
     *
     * `useReducer` is usually preferable to `useState` when you have complex state logic that involves
     * multiple sub-values. It also lets you optimize performance for components that trigger deep
     * updates because you can pass `dispatch` down instead of callbacks.
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#usereducer
     */
    // overload for free "I"; all goes as long as initializer converts it into "ReducerState<R>".
    function useReducer<R extends Reducer<any, any>, I>(
        reducer: R,
        initializerArg: I,
        initializer: (arg: I) => ReducerState<R>
    ): [ReducerState<R>, Dispatch<ReducerAction<R>>];
    /**
     * An alternative to `useState`.
     *
     * `useReducer` is usually preferable to `useState` when you have complex state logic that involves
     * multiple sub-values. It also lets you optimize performance for components that trigger deep
     * updates because you can pass `dispatch` down instead of callbacks.
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#usereducer
     */

    // I'm not sure if I keep this 2-ary or if I make it (2,3)-ary; it's currently (2,3)-ary.
    // The Flow types do have an overload for 3-ary invocation with undefined initializer.

    // NOTE: without the ReducerState indirection, TypeScript would reduce S to be the most common
    // supertype between the reducer's return type and the initialState (or the initializer's return type),
    // which would prevent autocompletion from ever working.

    // TODO: double-check if this weird overload logic is necessary. It is possible it's either a bug
    // in older versions, or a regression in newer versions of the typescript completion service.
    function useReducer<R extends Reducer<any, any>>(
        reducer: R,
        initialState: ReducerState<R>,
        initializer?: undefined
    ): [ReducerState<R>, Dispatch<ReducerAction<R>>];
    /**
     * `useRef` returns a mutable ref object whose `.current` property is initialized to the passed argument
     * (`initialValue`). The returned object will persist for the full lifetime of the component.
     *
     * Note that `useRef()` is useful for more than the `ref` attribute. It’s handy for keeping any mutable
     * value around similar to how you’d use instance fields in classes.
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#useref
     */
    // TODO (TypeScript 3.0): <T extends unknown>
    function useRef<T>(initialValue: T): MutableRefObject<T>;
    // convenience overload for refs given as a ref prop as they typically start with a null value
    /**
     * `useRef` returns a mutable ref object whose `.current` property is initialized to the passed argument
     * (`initialValue`). The returned object will persist for the full lifetime of the component.
     *
     * Note that `useRef()` is useful for more than the `ref` attribute. It’s handy for keeping any mutable
     * value around similar to how you’d use instance fields in classes.
     *
     * Usage note: if you need the result of useRef to be directly mutable, include `| null` in the type
     * of the generic argument.
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#useref
     */
    // TODO (TypeScript 3.0): <T extends unknown>
    function useRef<T>(initialValue: T|null): RefObject<T>;
    // convenience overload for potentially undefined initialValue / call with 0 arguments
    // has a default to stop it from defaulting to {} instead
    /**
     * `useRef` returns a mutable ref object whose `.current` property is initialized to the passed argument
     * (`initialValue`). The returned object will persist for the full lifetime of the component.
     *
     * Note that `useRef()` is useful for more than the `ref` attribute. It’s handy for keeping any mutable
     * value around similar to how you’d use instance fields in classes.
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#useref
     */
    // TODO (TypeScript 3.0): <T extends unknown>
    function useRef<T = undefined>(): MutableRefObject<T | undefined>;
    /**
     * The signature is identical to `useEffect`, but it fires synchronously after all DOM mutations.
     * Use this to read layout from the DOM and synchronously re-render. Updates scheduled inside
     * `useLayoutEffect` will be flushed synchronously, before the browser has a chance to paint.
     *
     * Prefer the standard `useEffect` when possible to avoid blocking visual updates.
     *
     * If you’re migrating code from a class component, `useLayoutEffect` fires in the same phase as
     * `componentDidMount` and `componentDidUpdate`.
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#uselayouteffect
     */
    function useLayoutEffect(effect: EffectCallback, deps?: DependencyList): void;
    /**
     * Accepts a function that contains imperative, possibly effectful code.
     *
     * @param effect Imperative function that can return a cleanup function
     * @param deps If present, effect will only activate if the values in the list change.
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#useeffect
     */
    function useEffect(effect: EffectCallback, deps?: DependencyList): void;
    // NOTE: this does not accept strings, but this will have to be fixed by removing strings from type Ref<T>
    /**
     * `useImperativeHandle` customizes the instance value that is exposed to parent components when using
     * `ref`. As always, imperative code using refs should be avoided in most cases.
     *
     * `useImperativeHandle` should be used with `React.forwardRef`.
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#useimperativehandle
     */
    function useImperativeHandle<T, R extends T>(ref: Ref<T>|undefined, init: () => R, deps?: DependencyList): void;
    // I made 'inputs' required here and in useMemo as there's no point to memoizing without the memoization key
    // useCallback(X) is identical to just using X, useMemo(() => Y) is identical to just using Y.
    /**
     * `useCallback` will return a memoized version of the callback that only changes if one of the `inputs`
     * has changed.
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#usecallback
     */
    // TODO (TypeScript 3.0): <T extends (...args: never[]) => unknown>
    function useCallback<T extends (...args: any[]) => any>(callback: T, deps: DependencyList): T;
    /**
     * `useMemo` will only recompute the memoized value when one of the `deps` has changed.
     *
     * Usage note: if calling `useMemo` with a referentially stable function, also give it as the input in
     * the second argument.
     *
     * ```ts
     * function expensive () { ... }
     *
     * function Component () {
     *   const expensiveResult = useMemo(expensive, [expensive])
     *   return ...
     * }
     * ```
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#usememo
     */
    // allow undefined, but don't make it optional as that is very likely a mistake
    function useMemo<T>(factory: () => T, deps: DependencyList | undefined): T;
    /**
     * `useDebugValue` can be used to display a label for custom hooks in React DevTools.
     *
     * NOTE: We don’t recommend adding debug values to every custom hook.
     * It’s most valuable for custom hooks that are part of shared libraries.
     *
     * @version 16.8.0
     * @see https://reactjs.org/docs/hooks-reference.html#usedebugvalue
     */
    // the name of the custom hook is itself derived from the function name at runtime:
    // it's just the function name without the "use" prefix.
    function useDebugValue<T>(value: T, format?: (value: T) => any): void;

    //
    // Event System
    // ----------------------------------------------------------------------
    // TODO: change any to unknown when moving to TS v3
    interface BaseSyntheticEvent<E = object, C = any, T = any> {
        nativeEvent: E;
        currentTarget: C;
        target: T;
        bubbles: boolean;
        cancelable: boolean;
        defaultPrevented: boolean;
        eventPhase: number;
        isTrusted: boolean;
        preventDefault(): void;
        isDefaultPrevented(): boolean;
        stopPropagation(): void;
        isPropagationStopped(): boolean;
        persist(): void;
        timeStamp: number;
        type: string;
    }

    /**
     * currentTarget - a reference to the element on which the event listener is registered.
     *
     * target - a reference to the element from which the event was originally dispatched.
     * This might be a child element to the element on which the event listener is registered.
     * If you thought this should be `EventTarget & T`, see https://github.com/DefinitelyTyped/DefinitelyTyped/issues/11508#issuecomment-256045682
     */
    interface SyntheticEvent<T = Element, E = Event> extends BaseSyntheticEvent<E, EventTarget & T, EventTarget> {}

    interface ClipboardEvent<T = Element> extends SyntheticEvent<T, NativeClipboardEvent> {
        clipboardData: DataTransfer;
    }

    interface CompositionEvent<T = Element> extends SyntheticEvent<T, NativeCompositionEvent> {
        data: string;
    }

    interface DragEvent<T = Element> extends MouseEvent<T, NativeDragEvent> {
        dataTransfer: DataTransfer;
    }

    interface PointerEvent<T = Element> extends MouseEvent<T, NativePointerEvent> {
        pointerId: number;
        pressure: number;
        tangentialPressure: number;
        tiltX: number;
        tiltY: number;
        twist: number;
        width: number;
        height: number;
        pointerType: 'mouse' | 'pen' | 'touch';
        isPrimary: boolean;
    }

    interface FocusEvent<T = Element> extends SyntheticEvent<T, NativeFocusEvent> {
        relatedTarget: EventTarget | null;
        target: EventTarget & T;
    }

    // tslint:disable-next-line:no-empty-interface
    interface FormEvent<T = Element> extends SyntheticEvent<T> {
    }

    interface InvalidEvent<T = Element> extends SyntheticEvent<T> {
        target: EventTarget & T;
    }

    interface ChangeEvent<T = Element> extends SyntheticEvent<T> {
        target: EventTarget & T;
    }

    interface KeyboardEvent<T = Element> extends SyntheticEvent<T, NativeKeyboardEvent> {
        altKey: boolean;
        /** @deprecated */
        charCode: number;
        ctrlKey: boolean;
        /**
         * See [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier). for a list of valid (case-sensitive) arguments to this method.
         */
        getModifierState(key: string): boolean;
        /**
         * See the [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#named-key-attribute-values). for possible values
         */
        key: string;
        /** @deprecated */
        keyCode: number;
        locale: string;
        location: number;
        metaKey: boolean;
        repeat: boolean;
        shiftKey: boolean;
        /** @deprecated */
        which: number;
    }

    interface MouseEvent<T = Element, E = NativeMouseEvent> extends UIEvent<T, E> {
        altKey: boolean;
        button: number;
        buttons: number;
        clientX: number;
        clientY: number;
        ctrlKey: boolean;
        /**
         * See [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier). for a list of valid (case-sensitive) arguments to this method.
         */
        getModifierState(key: string): boolean;
        metaKey: boolean;
        movementX: number;
        movementY: number;
        pageX: number;
        pageY: number;
        relatedTarget: EventTarget | null;
        screenX: number;
        screenY: number;
        shiftKey: boolean;
    }

    interface TouchEvent<T = Element> extends UIEvent<T, NativeTouchEvent> {
        altKey: boolean;
        changedTouches: TouchList;
        ctrlKey: boolean;
        /**
         * See [DOM Level 3 Events spec](https://www.w3.org/TR/uievents-key/#keys-modifier). for a list of valid (case-sensitive) arguments to this method.
         */
        getModifierState(key: string): boolean;
        metaKey: boolean;
        shiftKey: boolean;
        targetTouches: TouchList;
        touches: TouchList;
    }

    interface UIEvent<T = Element, E = NativeUIEvent> extends SyntheticEvent<T, E> {
        detail: number;
        view: AbstractView;
    }

    interface WheelEvent<T = Element> extends MouseEvent<T, NativeWheelEvent> {
        deltaMode: number;
        deltaX: number;
        deltaY: number;
        deltaZ: number;
    }

    interface AnimationEvent<T = Element> extends SyntheticEvent<T, NativeAnimationEvent> {
        animationName: string;
        elapsedTime: number;
        pseudoElement: string;
    }

    interface TransitionEvent<T = Element> extends SyntheticEvent<T, NativeTransitionEvent> {
        elapsedTime: number;
        propertyName: string;
        pseudoElement: string;
    }

    //
    // Event Handler Types
    // ----------------------------------------------------------------------

    type EventHandler<E extends SyntheticEvent<any>> = { bivarianceHack(event: E): void }["bivarianceHack"];

    type ReactEventHandler<T = Element> = EventHandler<SyntheticEvent<T>>;

    type ClipboardEventHandler<T = Element> = EventHandler<ClipboardEvent<T>>;
    type CompositionEventHandler<T = Element> = EventHandler<CompositionEvent<T>>;
    type DragEventHandler<T = Element> = EventHandler<DragEvent<T>>;
    type FocusEventHandler<T = Element> = EventHandler<FocusEvent<T>>;
    type FormEventHandler<T = Element> = EventHandler<FormEvent<T>>;
    type ChangeEventHandler<T = Element> = EventHandler<ChangeEvent<T>>;
    type KeyboardEventHandler<T = Element> = EventHandler<KeyboardEvent<T>>;
    type MouseEventHandler<T = Element> = EventHandler<MouseEvent<T>>;
    type TouchEventHandler<T = Element> = EventHandler<TouchEvent<T>>;
    type PointerEventHandler<T = Element> = EventHandler<PointerEvent<T>>;
    type UIEventHandler<T = Element> = EventHandler<UIEvent<T>>;
    type WheelEventHandler<T = Element> = EventHandler<WheelEvent<T>>;
    type AnimationEventHandler<T = Element> = EventHandler<AnimationEvent<T>>;
    type TransitionEventHandler<T = Element> = EventHandler<TransitionEvent<T>>;

    //
    // Props / DOM Attributes
    // ----------------------------------------------------------------------

    /**
     * @deprecated. This was used to allow clients to pass `ref` and `key`
     * to `createElement`, which is no longer necessary due to intersection
     * types. If you need to declare a props object before passing it to
     * `createElement` or a factory, use `ClassAttributes<T>`:
     *
     * ```ts
     * var b: Button | null;
     * var props: ButtonProps & ClassAttributes<Button> = {
     *     ref: b => button = b, // ok!
     *     label: "I'm a Button"
     * };
     * ```
     */
    interface Props<T> {
        children?: ReactNode;
        key?: Key;
        ref?: LegacyRef<T>;
    }

    interface HTMLProps<T> extends AllHTMLAttributes<T>, ClassAttributes<T> {
    }

    type DetailedHTMLProps<E extends HTMLAttributes<T>, T> = ClassAttributes<T> & E;

    interface SVGProps<T> extends SVGAttributes<T>, ClassAttributes<T> {
    }

    interface DOMAttributes<T> {
        children?: ReactNode;
        dangerouslySetInnerHTML?: {
            __html: string;
        };

        // Clipboard Events
        onCopy?: ClipboardEventHandler<T>;
        onCopyCapture?: ClipboardEventHandler<T>;
        onCut?: ClipboardEventHandler<T>;
        onCutCapture?: ClipboardEventHandler<T>;
        onPaste?: ClipboardEventHandler<T>;
        onPasteCapture?: ClipboardEventHandler<T>;

        // Composition Events
        onCompositionEnd?: CompositionEventHandler<T>;
        onCompositionEndCapture?: CompositionEventHandler<T>;
        onCompositionStart?: CompositionEventHandler<T>;
        onCompositionStartCapture?: CompositionEventHandler<T>;
        onCompositionUpdate?: CompositionEventHandler<T>;
        onCompositionUpdateCapture?: CompositionEventHandler<T>;

        // Focus Events
        onFocus?: FocusEventHandler<T>;
        onFocusCapture?: FocusEventHandler<T>;
        onBlur?: FocusEventHandler<T>;
        onBlurCapture?: FocusEventHandler<T>;

        // Form Events
        onChange?: FormEventHandler<T>;
        onChangeCapture?: FormEventHandler<T>;
        onBeforeInput?: FormEventHandler<T>;
        onBeforeInputCapture?: FormEventHandler<T>;
        onInput?: FormEventHandler<T>;
        onInputCapture?: FormEventHandler<T>;
        onReset?: FormEventHandler<T>;
        onResetCapture?: FormEventHandler<T>;
        onSubmit?: FormEventHandler<T>;
        onSubmitCapture?: FormEventHandler<T>;
        onInvalid?: FormEventHandler<T>;
        onInvalidCapture?: FormEventHandler<T>;

        // Image Events
        onLoad?: ReactEventHandler<T>;
        onLoadCapture?: ReactEventHandler<T>;
        onError?: ReactEventHandler<T>; // also a Media Event
        onErrorCapture?: ReactEventHandler<T>; // also a Media Event

        // Keyboard Events
        onKeyDown?: KeyboardEventHandler<T>;
        onKeyDownCapture?: KeyboardEventHandler<T>;
        onKeyPress?: KeyboardEventHandler<T>;
        onKeyPressCapture?: KeyboardEventHandler<T>;
        onKeyUp?: KeyboardEventHandler<T>;
        onKeyUpCapture?: KeyboardEventHandler<T>;

        // Media Events
        onAbort?: ReactEventHandler<T>;
        onAbortCapture?: ReactEventHandler<T>;
        onCanPlay?: ReactEventHandler<T>;
        onCanPlayCapture?: ReactEventHandler<T>;
        onCanPlayThrough?: ReactEventHandler<T>;
        onCanPlayThroughCapture?: ReactEventHandler<T>;
        onDurationChange?: ReactEventHandler<T>;
        onDurationChangeCapture?: ReactEventHandler<T>;
        onEmptied?: ReactEventHandler<T>;
        onEmptiedCapture?: ReactEventHandler<T>;
        onEncrypted?: ReactEventHandler<T>;
        onEncryptedCapture?: ReactEventHandler<T>;
        onEnded?: ReactEventHandler<T>;
        onEndedCapture?: ReactEventHandler<T>;
        onLoadedData?: ReactEventHandler<T>;
        onLoadedDataCapture?: ReactEventHandler<T>;
        onLoadedMetadata?: ReactEventHandler<T>;
        onLoadedMetadataCapture?: ReactEventHandler<T>;
        onLoadStart?: ReactEventHandler<T>;
        onLoadStartCapture?: ReactEventHandler<T>;
        onPause?: ReactEventHandler<T>;
        onPauseCapture?: ReactEventHandler<T>;
        onPlay?: ReactEventHandler<T>;
        onPlayCapture?: ReactEventHandler<T>;
        onPlaying?: ReactEventHandler<T>;
        onPlayingCapture?: ReactEventHandler<T>;
        onProgress?: ReactEventHandler<T>;
        onProgressCapture?: ReactEventHandler<T>;
        onRateChange?: ReactEventHandler<T>;
        onRateChangeCapture?: ReactEventHandler<T>;
        onSeeked?: ReactEventHandler<T>;
        onSeekedCapture?: ReactEventHandler<T>;
        onSeeking?: ReactEventHandler<T>;
        onSeekingCapture?: ReactEventHandler<T>;
        onStalled?: ReactEventHandler<T>;
        onStalledCapture?: ReactEventHandler<T>;
        onSuspend?: ReactEventHandler<T>;
        onSuspendCapture?: ReactEventHandler<T>;
        onTimeUpdate?: ReactEventHandler<T>;
        onTimeUpdateCapture?: ReactEventHandler<T>;
        onVolumeChange?: ReactEventHandler<T>;
        onVolumeChangeCapture?: ReactEventHandler<T>;
        onWaiting?: ReactEventHandler<T>;
        onWaitingCapture?: ReactEventHandler<T>;

        // MouseEvents
        onAuxClick?: MouseEventHandler<T>;
        onAuxClickCapture?: MouseEventHandler<T>;
        onClick?: MouseEventHandler<T>;
        onClickCapture?: MouseEventHandler<T>;
        onContextMenu?: MouseEventHandler<T>;
        onContextMenuCapture?: MouseEventHandler<T>;
        onDoubleClick?: MouseEventHandler<T>;
        onDoubleClickCapture?: MouseEventHandler<T>;
        onDrag?: DragEventHandler<T>;
        onDragCapture?: DragEventHandler<T>;
        onDragEnd?: DragEventHandler<T>;
        onDragEndCapture?: DragEventHandler<T>;
        onDragEnter?: DragEventHandler<T>;
        onDragEnterCapture?: DragEventHandler<T>;
        onDragExit?: DragEventHandler<T>;
        onDragExitCapture?: DragEventHandler<T>;
        onDragLeave?: DragEventHandler<T>;
        onDragLeaveCapture?: DragEventHandler<T>;
        onDragOver?: DragEventHandler<T>;
        onDragOverCapture?: DragEventHandler<T>;
        onDragStart?: DragEventHandler<T>;
        onDragStartCapture?: DragEventHandler<T>;
        onDrop?: DragEventHandler<T>;
        onDropCapture?: DragEventHandler<T>;
        onMouseDown?: MouseEventHandler<T>;
        onMouseDownCapture?: MouseEventHandler<T>;
        onMouseEnter?: MouseEventHandler<T>;
        onMouseLeave?: MouseEventHandler<T>;
        onMouseMove?: MouseEventHandler<T>;
        onMouseMoveCapture?: MouseEventHandler<T>;
        onMouseOut?: MouseEventHandler<T>;
        onMouseOutCapture?: MouseEventHandler<T>;
        onMouseOver?: MouseEventHandler<T>;
        onMouseOverCapture?: MouseEventHandler<T>;
        onMouseUp?: MouseEventHandler<T>;
        onMouseUpCapture?: MouseEventHandler<T>;

        // Selection Events
        onSelect?: ReactEventHandler<T>;
        onSelectCapture?: ReactEventHandler<T>;

        // Touch Events
        onTouchCancel?: TouchEventHandler<T>;
        onTouchCancelCapture?: TouchEventHandler<T>;
        onTouchEnd?: TouchEventHandler<T>;
        onTouchEndCapture?: TouchEventHandler<T>;
        onTouchMove?: TouchEventHandler<T>;
        onTouchMoveCapture?: TouchEventHandler<T>;
        onTouchStart?: TouchEventHandler<T>;
        onTouchStartCapture?: TouchEventHandler<T>;

        // Pointer Events
        onPointerDown?: PointerEventHandler<T>;
        onPointerDownCapture?: PointerEventHandler<T>;
        onPointerMove?: PointerEventHandler<T>;
        onPointerMoveCapture?: PointerEventHandler<T>;
        onPointerUp?: PointerEventHandler<T>;
        onPointerUpCapture?: PointerEventHandler<T>;
        onPointerCancel?: PointerEventHandler<T>;
        onPointerCancelCapture?: PointerEventHandler<T>;
        onPointerEnter?: PointerEventHandler<T>;
        onPointerEnterCapture?: PointerEventHandler<T>;
        onPointerLeave?: PointerEventHandler<T>;
        onPointerLeaveCapture?: PointerEventHandler<T>;
        onPointerOver?: PointerEventHandler<T>;
        onPointerOverCapture?: PointerEventHandler<T>;
        onPointerOut?: PointerEventHandler<T>;
        onPointerOutCapture?: PointerEventHandler<T>;
        onGotPointerCapture?: PointerEventHandler<T>;
        onGotPointerCaptureCapture?: PointerEventHandler<T>;
        onLostPointerCapture?: PointerEventHandler<T>;
        onLostPointerCaptureCapture?: PointerEventHandler<T>;

        // UI Events
        onScroll?: UIEventHandler<T>;
        onScrollCapture?: UIEventHandler<T>;

        // Wheel Events
        onWheel?: WheelEventHandler<T>;
        onWheelCapture?: WheelEventHandler<T>;

        // Animation Events
        onAnimationStart?: AnimationEventHandler<T>;
        onAnimationStartCapture?: AnimationEventHandler<T>;
        onAnimationEnd?: AnimationEventHandler<T>;
        onAnimationEndCapture?: AnimationEventHandler<T>;
        onAnimationIteration?: AnimationEventHandler<T>;
        onAnimationIterationCapture?: AnimationEventHandler<T>;

        // Transition Events
        onTransitionEnd?: TransitionEventHandler<T>;
        onTransitionEndCapture?: TransitionEventHandler<T>;
    }

    interface CSSProperties extends CSS.Properties<string | number> {
        /**
         * The index signature was removed to enable closed typing for style
         * using CSSType. You're able to use type assertion or module augmentation
         * to add properties or an index signature of your own.
         *
         * For examples and more information, visit:
         * https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors
         */
    }

    // All the WAI-ARIA 1.1 attributes from https://www.w3.org/TR/wai-aria-1.1/
    interface AriaAttributes {
        /** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
        'aria-activedescendant'?: string;
        /** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
        'aria-atomic'?: boolean | 'false' | 'true';
        /**
         * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
         * presented if they are made.
         */
        'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both';
        /** Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. */
        'aria-busy'?: boolean | 'false' | 'true';
        /**
         * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
         * @see aria-pressed @see aria-selected.
         */
        'aria-checked'?: boolean | 'false' | 'mixed' | 'true';
        /**
         * Defines the total number of columns in a table, grid, or treegrid.
         * @see aria-colindex.
         */
        'aria-colcount'?: number;
        /**
         * Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.
         * @see aria-colcount @see aria-colspan.
         */
        'aria-colindex'?: number;
        /**
         * Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.
         * @see aria-colindex @see aria-rowspan.
         */
        'aria-colspan'?: number;
        /**
         * Identifies the element (or elements) whose contents or presence are controlled by the current element.
         * @see aria-owns.
         */
        'aria-controls'?: string;
        /** Indicates the element that represents the current item within a container or set of related elements. */
        'aria-current'?: boolean | 'false' | 'true' | 'page' | 'step' | 'location' | 'date' | 'time';
        /**
         * Identifies the element (or elements) that describes the object.
         * @see aria-labelledby
         */
        'aria-describedby'?: string;
        /**
         * Identifies the element that provides a detailed, extended description for the object.
         * @see aria-describedby.
         */
        'aria-details'?: string;
        /**
         * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
         * @see aria-hidden @see aria-readonly.
         */
        'aria-disabled'?: boolean | 'false' | 'true';
        /**
         * Indicates what functions can be performed when a dragged object is released on the drop target.
         * @deprecated in ARIA 1.1
         */
        'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup';
        /**
         * Identifies the element that provides an error message for the object.
         * @see aria-invalid @see aria-describedby.
         */
        'aria-errormessage'?: string;
        /** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
        'aria-expanded'?: boolean | 'false' | 'true';
        /**
         * Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
         * allows assistive technology to override the general default of reading in document source order.
         */
        'aria-flowto'?: string;
        /**
         * Indicates an element's "grabbed" state in a drag-and-drop operation.
         * @deprecated in ARIA 1.1
         */
        'aria-grabbed'?: boolean | 'false' | 'true';
        /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
        'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
        /**
         * Indicates whether the element is exposed to an accessibility API.
         * @see aria-disabled.
         */
        'aria-hidden'?: boolean | 'false' | 'true';
        /**
         * Indicates the entered value does not conform to the format expected by the application.
         * @see aria-errormessage.
         */
        'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
        /** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
        'aria-keyshortcuts'?: string;
        /**
         * Defines a string value that labels the current element.
         * @see aria-labelledby.
         */
        'aria-label'?: string;
        /**
         * Identifies the element (or elements) that labels the current element.
         * @see aria-describedby.
         */
        'aria-labelledby'?: string;
        /** Defines the hierarchical level of an element within a structure. */
        'aria-level'?: number;
        /** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
        'aria-live'?: 'off' | 'assertive' | 'polite';
        /** Indicates whether an element is modal when displayed. */
        'aria-modal'?: boolean | 'false' | 'true';
        /** Indicates whether a text box accepts multiple lines of input or only a single line. */
        'aria-multiline'?: boolean | 'false' | 'true';
        /** Indicates that the user may select more than one item from the current selectable descendants. */
        'aria-multiselectable'?: boolean | 'false' | 'true';
        /** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
        'aria-orientation'?: 'horizontal' | 'vertical';
        /**
         * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
         * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
         * @see aria-controls.
         */
        'aria-owns'?: string;
        /**
         * Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
         * A hint could be a sample value or a brief description of the expected format.
         */
        'aria-placeholder'?: string;
        /**
         * Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
         * @see aria-setsize.
         */
        'aria-posinset'?: number;
        /**
         * Indicates the current "pressed" state of toggle buttons.
         * @see aria-checked @see aria-selected.
         */
        'aria-pressed'?: boolean | 'false' | 'mixed' | 'true';
        /**
         * Indicates that the element is not editable, but is otherwise operable.
         * @see aria-disabled.
         */
        'aria-readonly'?: boolean | 'false' | 'true';
        /**
         * Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.
         * @see aria-atomic.
         */
        'aria-relevant'?: 'additions' | 'additions removals' | 'additions text' | 'all' | 'removals' | 'removals additions' | 'removals text' | 'text' | 'text additions' | 'text removals';
        /** Indicates that user input is required on the element before a form may be submitted. */
        'aria-required'?: boolean | 'false' | 'true';
        /** Defines a human-readable, author-localized description for the role of an element. */
        'aria-roledescription'?: string;
        /**
         * Defines the total number of rows in a table, grid, or treegrid.
         * @see aria-rowindex.
         */
        'aria-rowcount'?: number;
        /**
         * Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.
         * @see aria-rowcount @see aria-rowspan.
         */
        'aria-rowindex'?: number;
        /**
         * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
         * @see aria-rowindex @see aria-colspan.
         */
        'aria-rowspan'?: number;
        /**
         * Indicates the current "selected" state of various widgets.
         * @see aria-checked @see aria-pressed.
         */
        'aria-selected'?: boolean | 'false' | 'true';
        /**
         * Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
         * @see aria-posinset.
         */
        'aria-setsize'?: number;
        /** Indicates if items in a table or grid are sorted in ascending or descending order. */
        'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other';
        /** Defines the maximum allowed value for a range widget. */
        'aria-valuemax'?: number;
        /** Defines the minimum allowed value for a range widget. */
        'aria-valuemin'?: number;
        /**
         * Defines the current value for a range widget.
         * @see aria-valuetext.
         */
        'aria-valuenow'?: number;
        /** Defines the human readable text alternative of aria-valuenow for a range widget. */
        'aria-valuetext'?: string;
    }

    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
        // React-specific Attributes
        defaultChecked?: boolean;
        defaultValue?: string | number | ReadonlyArray<string>;
        suppressContentEditableWarning?: boolean;
        suppressHydrationWarning?: boolean;

        // Standard HTML Attributes
        accessKey?: string;
        className?: string;
        contentEditable?: Booleanish | "inherit";
        contextMenu?: string;
        dir?: string;
        draggable?: Booleanish;
        hidden?: boolean;
        id?: string;
        lang?: string;
        placeholder?: string;
        slot?: string;
        spellCheck?: Booleanish;
        style?: CSSProperties;
        tabIndex?: number;
        title?: string;
        translate?: 'yes' | 'no';

        // Unknown
        radioGroup?: string; // <command>, <menuitem>

        // WAI-ARIA
        role?: string;

        // RDFa Attributes
        about?: string;
        datatype?: string;
        inlist?: any;
        prefix?: string;
        property?: string;
        resource?: string;
        typeof?: string;
        vocab?: string;

        // Non-standard Attributes
        autoCapitalize?: string;
        autoCorrect?: string;
        autoSave?: string;
        color?: string;
        itemProp?: string;
        itemScope?: boolean;
        itemType?: string;
        itemID?: string;
        itemRef?: string;
        results?: number;
        security?: string;
        unselectable?: 'on' | 'off';

        // Living Standard
        /**
         * Hints at the type of data that might be entered by the user while editing the element or its contents
         * @see https://html.spec.whatwg.org/multipage/interaction.html#input-modalities:-the-inputmode-attribute
         */
        inputMode?: 'none' | 'text' | 'tel' | 'url' | 'email' | 'numeric' | 'decimal' | 'search';
        /**
         * Specify that a standard HTML element should behave like a defined custom built-in element
         * @see https://html.spec.whatwg.org/multipage/custom-elements.html#attr-is
         */
        is?: string;
    }

    interface AllHTMLAttributes<T> extends HTMLAttributes<T> {
        // Standard HTML Attributes
        accept?: string;
        acceptCharset?: string;
        action?: string;
        allowFullScreen?: boolean;
        allowTransparency?: boolean;
        alt?: string;
        as?: string;
        async?: boolean;
        autoComplete?: string;
        autoFocus?: boolean;
        autoPlay?: boolean;
        capture?: boolean | string;
        cellPadding?: number | string;
        cellSpacing?: number | string;
        charSet?: string;
        challenge?: string;
        checked?: boolean;
        cite?: string;
        classID?: string;
        cols?: number;
        colSpan?: number;
        content?: string;
        controls?: boolean;
        coords?: string;
        crossOrigin?: string;
        data?: string;
        dateTime?: string;
        default?: boolean;
        defer?: boolean;
        disabled?: boolean;
        download?: any;
        encType?: string;
        form?: string;
        formAction?: string;
        formEncType?: string;
        formMethod?: string;
        formNoValidate?: boolean;
        formTarget?: string;
        frameBorder?: number | string;
        headers?: string;
        height?: number | string;
        high?: number;
        href?: string;
        hrefLang?: string;
        htmlFor?: string;
        httpEquiv?: string;
        integrity?: string;
        keyParams?: string;
        keyType?: string;
        kind?: string;
        label?: string;
        list?: string;
        loop?: boolean;
        low?: number;
        manifest?: string;
        marginHeight?: number;
        marginWidth?: number;
        max?: number | string;
        maxLength?: number;
        media?: string;
        mediaGroup?: string;
        method?: string;
        min?: number | string;
        minLength?: number;
        multiple?: boolean;
        muted?: boolean;
        name?: string;
        nonce?: string;
        noValidate?: boolean;
        open?: boolean;
        optimum?: number;
        pattern?: string;
        placeholder?: string;
        playsInline?: boolean;
        poster?: string;
        preload?: string;
        readOnly?: boolean;
        rel?: string;
        required?: boolean;
        reversed?: boolean;
        rows?: number;
        rowSpan?: number;
        sandbox?: string;
        scope?: string;
        scoped?: boolean;
        scrolling?: string;
        seamless?: boolean;
        selected?: boolean;
        shape?: string;
        size?: number;
        sizes?: string;
        span?: number;
        src?: string;
        srcDoc?: string;
        srcLang?: string;
        srcSet?: string;
        start?: number;
        step?: number | string;
        summary?: string;
        target?: string;
        type?: string;
        useMap?: string;
        value?: string | ReadonlyArray<string> | number;
        width?: number | string;
        wmode?: string;
        wrap?: string;
    }

    interface AnchorHTMLAttributes<T> extends HTMLAttributes<T> {
        download?: any;
        href?: string;
        hrefLang?: string;
        media?: string;
        ping?: string;
        rel?: string;
        target?: string;
        type?: string;
        referrerPolicy?: string;
    }

    // tslint:disable-next-line:no-empty-interface
    interface AudioHTMLAttributes<T> extends MediaHTMLAttributes<T> {}

    interface AreaHTMLAttributes<T> extends HTMLAttributes<T> {
        alt?: string;
        coords?: string;
        download?: any;
        href?: string;
        hrefLang?: string;
        media?: string;
        rel?: string;
        shape?: string;
        target?: string;
    }

    interface BaseHTMLAttributes<T> extends HTMLAttributes<T> {
        href?: string;
        target?: string;
    }

    interface BlockquoteHTMLAttributes<T> extends HTMLAttributes<T> {
        cite?: string;
    }

    interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
        autoFocus?: boolean;
        disabled?: boolean;
        form?: string;
        formAction?: string;
        formEncType?: string;
        formMethod?: string;
        formNoValidate?: boolean;
        formTarget?: string;
        name?: string;
        type?: 'submit' | 'reset' | 'button';
        value?: string | ReadonlyArray<string> | number;
    }

    interface CanvasHTMLAttributes<T> extends HTMLAttributes<T> {
        height?: number | string;
        width?: number | string;
    }

    interface ColHTMLAttributes<T> extends HTMLAttributes<T> {
        span?: number;
        width?: number | string;
    }

    interface ColgroupHTMLAttributes<T> extends HTMLAttributes<T> {
        span?: number;
    }

    interface DataHTMLAttributes<T> extends HTMLAttributes<T> {
        value?: string | ReadonlyArray<string> | number;
    }

    interface DetailsHTMLAttributes<T> extends HTMLAttributes<T> {
        open?: boolean;
        onToggle?: ReactEventHandler<T>;
    }

    interface DelHTMLAttributes<T> extends HTMLAttributes<T> {
        cite?: string;
        dateTime?: string;
    }

    interface DialogHTMLAttributes<T> extends HTMLAttributes<T> {
        open?: boolean;
    }

    interface EmbedHTMLAttributes<T> extends HTMLAttributes<T> {
        height?: number | string;
        src?: string;
        type?: string;
        width?: number | string;
    }

    interface FieldsetHTMLAttributes<T> extends HTMLAttributes<T> {
        disabled?: boolean;
        form?: string;
        name?: string;
    }

    interface FormHTMLAttributes<T> extends HTMLAttributes<T> {
        acceptCharset?: string;
        action?: string;
        autoComplete?: string;
        encType?: string;
        method?: string;
        name?: string;
        noValidate?: boolean;
        target?: string;
    }

    interface HtmlHTMLAttributes<T> extends HTMLAttributes<T> {
        manifest?: string;
    }

    interface IframeHTMLAttributes<T> extends HTMLAttributes<T> {
        allow?: string;
        allowFullScreen?: boolean;
        allowTransparency?: boolean;
        frameBorder?: number | string;
        height?: number | string;
        loading?: "eager" | "lazy";
        marginHeight?: number;
        marginWidth?: number;
        name?: string;
        referrerPolicy?: string;
        sandbox?: string;
        scrolling?: string;
        seamless?: boolean;
        src?: string;
        srcDoc?: string;
        width?: number | string;
    }

    interface ImgHTMLAttributes<T> extends HTMLAttributes<T> {
        alt?: string;
        crossOrigin?: "anonymous" | "use-credentials" | "";
        decoding?: "async" | "auto" | "sync";
        height?: number | string;
        loading?: "eager" | "lazy";
        referrerPolicy?: "no-referrer" | "origin" | "unsafe-url";
        sizes?: string;
        src?: string;
        srcSet?: string;
        useMap?: string;
        width?: number | string;
    }

    interface InsHTMLAttributes<T> extends HTMLAttributes<T> {
        cite?: string;
        dateTime?: string;
    }

    interface InputHTMLAttributes<T> extends HTMLAttributes<T> {
        accept?: string;
        alt?: string;
        autoComplete?: string;
        autoFocus?: boolean;
        capture?: boolean | string; // https://www.w3.org/TR/html-media-capture/#the-capture-attribute
        checked?: boolean;
        crossOrigin?: string;
        disabled?: boolean;
        form?: string;
        formAction?: string;
        formEncType?: string;
        formMethod?: string;
        formNoValidate?: boolean;
        formTarget?: string;
        height?: number | string;
        list?: string;
        max?: number | string;
        maxLength?: number;
        min?: number | string;
        minLength?: number;
        multiple?: boolean;
        name?: string;
        pattern?: string;
        placeholder?: string;
        readOnly?: boolean;
        required?: boolean;
        size?: number;
        src?: string;
        step?: number | string;
        type?: string;
        value?: string | ReadonlyArray<string> | number;
        width?: number | string;

        onChange?: ChangeEventHandler<T>;
    }

    interface KeygenHTMLAttributes<T> extends HTMLAttributes<T> {
        autoFocus?: boolean;
        challenge?: string;
        disabled?: boolean;
        form?: string;
        keyType?: string;
        keyParams?: string;
        name?: string;
    }

    interface LabelHTMLAttributes<T> extends HTMLAttributes<T> {
        form?: string;
        htmlFor?: string;
    }

    interface LiHTMLAttributes<T> extends HTMLAttributes<T> {
        value?: string | ReadonlyArray<string> | number;
    }

    interface LinkHTMLAttributes<T> extends HTMLAttributes<T> {
        as?: string;
        crossOrigin?: string;
        href?: string;
        hrefLang?: string;
        integrity?: string;
        media?: string;
        rel?: string;
        sizes?: string;
        type?: string;
        charSet?: string;
    }

    interface MapHTMLAttributes<T> extends HTMLAttributes<T> {
        name?: string;
    }

    interface MenuHTMLAttributes<T> extends HTMLAttributes<T> {
        type?: string;
    }

    interface MediaHTMLAttributes<T> extends HTMLAttributes<T> {
        autoPlay?: boolean;
        controls?: boolean;
        controlsList?: string;
        crossOrigin?: string;
        loop?: boolean;
        mediaGroup?: string;
        muted?: boolean;
        playsInline?: boolean;
        preload?: string;
        src?: string;
    }

    interface MetaHTMLAttributes<T> extends HTMLAttributes<T> {
        charSet?: string;
        content?: string;
        httpEquiv?: string;
        name?: string;
    }

    interface MeterHTMLAttributes<T> extends HTMLAttributes<T> {
        form?: string;
        high?: number;
        low?: number;
        max?: number | string;
        min?: number | string;
        optimum?: number;
        value?: string | ReadonlyArray<string> | number;
    }

    interface QuoteHTMLAttributes<T> extends HTMLAttributes<T> {
        cite?: string;
    }

    interface ObjectHTMLAttributes<T> extends HTMLAttributes<T> {
        classID?: string;
        data?: string;
        form?: string;
        height?: number | string;
        name?: string;
        type?: string;
        useMap?: string;
        width?: number | string;
        wmode?: string;
    }

    interface OlHTMLAttributes<T> extends HTMLAttributes<T> {
        reversed?: boolean;
        start?: number;
        type?: '1' | 'a' | 'A' | 'i' | 'I';
    }

    interface OptgroupHTMLAttributes<T> extends HTMLAttributes<T> {
        disabled?: boolean;
        label?: string;
    }

    interface OptionHTMLAttributes<T> extends HTMLAttributes<T> {
        disabled?: boolean;
        label?: string;
        selected?: boolean;
        value?: string | ReadonlyArray<string> | number;
    }

    interface OutputHTMLAttributes<T> extends HTMLAttributes<T> {
        form?: string;
        htmlFor?: string;
        name?: string;
    }

    interface ParamHTMLAttributes<T> extends HTMLAttributes<T> {
        name?: string;
        value?: string | ReadonlyArray<string> | number;
    }

    interface ProgressHTMLAttributes<T> extends HTMLAttributes<T> {
        max?: number | string;
        value?: string | ReadonlyArray<string> | number;
    }

    interface SlotHTMLAttributes<T> extends HTMLAttributes<T> {
        name?: string;
    }

    interface ScriptHTMLAttributes<T> extends HTMLAttributes<T> {
        async?: boolean;
        charSet?: string;
        crossOrigin?: string;
        defer?: boolean;
        integrity?: string;
        noModule?: boolean;
        nonce?: string;
        src?: string;
        type?: string;
    }

    interface SelectHTMLAttributes<T> extends HTMLAttributes<T> {
        autoComplete?: string;
        autoFocus?: boolean;
        disabled?: boolean;
        form?: string;
        multiple?: boolean;
        name?: string;
        required?: boolean;
        size?: number;
        value?: string | ReadonlyArray<string> | number;
        onChange?: ChangeEventHandler<T>;
    }

    interface SourceHTMLAttributes<T> extends HTMLAttributes<T> {
        media?: string;
        sizes?: string;
        src?: string;
        srcSet?: string;
        type?: string;
    }

    interface StyleHTMLAttributes<T> extends HTMLAttributes<T> {
        media?: string;
        nonce?: string;
        scoped?: boolean;
        type?: string;
    }

    interface TableHTMLAttributes<T> extends HTMLAttributes<T> {
        cellPadding?: number | string;
        cellSpacing?: number | string;
        summary?: string;
        width?: number | string;
    }

    interface TextareaHTMLAttributes<T> extends HTMLAttributes<T> {
        autoComplete?: string;
        autoFocus?: boolean;
        cols?: number;
        dirName?: string;
        disabled?: boolean;
        form?: string;
        maxLength?: number;
        minLength?: number;
        name?: string;
        placeholder?: string;
        readOnly?: boolean;
        required?: boolean;
        rows?: number;
        value?: string | ReadonlyArray<string> | number;
        wrap?: string;

        onChange?: ChangeEventHandler<T>;
    }

    interface TdHTMLAttributes<T> extends HTMLAttributes<T> {
        align?: "left" | "center" | "right" | "justify" | "char";
        colSpan?: number;
        headers?: string;
        rowSpan?: number;
        scope?: string;
        abbr?: string;
        height?: number | string;
        width?: number | string;
        valign?: "top" | "middle" | "bottom" | "baseline";
    }

    interface ThHTMLAttributes<T> extends HTMLAttributes<T> {
        align?: "left" | "center" | "right" | "justify" | "char";
        colSpan?: number;
        headers?: string;
        rowSpan?: number;
        scope?: string;
        abbr?: string;
    }

    interface TimeHTMLAttributes<T> extends HTMLAttributes<T> {
        dateTime?: string;
    }

    interface TrackHTMLAttributes<T> extends HTMLAttributes<T> {
        default?: boolean;
        kind?: string;
        label?: string;
        src?: string;
        srcLang?: string;
    }

    interface VideoHTMLAttributes<T> extends MediaHTMLAttributes<T> {
        height?: number | string;
        playsInline?: boolean;
        poster?: string;
        width?: number | string;
        disablePictureInPicture?: boolean;
    }

    // this list is "complete" in that it contains every SVG attribute
    // that React supports, but the types can be improved.
    // Full list here: https://facebook.github.io/react/docs/dom-elements.html
    //
    // The three broad type categories are (in order of restrictiveness):
    //   - "number | string"
    //   - "string"
    //   - union of string literals
    interface SVGAttributes<T> extends AriaAttributes, DOMAttributes<T> {
        // Attributes which also defined in HTMLAttributes
        // See comment in SVGDOMPropertyConfig.js
        className?: string;
        color?: string;
        height?: number | string;
        id?: string;
        lang?: string;
        max?: number | string;
        media?: string;
        method?: string;
        min?: number | string;
        name?: string;
        style?: CSSProperties;
        target?: string;
        type?: string;
        width?: number | string;

        // Other HTML properties supported by SVG elements in browsers
        role?: string;
        tabIndex?: number;
        crossOrigin?: "anonymous" | "use-credentials" | "";

        // SVG Specific attributes
        accentHeight?: number | string;
        accumulate?: "none" | "sum";
        additive?: "replace" | "sum";
        alignmentBaseline?: "auto" | "baseline" | "before-edge" | "text-before-edge" | "middle" | "central" | "after-edge" |
        "text-after-edge" | "ideographic" | "alphabetic" | "hanging" | "mathematical" | "inherit";
        allowReorder?: "no" | "yes";
        alphabetic?: number | string;
        amplitude?: number | string;
        arabicForm?: "initial" | "medial" | "terminal" | "isolated";
        ascent?: number | string;
        attributeName?: string;
        attributeType?: string;
        autoReverse?: Booleanish;
        azimuth?: number | string;
        baseFrequency?: number | string;
        baselineShift?: number | string;
        baseProfile?: number | string;
        bbox?: number | string;
        begin?: number | string;
        bias?: number | string;
        by?: number | string;
        calcMode?: number | string;
        capHeight?: number | string;
        clip?: number | string;
        clipPath?: string;
        clipPathUnits?: number | string;
        clipRule?: number | string;
        colorInterpolation?: number | string;
        colorInterpolationFilters?: "auto" | "sRGB" | "linearRGB" | "inherit";
        colorProfile?: number | string;
        colorRendering?: number | string;
        contentScriptType?: number | string;
        contentStyleType?: number | string;
        cursor?: number | string;
        cx?: number | string;
        cy?: number | string;
        d?: string;
        decelerate?: number | string;
        descent?: number | string;
        diffuseConstant?: number | string;
        direction?: number | string;
        display?: number | string;
        divisor?: number | string;
        dominantBaseline?: number | string;
        dur?: number | string;
        dx?: number | string;
        dy?: number | string;
        edgeMode?: number | string;
        elevation?: number | string;
        enableBackground?: number | string;
        end?: number | string;
        exponent?: number | string;
        externalResourcesRequired?: Booleanish;
        fill?: string;
        fillOpacity?: number | string;
        fillRule?: "nonzero" | "evenodd" | "inherit";
        filter?: string;
        filterRes?: number | string;
        filterUnits?: number | string;
        floodColor?: number | string;
        floodOpacity?: number | string;
        focusable?: Booleanish | "auto";
        fontFamily?: string;
        fontSize?: number | string;
        fontSizeAdjust?: number | string;
        fontStretch?: number | string;
        fontStyle?: number | string;
        fontVariant?: number | string;
        fontWeight?: number | string;
        format?: number | string;
        from?: number | string;
        fx?: number | string;
        fy?: number | string;
        g1?: number | string;
        g2?: number | string;
        glyphName?: number | string;
        glyphOrientationHorizontal?: number | string;
        glyphOrientationVertical?: number | string;
        glyphRef?: number | string;
        gradientTransform?: string;
        gradientUnits?: string;
        hanging?: number | string;
        horizAdvX?: number | string;
        horizOriginX?: number | string;
        href?: string;
        ideographic?: number | string;
        imageRendering?: number | string;
        in2?: number | string;
        in?: string;
        intercept?: number | string;
        k1?: number | string;
        k2?: number | string;
        k3?: number | string;
        k4?: number | string;
        k?: number | string;
        kernelMatrix?: number | string;
        kernelUnitLength?: number | string;
        kerning?: number | string;
        keyPoints?: number | string;
        keySplines?: number | string;
        keyTimes?: number | string;
        lengthAdjust?: number | string;
        letterSpacing?: number | string;
        lightingColor?: number | string;
        limitingConeAngle?: number | string;
        local?: number | string;
        markerEnd?: string;
        markerHeight?: number | string;
        markerMid?: string;
        markerStart?: string;
        markerUnits?: number | string;
        markerWidth?: number | string;
        mask?: string;
        maskContentUnits?: number | string;
        maskUnits?: number | string;
        mathematical?: number | string;
        mode?: number | string;
        numOctaves?: number | string;
        offset?: number | string;
        opacity?: number | string;
        operator?: number | string;
        order?: number | string;
        orient?: number | string;
        orientation?: number | string;
        origin?: number | string;
        overflow?: number | string;
        overlinePosition?: number | string;
        overlineThickness?: number | string;
        paintOrder?: number | string;
        panose1?: number | string;
        path?: string;
        pathLength?: number | string;
        patternContentUnits?: string;
        patternTransform?: number | string;
        patternUnits?: string;
        pointerEvents?: number | string;
        points?: string;
        pointsAtX?: number | string;
        pointsAtY?: number | string;
        pointsAtZ?: number | string;
        preserveAlpha?: Booleanish;
        preserveAspectRatio?: string;
        primitiveUnits?: number | string;
        r?: number | string;
        radius?: number | string;
        refX?: number | string;
        refY?: number | string;
        renderingIntent?: number | string;
        repeatCount?: number | string;
        repeatDur?: number | string;
        requiredExtensions?: number | string;
        requiredFeatures?: number | string;
        restart?: number | string;
        result?: string;
        rotate?: number | string;
        rx?: number | string;
        ry?: number | string;
        scale?: number | string;
        seed?: number | string;
        shapeRendering?: number | string;
        slope?: number | string;
        spacing?: number | string;
        specularConstant?: number | string;
        specularExponent?: number | string;
        speed?: number | string;
        spreadMethod?: string;
        startOffset?: number | string;
        stdDeviation?: number | string;
        stemh?: number | string;
        stemv?: number | string;
        stitchTiles?: number | string;
        stopColor?: string;
        stopOpacity?: number | string;
        strikethroughPosition?: number | string;
        strikethroughThickness?: number | string;
        string?: number | string;
        stroke?: string;
        strokeDasharray?: string | number;
        strokeDashoffset?: string | number;
        strokeLinecap?: "butt" | "round" | "square" | "inherit";
        strokeLinejoin?: "miter" | "round" | "bevel" | "inherit";
        strokeMiterlimit?: number | string;
        strokeOpacity?: number | string;
        strokeWidth?: number | string;
        surfaceScale?: number | string;
        systemLanguage?: number | string;
        tableValues?: number | string;
        targetX?: number | string;
        targetY?: number | string;
        textAnchor?: string;
        textDecoration?: number | string;
        textLength?: number | string;
        textRendering?: number | string;
        to?: number | string;
        transform?: string;
        u1?: number | string;
        u2?: number | string;
        underlinePosition?: number | string;
        underlineThickness?: number | string;
        unicode?: number | string;
        unicodeBidi?: number | string;
        unicodeRange?: number | string;
        unitsPerEm?: number | string;
        vAlphabetic?: number | string;
        values?: string;
        vectorEffect?: number | string;
        version?: string;
        vertAdvY?: number | string;
        vertOriginX?: number | string;
        vertOriginY?: number | string;
        vHanging?: number | string;
        vIdeographic?: number | string;
        viewBox?: string;
        viewTarget?: number | string;
        visibility?: number | string;
        vMathematical?: number | string;
        widths?: number | string;
        wordSpacing?: number | string;
        writingMode?: number | string;
        x1?: number | string;
        x2?: number | string;
        x?: number | string;
        xChannelSelector?: string;
        xHeight?: number | string;
        xlinkActuate?: string;
        xlinkArcrole?: string;
        xlinkHref?: string;
        xlinkRole?: string;
        xlinkShow?: string;
        xlinkTitle?: string;
        xlinkType?: string;
        xmlBase?: string;
        xmlLang?: string;
        xmlns?: string;
        xmlnsXlink?: string;
        xmlSpace?: string;
        y1?: number | string;
        y2?: number | string;
        y?: number | string;
        yChannelSelector?: string;
        z?: number | string;
        zoomAndPan?: string;
    }

    interface WebViewHTMLAttributes<T> extends HTMLAttributes<T> {
        allowFullScreen?: boolean;
        allowpopups?: boolean;
        autoFocus?: boolean;
        autosize?: boolean;
        blinkfeatures?: string;
        disableblinkfeatures?: string;
        disableguestresize?: boolean;
        disablewebsecurity?: boolean;
        guestinstance?: string;
        httpreferrer?: string;
        nodeintegration?: boolean;
        partition?: string;
        plugins?: boolean;
        preload?: string;
        src?: string;
        useragent?: string;
        webpreferences?: string;
    }

    //
    // React.DOM
    // ----------------------------------------------------------------------

    interface ReactHTML {
        a: DetailedHTMLFactory<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>;
        abbr: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        address: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        area: DetailedHTMLFactory<AreaHTMLAttributes<HTMLAreaElement>, HTMLAreaElement>;
        article: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        aside: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        audio: DetailedHTMLFactory<AudioHTMLAttributes<HTMLAudioElement>, HTMLAudioElement>;
        b: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        base: DetailedHTMLFactory<BaseHTMLAttributes<HTMLBaseElement>, HTMLBaseElement>;
        bdi: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        bdo: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        big: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        blockquote: DetailedHTMLFactory<BlockquoteHTMLAttributes<HTMLElement>, HTMLElement>;
        body: DetailedHTMLFactory<HTMLAttributes<HTMLBodyElement>, HTMLBodyElement>;
        br: DetailedHTMLFactory<HTMLAttributes<HTMLBRElement>, HTMLBRElement>;
        button: DetailedHTMLFactory<ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
        canvas: DetailedHTMLFactory<CanvasHTMLAttributes<HTMLCanvasElement>, HTMLCanvasElement>;
        caption: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        cite: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        code: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        col: DetailedHTMLFactory<ColHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
        colgroup: DetailedHTMLFactory<ColgroupHTMLAttributes<HTMLTableColElement>, HTMLTableColElement>;
        data: DetailedHTMLFactory<DataHTMLAttributes<HTMLDataElement>, HTMLDataElement>;
        datalist: DetailedHTMLFactory<HTMLAttributes<HTMLDataListElement>, HTMLDataListElement>;
        dd: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        del: DetailedHTMLFactory<DelHTMLAttributes<HTMLElement>, HTMLElement>;
        details: DetailedHTMLFactory<DetailsHTMLAttributes<HTMLElement>, HTMLElement>;
        dfn: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        dialog: DetailedHTMLFactory<DialogHTMLAttributes<HTMLDialogElement>, HTMLDialogElement>;
        div: DetailedHTMLFactory<HTMLAttributes<HTMLDivElement>, HTMLDivElement>;
        dl: DetailedHTMLFactory<HTMLAttributes<HTMLDListElement>, HTMLDListElement>;
        dt: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        em: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        embed: DetailedHTMLFactory<EmbedHTMLAttributes<HTMLEmbedElement>, HTMLEmbedElement>;
        fieldset: DetailedHTMLFactory<FieldsetHTMLAttributes<HTMLFieldSetElement>, HTMLFieldSetElement>;
        figcaption: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        figure: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        footer: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        form: DetailedHTMLFactory<FormHTMLAttributes<HTMLFormElement>, HTMLFormElement>;
        h1: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
        h2: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
        h3: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
        h4: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
        h5: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
        h6: DetailedHTMLFactory<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>;
        head: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLHeadElement>;
        header: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        hgroup: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        hr: DetailedHTMLFactory<HTMLAttributes<HTMLHRElement>, HTMLHRElement>;
        html: DetailedHTMLFactory<HtmlHTMLAttributes<HTMLHtmlElement>, HTMLHtmlElement>;
        i: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        iframe: DetailedHTMLFactory<IframeHTMLAttributes<HTMLIFrameElement>, HTMLIFrameElement>;
        img: DetailedHTMLFactory<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
        input: DetailedHTMLFactory<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;
        ins: DetailedHTMLFactory<InsHTMLAttributes<HTMLModElement>, HTMLModElement>;
        kbd: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        keygen: DetailedHTMLFactory<KeygenHTMLAttributes<HTMLElement>, HTMLElement>;
        label: DetailedHTMLFactory<LabelHTMLAttributes<HTMLLabelElement>, HTMLLabelElement>;
        legend: DetailedHTMLFactory<HTMLAttributes<HTMLLegendElement>, HTMLLegendElement>;
        li: DetailedHTMLFactory<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>;
        link: DetailedHTMLFactory<LinkHTMLAttributes<HTMLLinkElement>, HTMLLinkElement>;
        main: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        map: DetailedHTMLFactory<MapHTMLAttributes<HTMLMapElement>, HTMLMapElement>;
        mark: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        menu: DetailedHTMLFactory<MenuHTMLAttributes<HTMLElement>, HTMLElement>;
        menuitem: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        meta: DetailedHTMLFactory<MetaHTMLAttributes<HTMLMetaElement>, HTMLMetaElement>;
        meter: DetailedHTMLFactory<MeterHTMLAttributes<HTMLElement>, HTMLElement>;
        nav: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        noscript: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        object: DetailedHTMLFactory<ObjectHTMLAttributes<HTMLObjectElement>, HTMLObjectElement>;
        ol: DetailedHTMLFactory<OlHTMLAttributes<HTMLOListElement>, HTMLOListElement>;
        optgroup: DetailedHTMLFactory<OptgroupHTMLAttributes<HTMLOptGroupElement>, HTMLOptGroupElement>;
        option: DetailedHTMLFactory<OptionHTMLAttributes<HTMLOptionElement>, HTMLOptionElement>;
        output: DetailedHTMLFactory<OutputHTMLAttributes<HTMLElement>, HTMLElement>;
        p: DetailedHTMLFactory<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>;
        param: DetailedHTMLFactory<ParamHTMLAttributes<HTMLParamElement>, HTMLParamElement>;
        picture: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        pre: DetailedHTMLFactory<HTMLAttributes<HTMLPreElement>, HTMLPreElement>;
        progress: DetailedHTMLFactory<ProgressHTMLAttributes<HTMLProgressElement>, HTMLProgressElement>;
        q: DetailedHTMLFactory<QuoteHTMLAttributes<HTMLQuoteElement>, HTMLQuoteElement>;
        rp: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        rt: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        ruby: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        s: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        samp: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        slot: DetailedHTMLFactory<SlotHTMLAttributes<HTMLSlotElement>, HTMLSlotElement>;
        script: DetailedHTMLFactory<ScriptHTMLAttributes<HTMLScriptElement>, HTMLScriptElement>;
        section: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        select: DetailedHTMLFactory<SelectHTMLAttributes<HTMLSelectElement>, HTMLSelectElement>;
        small: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        source: DetailedHTMLFactory<SourceHTMLAttributes<HTMLSourceElement>, HTMLSourceElement>;
        span: DetailedHTMLFactory<HTMLAttributes<HTMLSpanElement>, HTMLSpanElement>;
        strong: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        style: DetailedHTMLFactory<StyleHTMLAttributes<HTMLStyleElement>, HTMLStyleElement>;
        sub: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        summary: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        sup: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        table: DetailedHTMLFactory<TableHTMLAttributes<HTMLTableElement>, HTMLTableElement>;
        template: DetailedHTMLFactory<HTMLAttributes<HTMLTemplateElement>, HTMLTemplateElement>;
        tbody: DetailedHTMLFactory<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
        td: DetailedHTMLFactory<TdHTMLAttributes<HTMLTableDataCellElement>, HTMLTableDataCellElement>;
        textarea: DetailedHTMLFactory<TextareaHTMLAttributes<HTMLTextAreaElement>, HTMLTextAreaElement>;
        tfoot: DetailedHTMLFactory<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
        th: DetailedHTMLFactory<ThHTMLAttributes<HTMLTableHeaderCellElement>, HTMLTableHeaderCellElement>;
        thead: DetailedHTMLFactory<HTMLAttributes<HTMLTableSectionElement>, HTMLTableSectionElement>;
        time: DetailedHTMLFactory<TimeHTMLAttributes<HTMLElement>, HTMLElement>;
        title: DetailedHTMLFactory<HTMLAttributes<HTMLTitleElement>, HTMLTitleElement>;
        tr: DetailedHTMLFactory<HTMLAttributes<HTMLTableRowElement>, HTMLTableRowElement>;
        track: DetailedHTMLFactory<TrackHTMLAttributes<HTMLTrackElement>, HTMLTrackElement>;
        u: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        ul: DetailedHTMLFactory<HTMLAttributes<HTMLUListElement>, HTMLUListElement>;
        "var": DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        video: DetailedHTMLFactory<VideoHTMLAttributes<HTMLVideoElement>, HTMLVideoElement>;
        wbr: DetailedHTMLFactory<HTMLAttributes<HTMLElement>, HTMLElement>;
        webview: DetailedHTMLFactory<WebViewHTMLAttributes<HTMLWebViewElement>, HTMLWebViewElement>;
    }

    interface ReactSVG {
        animate: SVGFactory;
        circle: SVGFactory;
        clipPath: SVGFactory;
        defs: SVGFactory;
        desc: SVGFactory;
        ellipse: SVGFactory;
        feBlend: SVGFactory;
        feColorMatrix: SVGFactory;
        feComponentTransfer: SVGFactory;
        feComposite: SVGFactory;
        feConvolveMatrix: SVGFactory;
        feDiffuseLighting: SVGFactory;
        feDisplacementMap: SVGFactory;
        feDistantLight: SVGFactory;
        feDropShadow: SVGFactory;
        feFlood: SVGFactory;
        feFuncA: SVGFactory;
        feFuncB: SVGFactory;
        feFuncG: SVGFactory;
        feFuncR: SVGFactory;
        feGaussianBlur: SVGFactory;
        feImage: SVGFactory;
        feMerge: SVGFactory;
        feMergeNode: SVGFactory;
        feMorphology: SVGFactory;
        feOffset: SVGFactory;
        fePointLight: SVGFactory;
        feSpecularLighting: SVGFactory;
        feSpotLight: SVGFactory;
        feTile: SVGFactory;
        feTurbulence: SVGFactory;
        filter: SVGFactory;
        foreignObject: SVGFactory;
        g: SVGFactory;
        image: SVGFactory;
        line: SVGFactory;
        linearGradient: SVGFactory;
        marker: SVGFactory;
        mask: SVGFactory;
        metadata: SVGFactory;
        path: SVGFactory;
        pattern: SVGFactory;
        polygon: SVGFactory;
        polyline: SVGFactory;
        radialGradient: SVGFactory;
        rect: SVGFactory;
        stop: SVGFactory;
        svg: SVGFactory;
        switch: SVGFactory;
        symbol: SVGFactory;
        text: SVGFactory;
        textPath: SVGFactory;
        tspan: SVGFactory;
        use: SVGFactory;
        view: SVGFactory;
    }

    interface ReactDOM extends ReactHTML, ReactSVG { }

    //
    // React.PropTypes
    // ----------------------------------------------------------------------

    type Validator<T> = PropTypes.Validator<T>;

    type Requireable<T> = PropTypes.Requireable<T>;

    type ValidationMap<T> = PropTypes.ValidationMap<T>;

    type WeakValidationMap<T> = {
        [K in keyof T]?: null extends T[K]
            ? Validator<T[K] | null | undefined>
            : undefined extends T[K]
            ? Validator<T[K] | null | undefined>
            : Validator<T[K]>
    };

    interface ReactPropTypes {
        any: typeof PropTypes.any;
        array: typeof PropTypes.array;
        bool: typeof PropTypes.bool;
        func: typeof PropTypes.func;
        number: typeof PropTypes.number;
        object: typeof PropTypes.object;
        string: typeof PropTypes.string;
        node: typeof PropTypes.node;
        element: typeof PropTypes.element;
        instanceOf: typeof PropTypes.instanceOf;
        oneOf: typeof PropTypes.oneOf;
        oneOfType: typeof PropTypes.oneOfType;
        arrayOf: typeof PropTypes.arrayOf;
        objectOf: typeof PropTypes.objectOf;
        shape: typeof PropTypes.shape;
        exact: typeof PropTypes.exact;
    }

    //
    // React.Children
    // ----------------------------------------------------------------------

    interface ReactChildren {
        map<T, C>(children: C | C[], fn: (child: C, index: number) => T):
            C extends null | undefined ? C : Array<Exclude<T, boolean | null | undefined>>;
        forEach<C>(children: C | C[], fn: (child: C, index: number) => void): void;
        count(children: any): number;
        only<C>(children: C): C extends any[] ? never : C;
        toArray(children: ReactNode | ReactNode[]): Array<Exclude<ReactNode, boolean | null | undefined>>;
    }

    //
    // Browser Interfaces
    // https://github.com/nikeee/2048-typescript/blob/master/2048/js/touch.d.ts
    // ----------------------------------------------------------------------

    interface AbstractView {
        styleMedia: StyleMedia;
        document: Document;
    }

    interface Touch {
        identifier: number;
        target: EventTarget;
        screenX: number;
        screenY: number;
        clientX: number;
        clientY: number;
        pageX: number;
        pageY: number;
    }

    interface TouchList {
        [index: number]: Touch;
        length: number;
        item(index: number): Touch;
        identifiedTouch(identifier: number): Touch;
    }

    //
    // Error Interfaces
    // ----------------------------------------------------------------------
    interface ErrorInfo {
        /**
         * Captures which component contained the exception, and its ancestors.
         */
        componentStack: string;
    }
}

/**
 * @public
 */
export declare interface RelayoutInfo {
    delta: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

declare type RenderComponent<P = {}> = (Component: string | React.ComponentType<P>, props: MotionProps, visualElement: VisualElement) => any;

export declare interface Repeat {
    /**
     * The number of times to repeat the transition. Set to `Infinity` for perpetual repeating.
     *
     * Without setting `repeatType`, this will loop the animation.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   repeat: Infinity,
     *   duration: 2
     * }
     *
     * <Frame
     *   animate={{ rotate: 180 }}
     *   transition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   animate={{ rotate: 180 }}
     *   transition={{ repeat: Infinity, duration: 2 }}
     * />
     * ```
     *
     * @public
     */
    repeat?: number;
    /**
     * How to repeat the animation. This can be either:
     *
     * "loop": Repeats the animation from the start
     *
     * "reverse": Alternates between forward and backwards playback
     *
     * "mirror": Switchs `from` and `to` alternately
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   repeat: 1,
     *   repeatType: "reverse",
     *   duration: 2
     * }
     *
     * <Frame
     *   animate={{ rotate: 180 }}
     *   transition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   animate={{ rotate: 180 }}
     *   transition={{
     *     repeat: 1,
     *     repeatType: "reverse",
     *     duration: 2
     *   }}
     * />
     * ```
     *
     * @public
     */
    repeatType?: "loop" | "reverse" | "mirror";
    /**
     * When repeating an animation, `repeatDelay` will set the
     * duration of the time to wait, in seconds, between each repetition.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   repeat: Infinity,
     *   repeatDelay: 1
     * }
     *
     * <Frame
     *   animate={{ rotate: 180 }}
     *   transition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   animate={{ rotate: 180 }}
     *   transition={{ repeat: Infinity, repeatDelay: 1 }}
     * />
     * ```
     *
     * @public
     */
    repeatDelay?: number;
}

/**
 * @public
 */
export declare type ResolvedKeyframesTarget = [null, ...number[]] | number[] | [null, ...string[]] | string[];

/**
 * @public
 */
export declare type ResolvedSingleTarget = string | number;

/**
 * A generic set of string/number values
 */
declare interface ResolvedValues {
    [key: string]: string | number;
}

/**
 * @public
 */
export declare type ResolvedValueTarget = ResolvedSingleTarget | ResolvedKeyframesTarget;

/**
 * @public
 */
export declare type ResolveLayoutTransition = (info: RelayoutInfo) => Transition | boolean;

/**
 * If the provided value is a MotionValue, this returns the actual value, otherwise just the value itself
 *
 * TODO: Remove and move to library
 *
 * @internal
 */
export declare function resolveMotionValue(value?: string | number | CustomValueType | MotionValue): string | number;

declare type SafeToRemove = () => void;

declare type ScaleCorrection = (latest: string | number, viewportBox: AxisBox2D, delta: BoxDelta, treeScale: Point2D) => string | number;

declare interface ScaleCorrectionDefinition {
    process: ScaleCorrection;
    applyTo?: string[];
}

declare type ScaleCorrectionDefinitionMap = {
    [key: string]: ScaleCorrectionDefinition;
};

declare interface ScaleMotionValues {
    scaleX: MotionValue<number>;
    scaleY: MotionValue<number>;
}

/**
 * defined in scheduler/tracing
 */
declare interface SchedulerInteraction {
    id: number;
    name: string;
    timestamp: number;
}

/**
 * @public
 */
export declare interface ScrollMotionValues {
    scrollX: MotionValue<number>;
    scrollY: MotionValue<number>;
    scrollXProgress: MotionValue<number>;
    scrollYProgress: MotionValue<number>;
}

export declare interface SharedLayoutAnimationConfig {
    visibilityAction?: VisibilityAction;
    originBox?: AxisBox2D;
    targetBox?: AxisBox2D;
    transition?: Transition;
    crossfadeOpacity?: MotionValue<number>;
    shouldStackAnimate?: boolean;
}

export declare const SharedLayoutContext: import("react").Context<SyncLayoutBatcher | SharedLayoutSyncMethods>;

export declare interface SharedLayoutProps {
    /**
     * @public
     */
    children: React_2.ReactNode;
    /**
     * When combined with `AnimatePresence`, `SharedLayoutProps` can customise how to visually switch
     * between `layoutId` components as new ones enter and leave the tree.
     *
     * - "switch" (default): The old `layoutId` component will be hidden instantly when a new one enters, and
     * the new one will perform the full transition. When the newest one is removed, it will perform
     * the full exit transition and then the old component will be shown instantly.
     * - "crossfade": The root shared components will crossfade as `layoutId` children of both perform
     * the same transition.
     *
     * @public
     */
    type?: "switch" | "crossfade";
}

/**
 * Extra API methods available to children if they're a descendant of AnimateSharedLayout
 */
export declare interface SharedLayoutSyncMethods extends SyncLayoutBatcher {
    syncUpdate: (force?: boolean) => void;
    forceUpdate: () => void;
    register: (child: HTMLVisualElement) => void;
    remove: (child: HTMLVisualElement) => void;
}

/**
 * @public
 */
export declare type SingleTarget = ResolvedSingleTarget | CustomValueType;

declare type SingleTransformer<I, O> = (input: I) => O;

declare interface Snapshot {
    isDragging?: boolean;
    cursorProgress?: Point2D;
    latestMotionValues: ResolvedValues;
    boundingBox?: AxisBox2D;
}

/**
 * An animation that simulates spring physics for realistic motion.
 * This is the default animation for physical values like `x`, `y`, `scale` and `rotate`.
 *
 * @public
 */
export declare interface Spring extends Repeat {
    /**
     * Set `type` to `"spring"` to animate using spring physics for natural
     * movement. Type is set to `"spring"` by default.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   type: "spring"
     * }
     *
     * <Frame
     *   animate={{ rotate: 180 }}
     *   transition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   animate={{ rotate: 180 }}
     *   transition={{ type: 'spring' }}
     * />
     * ```
     *
     * @public
     */
    type: "spring";
    /**
     * Stiffness of the spring. Higher values will create more sudden movement.
     * Set to `100` by default.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   type: "spring",
     *   stiffness: 50
     * }
     *
     * <Frame
     *   animate={{ rotate: 180 }}
     *   transition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.section
     *   animate={{ rotate: 180 }}
     *   transition={{ type: 'spring', stiffness: 50 }}
     * />
     * ```
     *
     * @public
     */
    stiffness?: number;
    /**
     * Strength of opposing force. If set to 0, spring will oscillate
     * indefinitely. Set to `10` by default.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   type: "spring",
     *   damping: 300
     * }
     *
     * <Frame
     *   animate={{ rotate: 180 }}
     *   transition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.a
     *   animate={{ rotate: 180 }}
     *   transition={{ type: 'spring', damping: 300 }}
     * />
     * ```
     *
     * @public
     */
    damping?: number;
    /**
     * Mass of the moving object. Higher values will result in more lethargic
     * movement. Set to `1` by default.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   type: "spring",
     *   mass: 0.5
     * }
     *
     * <Frame
     *   animate={{ rotate: 180 }}
     *   transition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.feTurbulence
     *   animate={{ baseFrequency: 0.5 } as any}
     *   transition={{ type: "spring", mass: 0.5 }}
     * />
     * ```
     *
     * @public
     */
    mass?: number;
    /**
     * The duration of the animation, defined in seconds. Spring animations can be a maximum of 10 seconds.
     *
     * If `bounce` is set, this defaults to `0.8`.
     *
     * Note: `duration` and `bounce` will be overridden if `stiffness`, `damping` or `mass` are set.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   type: "spring",
     *   duration: 0.8
     * }
     *
     * <Frame
     *   animate={{ rotate: 180 }}
     *   transition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   animate={{ x: 100 }}
     *   transition={{ type: "spring", duration: 0.8 }}
     * />
     * ```
     *
     * @public
     */
    duration?: number;
    /**
     * `bounce` determines the "bounciness" of a spring animation.
     *
     * `0` is no bounce, and `1` is extremely bouncy.
     *
     * If `duration` is set, this defaults to `0.25`.
     *
     * Note: `bounce` and `duration` will be overridden if `stiffness`, `damping` or `mass` are set.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   type: "spring",
     *   bounce: 0.25
     * }
     *
     * <Frame
     *   animate={{ rotate: 180 }}
     *   transition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   animate={{ x: 100 }}
     *   transition={{ type: "spring", bounce: 0.25 }}
     * />
     * ```
     *
     * @public
     */
    bounce?: number;
    /**
     * End animation if absolute speed (in units per second) drops below this
     * value and delta is smaller than `restDelta`. Set to `0.01` by default.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   type: "spring",
     *   restSpeed: 0.5
     * }
     *
     * <Frame
     *   animate={{ rotate: 180 }}
     *   transition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   animate={{ rotate: 180 }}
     *   transition={{ type: 'spring', restSpeed: 0.5 }}
     * />
     * ```
     *
     * @public
     */
    restSpeed?: number;
    /**
     * End animation if distance is below this value and speed is below
     * `restSpeed`. When animation ends, spring gets “snapped” to. Set to
     * `0.01` by default.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   type: "spring",
     *   restDelta: 0.5
     * }
     *
     * <Frame
     *   animate={{ rotate: 180 }}
     *   transition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   animate={{ rotate: 180 }}
     *   transition={{ type: 'spring', restDelta: 0.5 }}
     * />
     * ```
     *
     * @public
     */
    restDelta?: number;
    /**
     * The value to animate from.
     * By default, this is the initial state of the animating value.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   type: "spring",
     *   from: 90
     * }
     *
     * <Frame
     *   animate={{ rotate: 180 }}
     *   transition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   animate={{ rotate: 180 }}
     *   transition={{ type: 'spring', from: 90 }}
     * />
     * ```
     *
     * @public
     */
    from?: number | string;
    /**
     * @internal
     */
    to?: number | string | ValueTarget;
    /**
     * The initial velocity of the spring. By default this is the current velocity of the component.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   type: "spring",
     *   velocity: 2
     * }
     *
     * <Frame
     *   animate={{ rotate: 180 }}
     *   transition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   animate={{ rotate: 180 }}
     *   transition={{ type: 'spring', velocity: 2 }}
     * />
     * ```
     *
     * @public
     */
    velocity?: number;
    /**
     * @internal
     */
    delay?: number;
}

declare type StartAnimation = (complete: () => void) => () => void;

/**
 * Start animation on a MotionValue. This function is an interface between
 * Framer Motion and Popmotion
 *
 * @internal
 */
declare function startAnimation(key: string, value: MotionValue, target: ResolvedValueTarget, transition?: Transition): Promise<void>;

/**
 * @public
 */
export declare type Subscriber<T> = (v: T) => void;

/**
 * A generic subscription manager.
 */
declare class SubscriptionManager<Handler extends GenericHandler> {
    private subscriptions;
    add(handler: Handler): () => undefined;
    notify(
    /**
     * Using ...args would be preferable but it's array creation and this
     * might be fired every frame.
     */
    a?: Parameters<Handler>[0], b?: Parameters<Handler>[1], c?: Parameters<Handler>[2]): void;
    clear(): void;
}

/**
 * Blanket-accept any SVG attribute as a `MotionValue`
 * @public
 */
export declare type SVGAttributesAsMotionValues<T> = MakeMotion<SVGAttributesWithoutMotionProps<T>>;

declare interface SVGAttributesWithoutMotionProps<T> extends Pick<SVGAttributes<T>, Exclude<keyof SVGAttributes<T>, keyof MotionProps>> {
}

declare type SVGElements = UnionStringArray<typeof svgElements>;

/**
 * @internal
 */
declare const svgElements: readonly ["animate", "circle", "clipPath", "defs", "desc", "ellipse", "feBlend", "feColorMatrix", "feComponentTransfer", "feComposite", "feConvolveMatrix", "feDiffuseLighting", "feDisplacementMap", "feDistantLight", "feDropShadow", "feFlood", "feFuncA", "feFuncB", "feFuncG", "feFuncR", "feGaussianBlur", "feImage", "feMerge", "feMergeNode", "feMorphology", "feOffset", "fePointLight", "feSpecularLighting", "feSpotLight", "feTile", "feTurbulence", "filter", "foreignObject", "g", "image", "line", "linearGradient", "marker", "mask", "metadata", "path", "pattern", "polygon", "polyline", "radialGradient", "rect", "stop", "svg", "switch", "symbol", "text", "textPath", "tspan", "use", "view"];

/**
 * Motion-optimised versions of React's SVG components.
 *
 * @public
 */
declare type SVGMotionComponents = {
    [K in SVGElements]: ForwardRefComponent<UnwrapSVGFactoryElement<JSX.IntrinsicElements[K]>, SVGMotionProps<UnwrapSVGFactoryElement<JSX.IntrinsicElements[K]>>>;
};

/**
 * @public
 */
export declare interface SVGMotionProps<T> extends SVGAttributesAsMotionValues<T>, MotionProps {
}

/**
 * @public
 */
declare interface SVGPathProperties {
    pathLength?: number;
    pathOffset?: number;
    pathSpacing?: number;
}

/**
 * The exposed API for children to add themselves to the batcher and to flush it.
 */
declare interface SyncLayoutBatcher {
    add: (child: HTMLVisualElement) => void;
    flush: (handler?: SyncLayoutLifecycles) => void;
}

/**
 * Handlers for batching sync layout lifecycles. We batches these processes to cut
 * down on layout thrashing
 */
export declare interface SyncLayoutLifecycles {
    measureLayout: (child: HTMLVisualElement) => void;
    layoutReady: (child: HTMLVisualElement) => void;
    parent?: HTMLVisualElement;
}

/**
 * @public
 */
export declare interface TapHandlers {
    /**
     * Callback when the tap gesture successfully ends on this element.
     *
     * @library
     *
     * ```jsx
     * function onTap(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame onTap={onTap} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onTap(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onTap={onTap} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - An {@link TapInfo} object containing `x` and `y` values for the `point` relative to the device or page.
     */
    onTap?(event: MouseEvent | TouchEvent | PointerEvent, info: TapInfo): void;
    /**
     * Callback when the tap gesture starts on this element.
     *
     * @library
     *
     * ```jsx
     * function onTapStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame onTapStart={onTapStart} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onTapStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onTapStart={onTapStart} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - An {@link TapInfo} object containing `x` and `y` values for the `point` relative to the device or page.
     */
    onTapStart?(event: MouseEvent | TouchEvent | PointerEvent, info: TapInfo): void;
    /**
     * Callback when the tap gesture ends outside this element.
     *
     * @library
     *
     * ```jsx
     * function onTapCancel(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame onTapCancel={onTapCancel} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onTapCancel(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onTapCancel={onTapCancel} />
     * ```
     *
     * @param event - The originating pointer event.
     * @param info - An {@link TapInfo} object containing `x` and `y` values for the `point` relative to the device or page.
     */
    onTapCancel?(event: MouseEvent | TouchEvent | PointerEvent, info: TapInfo): void;
    /**
     * Properties or variant label to animate to while the component is pressed.
     *
     * @library
     *
     * ```jsx
     * <Frame whileTap={{ scale: 0.8 }} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div whileTap={{ scale: 0.8 }} />
     * ```
     */
    whileTap?: VariantLabels | TargetAndTransition;
}

/**
 * Passed in to tap event handlers like `onTap` the `TapInfo` object contains
 * information about the tap gesture such as it‘s location.
 *
 * @library
 *
 * ```jsx
 * function onTap(event, info) {
 *   console.log(info.point.x, info.point.y)
 * }
 *
 * <Frame onTap={onTap} />
 * ```
 *
 * @motion
 *
 * ```jsx
 * function onTap(event, info) {
 *   console.log(info.point.x, info.point.y)
 * }
 *
 * <motion.div onTap={onTap} />
 * ```
 *
 * @public
 */
export declare interface TapInfo {
    /**
     * Contains `x` and `y` values for the tap gesture relative to the
     * device or page.
     *
     * @library
     *
     * ```jsx
     * function onTapStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <Frame onTapStart={onTapStart} />
     * ```
     *
     * @motion
     *
     * ```jsx
     * function onTapStart(event, info) {
     *   console.log(info.point.x, info.point.y)
     * }
     *
     * <motion.div onTapStart={onTapStart} />
     * ```
     *
     * @public
     */
    point: Point2D;
}

export declare type Target = MakeCustomValueType<TargetProperties>;

/**
 * An object that specifies values to animate to. Each value may be set either as
 * a single value, or an array of values.
 *
 * It may also option contain these properties:
 *
 * - `transition`: Specifies transitions for all or individual values.
 * - `transitionEnd`: Specifies values to set when the animation finishes.
 *
 * ```jsx
 * const target = {
 *   x: "0%",
 *   opacity: 0,
 *   transition: { duration: 1 },
 *   transitionEnd: { display: "none" }
 * }
 * ```
 *
 * @public
 */
export declare type TargetAndTransition = TargetWithKeyframes & {
    transition?: Transition;
    transitionEnd?: Target;
};

declare type TargetProperties = CSSPropertiesWithoutTransitionOrSingleTransforms & SVGAttributes<SVGElement> & TransformProperties & CustomStyles;

declare type TargetResolver = (custom: any, current: Target, velocity: Target) => TargetAndTransition;

declare type TargetWithKeyframes = MakeKeyframes<Target>;

/**
 * Transforms numbers into other values by mapping them from an input range to an output range.
 * Returns the type of the input provided.
 *
 * @remarks
 *
 * Given an input range of `[0, 200]` and an output range of
 * `[0, 1]`, this function will return a value between `0` and `1`.
 * The input range must be a linear series of numbers. The output range
 * can be any supported value type, such as numbers, colors, shadows, arrays, objects and more.
 * Every value in the output range must be of the same type and in the same format.
 *
 * @library
 *
 * ```jsx
 * import * as React from "react"
 * import { Frame, transform } from "framer"
 *
 * export function MyComponent() {
 *    const inputRange = [0, 200]
 *    const outputRange = [0, 1]
 *    const output = transform(100, inputRange, outputRange)
 *
 *    // Returns 0.5
 *    return <Frame>{output}</Frame>
 * }
 * ```
 *
 * @motion
 *
 * ```jsx
 * import * as React from "react"
 * import { transform } from "framer-motion"
 *
 * export function MyComponent() {
 *    const inputRange = [0, 200]
 *    const outputRange = [0, 1]
 *    const output = transform(100, inputRange, outputRange)
 *
 *    // Returns 0.5
 *    return <div>{output}</div>
 * }
 * ```
 *
 * @param inputValue - A number to transform between the input and output ranges.
 * @param inputRange - A linear series of numbers (either all increasing or decreasing).
 * @param outputRange - A series of numbers, colors, strings, or arrays/objects of those. Must be the same length as `inputRange`.
 * @param options - Clamp: Clamp values to within the given range. Defaults to `true`.
 *
 * @public
 */
export declare function transform<T>(inputValue: number, inputRange: number[], outputRange: T[], options?: TransformOptions<T>): T;

/**
 * @library
 *
 * For improved performance, `transform` can pre-calculate the function that will transform a value between two ranges.
 * Returns a function.
 *
 * ```jsx
 * import * as React from "react"
 * import { Frame, transform } from "framer"
 *
 * export function MyComponent() {
 *     const inputRange = [-200, -100, 100, 200]
 *     const outputRange = [0, 1, 1, 0]
 *     const convertRange = transform(inputRange, outputRange)
 *     const output = convertRange(-150)
 *
 *     // Returns 0.5
 *     return <Frame>{output}</Frame>
 * }
 *
 * ```
 *
 * @motion
 *
 * Transforms numbers into other values by mapping them from an input range to an output range.
 *
 * Given an input range of `[0, 200]` and an output range of
 * `[0, 1]`, this function will return a value between `0` and `1`.
 * The input range must be a linear series of numbers. The output range
 * can be any supported value type, such as numbers, colors, shadows, arrays, objects and more.
 * Every value in the output range must be of the same type and in the same format.
 *
 * ```jsx
 * import * as React from "react"
 * import { Frame, transform } from "framer"
 *
 * export function MyComponent() {
 *     const inputRange = [-200, -100, 100, 200]
 *     const outputRange = [0, 1, 1, 0]
 *     const convertRange = transform(inputRange, outputRange)
 *     const output = convertRange(-150)
 *
 *     // Returns 0.5
 *     return <div>{output}</div>
 * }
 *
 * ```
 *
 * @param inputRange - A linear series of numbers (either all increasing or decreasing).
 * @param outputRange - A series of numbers, colors or strings. Must be the same length as `inputRange`.
 * @param options - Clamp: clamp values to within the given range. Defaults to `true`.
 *
 * @public
 */
export declare function transform<T>(inputRange: number[], outputRange: T[], options?: TransformOptions<T>): (inputValue: number) => T;

/**
 * @public
 */
declare interface TransformOptions<T> {
    /**
     * Clamp values to within the given range. Defaults to `true`
     *
     * @public
     */
    clamp?: boolean;
    /**
     * Easing functions to use on the interpolations between each value in the input and output ranges.
     *
     * If provided as an array, the array must be one item shorter than the input and output ranges, as the easings apply to the transition **between** each.
     *
     * @public
     */
    ease?: Easing_2 | Easing_2[];
    /**
     * @internal
     */
    mixer?: (from: T, to: T) => (v: number) => any;
}

declare interface TransformOrigin {
    originX?: number | string;
    originY?: number | string;
    originZ?: number | string;
}

/**
 * A function that accepts a two-dimensional point and returns a new one.
 *
 * @public
 */
export declare type TransformPoint2D = (point: Point2D) => Point2D;

declare interface TransformProperties {
    x?: string | number;
    y?: string | number;
    z?: string | number;
    translateX?: string | number;
    translateY?: string | number;
    translateZ?: string | number;
    rotate?: string | number;
    rotateX?: string | number;
    rotateY?: string | number;
    rotateZ?: string | number;
    scale?: string | number;
    scaleX?: string | number;
    scaleY?: string | number;
    scaleZ?: string | number;
    skew?: string | number;
    skewX?: string | number;
    skewY?: string | number;
    originX?: string | number;
    originY?: string | number;
    originZ?: string | number;
    perspective?: string | number;
    transformPerspective?: string | number;
}

/**
 * Transition props
 *
 * @public
 */
export declare type Transition = (Orchestration & Repeat & TransitionDefinition) | (Orchestration & Repeat & TransitionMap);

/**
 * @public
 */
declare type TransitionDefinition = Tween | Spring | Keyframes | Inertia | Just | None | PermissiveTransitionDefinition;

declare type TransitionMap = Orchestration & {
    [key: string]: TransitionDefinition;
};

/**
 * An animation that animates between two or more values over a specific duration of time.
 * This is the default animation for non-physical values like `color` and `opacity`.
 *
 * @public
 */
export declare interface Tween extends Repeat {
    /**
     * Set `type` to `"tween"` to use a duration-based tween animation.
     * If any non-orchestration `transition` values are set without a `type` property,
     * this is used as the default animation.
     *
     * @library
     *
     * ```jsx
     * <Frame
     *   animate={{ opacity: 0 }}
     *   transition={{ duration: 2, type: "tween" }}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.path
     *   animate={{ pathLength: 1 }}
     *   transition={{ duration: 2, type: "tween" }}
     * />
     * ```
     *
     * @public
     */
    type?: "tween";
    /**
     * The duration of the tween animation. Set to `0.3` by default, 0r `0.8` if animating a series of keyframes.
     *
     * @library
     *
     * ```jsx
     * <Frame
     *   animate={{ opacity: 0 }}
     *   transition={{ duration: 2 }}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * const variants = {
     *   visible: {
     *     opacity: 1,
     *     transition: { duration: 2 }
     *   }
     * }
     * ```
     *
     * @public
     */
    duration?: number;
    /**
     * The easing function to use. Set as one of the below.
     *
     * - The name of an existing easing function.
     * - An array of four numbers to define a cubic bezier curve.
     * - An easing function, that accepts and returns a value `0-1`.
     *
     * If the animating value is set as an array of multiple values for a keyframes
     * animation, `ease` can be set as an array of easing functions to set different easings between
     * each of those values.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   ease: [0.17, 0.67, 0.83, 0.67]
     * }
     *
     * <Frame
     *   animate={{ opacity: 0 }}
     *   transition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   animate={{ opacity: 0 }}
     *   transition={{ ease: [0.17, 0.67, 0.83, 0.67] }}
     * />
     * ```
     *
     * @public
     */
    ease?: Easing | Easing[];
    /**
     * The duration of time already elapsed in the animation. Set to `0` by
     * default.
     *
     * @internal
     */
    elapsed?: number;
    /**
     * When animating keyframes, `times` can be used to determine where in the animation each keyframe is reached.
     * Each value in `times` is a value between `0` and `1`, representing `duration`.
     *
     * There must be the same number of `times` as there are keyframes.
     * Defaults to an array of evenly-spread durations.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   times: [0, 0.1, 0.9, 1]
     * }
     *
     * <Frame
     *   animate={{ scale: [0, 1, 0.5, 1] }}
     *   transition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   animate={{ scale: [0, 1, 0.5, 1] }}
     *   transition={{ times: [0, 0.1, 0.9, 1] }}
     * />
     * ```
     *
     * @public
     */
    times?: number[];
    /**
     * When animating keyframes, `easings` can be used to define easing functions between each keyframe. This array should be one item fewer than the number of keyframes, as these easings apply to the transitions between the keyframes.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   easings: ["easeIn", "easeOut"]
     * }
     *
     * <Frame
     *   animate={{ backgroundColor: ["#0f0", "#00f", "#f00"] }}
     *   transition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   animate={{ backgroundColor: ["#0f0", "#00f", "#f00"] }}
     *   transition={{ easings: ["easeIn", "easeOut"] }}
     * />
     * ```
     *
     * @public
     */
    easings?: Easing[];
    /**
     * The value to animate from.
     * By default, this is the current state of the animating value.
     *
     * @library
     *
     * ```jsx
     * const transition = {
     *   from: 90,
     *   duration: 2
     * }
     *
     * <Frame
     *   animate={{ rotate: 180 }}
     *   transition={transition}
     * />
     * ```
     *
     * @motion
     *
     * ```jsx
     * <motion.div
     *   animate={{ rotate: 180 }}
     *   transition={{ from: 90, duration: 2 }}
     * />
     * ```
     *
     * @public
     */
    from?: number | string;
    /**
     * @internal
     */
    to?: number | string | ValueTarget;
    /**
     * @internal
     */
    velocity?: number;
    /**
     * @internal
     */
    delay?: number;
}

declare type UnionStringArray<T extends Readonly<string[]>> = T[number];

/**
 * Support for React component props
 */
declare type UnwrapFactoryAttributes<F> = F extends DetailedHTMLFactory<infer P, any> ? P : never;

declare type UnwrapFactoryElement<F> = F extends DetailedHTMLFactory<any, infer P> ? P : never;

declare type UnwrapSVGFactoryElement<F> = F extends React_2.SVGProps<infer P> ? P : never;

/**
 * Creates `AnimationControls`, which can be used to manually start, stop
 * and sequence animations on one or more components.
 *
 * The returned `AnimationControls` should be passed to the `animate` property
 * of the components you want to animate.
 *
 * These components can then be animated with the `start` method.
 *
 * @library
 *
 * ```jsx
 * import * as React from 'react'
 * import { Frame, useAnimation } from 'framer'
 *
 * export function MyComponent(props) {
 *    const controls = useAnimation()
 *
 *    controls.start({
 *        x: 100,
 *        transition: { duration: 0.5 },
 *    })
 *
 *    return <Frame animate={controls} />
 * }
 * ```
 *
 * @motion
 *
 * ```jsx
 * import * as React from 'react'
 * import { motion, useAnimation } from 'framer-motion'
 *
 * export function MyComponent(props) {
 *    const controls = useAnimation()
 *
 *    controls.start({
 *        x: 100,
 *        transition: { duration: 0.5 },
 *    })
 *
 *    return <motion.div animate={controls} />
 * }
 * ```
 *
 * @returns Animation controller with `start` and `stop` methods
 *
 * @public
 */
export declare function useAnimation(): AnimationControls;

/**
 * Cycles through a series of visual properties. Can be used to toggle between or cycle through animations. It works similar to `useState` in React. It is provided an initial array of possible states, and returns an array of two arguments.
 *
 * @library
 *
 * ```jsx
 * import * as React from "react"
 * import { Frame, useCycle } from "framer"
 *
 * export function MyComponent() {
 *   const [x, cycleX] = useCycle(0, 50, 100)
 *
 *   return (
 *     <Frame
 *       animate={{ x: x }}
 *       onTap={() => cycleX()}
 *      />
 *    )
 * }
 * ```
 *
 * @motion
 *
 * An index value can be passed to the returned `cycle` function to cycle to a specific index.
 *
 * ```jsx
 * import * as React from "react"
 * import { motion, useCycle } from "framer-motion"
 *
 * export const MyComponent = () => {
 *   const [x, cycleX] = useCycle(0, 50, 100)
 *
 *   return (
 *     <motion.div
 *       animate={{ x: x }}
 *       onTap={() => cycleX()}
 *      />
 *    )
 * }
 * ```
 *
 * @param items - items to cycle through
 * @returns [currentState, cycleState]
 *
 * @public
 */
export declare function useCycle<T>(...items: T[]): CycleState<T>;

/**
 * This is not an officially supported API and may be removed
 * on any version.
 * @internal
 */
export declare function useDeprecatedAnimatedState(initialState: any): any[];

/**
 * Returns a `MotionValue` each for `scaleX` and `scaleY` that update with the inverse
 * of their respective parent scales.
 *
 * This is useful for undoing the distortion of content when scaling a parent component.
 *
 * By default, `useInvertedScale` will automatically fetch `scaleX` and `scaleY` from the nearest parent.
 * By passing other `MotionValue`s in as `useInvertedScale({ scaleX, scaleY })`, it will invert the output
 * of those instead.
 *
 * @motion
 *
 * ```jsx
 * const MyComponent = () => {
 *   const { scaleX, scaleY } = useInvertedScale()
 *   return <motion.div style={{ scaleX, scaleY }} />
 * }
 * ```
 *
 * @library
 *
 * ```jsx
 * function MyComponent() {
 *   const { scaleX, scaleY } = useInvertedScale()
 *   return <Frame scaleX={scaleX} scaleY={scaleY} />
 * }
 * ```
 *
 * @deprecated
 */
export declare function useDeprecatedInvertedScale(scale?: Partial<ScaleMotionValues>): ScaleMotionValues;

/**
 * Attaches an event listener directly to the provided DOM element.
 *
 * Bypassing React's event system can be desirable, for instance when attaching non-passive
 * event handlers.
 *
 * ```jsx
 * const ref = useRef(null)
 *
 * useDomEvent(ref, 'wheel', onWheel, { passive: false })
 *
 * return <div ref={ref} />
 * ```
 *
 * @param ref - React.RefObject that's been provided to the element you want to bind the listener to.
 * @param eventName - Name of the event you want listen for.
 * @param handler - Function to fire when receiving the event.
 * @param options - Options to pass to `Event.addEventListener`.
 *
 * @public
 */
export declare function useDomEvent(ref: RefObject<EventTarget>, eventName: string, handler?: EventListener | undefined, options?: AddEventListenerOptions): void;

/**
 * Usually, dragging is initiated by pressing down on a `motion` component with a `drag` prop
 * and moving it. For some use-cases, for instance clicking at an arbitrary point on a video scrubber, we
 * might want to initiate that dragging from a different component than the draggable one.
 *
 * By creating a `dragControls` using the `useDragControls` hook, we can pass this into
 * the draggable component's `dragControls` prop. It exposes a `start` method
 * that can start dragging from pointer events on other components.
 *
 * @library
 *
 * ```jsx
 * const dragControls = useDragControls()
 *
 * function startDrag(event) {
 *   dragControls.start(event, { snapToCursor: true })
 * }
 *
 * return (
 *   <>
 *     <Frame onTapStart={startDrag} />
 *     <Frame drag="x" dragControls={dragControls} />
 *   </>
 * )
 * ```
 *
 * @motion
 *
 * ```jsx
 * const dragControls = useDragControls()
 *
 * function startDrag(event) {
 *   dragControls.start(event, { snapToCursor: true })
 * }
 *
 * return (
 *   <>
 *     <div onPointerDown={startDrag} />
 *     <motion.div drag="x" dragControls={dragControls} />
 *   </>
 * )
 * ```
 *
 * @public
 */
export declare function useDragControls(): DragControls;

/**
 * Returns MotionValues that update when the provided element scrolls:
 *
 * - `scrollX` — Horizontal scroll distance in pixels.
 * - `scrollY` — Vertical scroll distance in pixels.
 * - `scrollXProgress` — Horizontal scroll progress between `0` and `1`.
 * - `scrollYProgress` — Vertical scroll progress between `0` and `1`.
 *
 * This element must be set to `overflow: scroll` on either or both axes to report scroll offset.
 *
 * @library
 *
 * ```jsx
 * import * as React from "react"
 * import {
 *   Frame,
 *   useElementScroll,
 *   useTransform
 * } from "framer"
 *
 * export function MyComponent() {
 *   const ref = React.useRef()
 *   const { scrollYProgress } = useElementScroll(ref)
 *
 *   return (
 *     <Frame ref={ref}>
 *       <Frame scaleX={scrollYProgress} />
 *     </Frame>
 *   )
 * }
 * ```
 *
 * @motion
 *
 * ```jsx
 * export const MyComponent = () => {
 *   const ref = useRef()
 *   const { scrollYProgress } = useElementScroll(ref)
 *
 *   return (
 *     <div ref={ref}>
 *       <motion.div style={{ scaleX: scrollYProgress }} />
 *     </div>
 *   )
 * }
 * ```
 *
 * @public
 */
export declare function useElementScroll(ref: RefObject<HTMLElement>): ScrollMotionValues;

/**
 * Uses the ref that is passed in, or creates a new one
 * @param external - External ref
 * @internal
 */
export declare function useExternalRef<E = Element>(externalRef?: Ref<E>): RefObject<E>;

/**
 * Add pan and tap gesture recognition to an element.
 *
 * @param props - Gesture event handlers
 * @param ref - React `ref` containing a DOM `Element`
 * @public
 */
export declare function useGestures<GestureHandlers>(props: GestureHandlers, visualElement: VisualElement): void;

/**
 * Similar to `usePresence`, except `useIsPresent` simply returns whether or not the component is present.
 * There is no `safeToRemove` function.
 *
 * ```jsx
 * import { useIsPresent } from "framer-motion"
 *
 * export const Component = () => {
 *   const isPresent = useIsPresent()
 *
 *   useEffect(() => {
 *     !isPresent && console.log("I've been removed!")
 *   }, [isPresent])
 *
 *   return <div />
 * }
 * ```
 *
 * @public
 */
export declare function useIsPresent(): boolean;

/**
 * Combine multiple motion values into a new one using a string template literal.
 *
 * ```jsx
 * import {
 *   motion,
 *   useSpring,
 *   useMotionValue,
 *   useMotionTemplate
 * } from "framer-motion"
 *
 * function Component() {
 *   const shadowX = useSpring(0)
 *   const shadowY = useMotionValue(0)
 *   const shadow = useMotionTemplate`drop-shadow(${shadowX}px ${shadowY}px 20px rgba(0,0,0,0.3))`
 *
 *   return <motion.div style={{ filter: shadow }} />
 * }
 * ```
 *
 * @public
 */
export declare function useMotionTemplate(fragments: TemplateStringsArray, ...values: MotionValue[]): MotionValue<string>;

/**
 * Creates a `MotionValue` to track the state and velocity of a value.
 *
 * Usually, these are created automatically. For advanced use-cases, like use with `useTransform`, you can create `MotionValue`s externally and pass them into the animated component via the `style` prop.
 *
 * @library
 *
 * ```jsx
 * export function MyComponent() {
 *   const scale = useMotionValue(1)
 *
 *   return <Frame scale={scale} />
 * }
 * ```
 *
 * @motion
 *
 * ```jsx
 * export const MyComponent = () => {
 *   const scale = useMotionValue(1)
 *
 *   return <motion.div style={{ scale }} />
 * }
 * ```
 *
 * @param initial - The initial state.
 *
 * @public
 */
export declare function useMotionValue<T>(initial: T): MotionValue<T>;

/**
 *
 * @param handlers -
 * @param ref -
 *
 * @internalremarks
 * Currently this sets new pan gesture functions every render. The memo route has been explored
 * in the past but ultimately we're still creating new functions every render. An optimisation
 * to explore is creating the pan gestures and loading them into a `ref`.
 *
 * @internal
 */
export declare function usePanGesture({ onPan, onPanStart, onPanEnd, onPanSessionStart }: PanHandlers, ref: RefObject<Element> | VisualElement): void;

/**
 * When a component is the child of `AnimatePresence`, it can use `usePresence`
 * to access information about whether it's still present in the React tree.
 *
 * ```jsx
 * import { usePresence } from "framer-motion"
 *
 * export const Component = () => {
 *   const [isPresent, safeToRemove] = usePresence()
 *
 *   useEffect(() => {
 *     !isPresent && setTimeout(safeToRemove, 1000)
 *   }, [isPresent])
 *
 *   return <div />
 * }
 * ```
 *
 * If `isPresent` is `false`, it means that a component has been removed the tree, but
 * `AnimatePresence` won't really remove it until `safeToRemove` has been called.
 *
 * @public
 */
export declare function usePresence(): AlwaysPresent | Present | NotPresent;

/**
 * A hook that returns `true` if we should be using reduced motion based on the current device's Reduced Motion setting.
 *
 * This can be used to implement changes to your UI based on Reduced Motion. For instance, replacing motion-sickness inducing
 * `x`/`y` animations with `opacity`, disabling the autoplay of background videos, or turning off parallax motion.
 *
 * It will actively respond to changes and re-render your components with the latest setting.
 *
 * ```jsx
 * export function Sidebar({ isOpen }) {
 *   const shouldReduceMotion = useReducedMotion()
 *   const closedX = shouldReduceMotion ? 0 : "-100%"
 *
 *   return (
 *     <motion.div animate={{
 *       opacity: isOpen ? 1 : 0,
 *       x: isOpen ? 0 : closedX
 *     }} />
 *   )
 * }
 * ```
 *
 * @return boolean
 *
 * @public
 */
export declare function useReducedMotion(): boolean | null;

/**
 * Creates a `MotionValue` that, when `set`, will use a spring animation to animate to its new state.
 *
 * It can either work as a stand-alone `MotionValue` by initialising it with a value, or as a subscriber
 * to another `MotionValue`.
 *
 * @remarks
 *
 * ```jsx
 * const x = useSpring(0, { stiffness: 300 })
 * const y = useSpring(x, { damping: 10 })
 * ```
 *
 * @param inputValue - `MotionValue` or number. If provided a `MotionValue`, when the input `MotionValue` changes, the created `MotionValue` will spring towards that value.
 * @param springConfig - Configuration options for the spring.
 * @returns `MotionValue`
 *
 * @public
 */
export declare function useSpring(source: MotionValue | number, config?: SpringOptions): MotionValue<any>;

/**
 * @param handlers -
 * @internal
 */
export declare function useTapGesture({ onTap, onTapStart, onTapCancel, whileTap }: TapHandlers, visualElement: VisualElement): void;

/**
 * Create a `MotionValue` that transforms the output of another `MotionValue` by mapping it from one range of values into another.
 *
 * @remarks
 *
 * Given an input range of `[-200, -100, 100, 200]` and an output range of
 * `[0, 1, 1, 0]`, the returned `MotionValue` will:
 *
 * - When provided a value between `-200` and `-100`, will return a value between `0` and  `1`.
 * - When provided a value between `-100` and `100`, will return `1`.
 * - When provided a value between `100` and `200`, will return a value between `1` and  `0`
 *
 *
 * The input range must be a linear series of numbers. The output range
 * can be any value type supported by Framer Motion: numbers, colors, shadows, etc.
 *
 * Every value in the output range must be of the same type and in the same format.
 *
 * @library
 *
 * ```jsx
 * export function MyComponent() {
 *   const x = useMotionValue(0)
 *   const xRange = [-200, -100, 100, 200]
 *   const opacityRange = [0, 1, 1, 0]
 *   const opacity = useTransform(x, xRange, opacityRange)
 *
 *   return <Frame x={x} animate={{ x: 200 }} opacity={opacity} />
 * }
 * ```
 *
 * @motion
 *
 * ```jsx
 * export const MyComponent = () => {
 *   const x = useMotionValue(0)
 *   const xRange = [-200, -100, 100, 200]
 *   const opacityRange = [0, 1, 1, 0]
 *   const opacity = useTransform(x, xRange, opacityRange)
 *
 *   return (
 *     <motion.div
 *       animate={{ x: 200 }}
 *       style={{ opacity, x }}
 *     />
 *   )
 * }
 * ```
 *
 * @param inputValue - `MotionValue`
 * @param inputRange - A linear series of numbers (either all increasing or decreasing)
 * @param outputRange - A series of numbers, colors or strings. Must be the same length as `inputRange`.
 * @param options -
 *
 *  - clamp: boolean. Clamp values to within the given range. Defaults to `true`
 *  - ease: EasingFunction[]. Easing functions to use on the interpolations between each value in the input and output ranges. If provided as an array, the array must be one item shorter than the input and output ranges, as the easings apply to the transition between each.
 *
 * @returns `MotionValue`
 *
 * @public
 */
export declare function useTransform<I, O>(value: MotionValue<number>, inputRange: InputRange, outputRange: O[], options?: TransformOptions<O>): MotionValue<O>;

/**
 * Create a `MotionValue` that transforms the output of another `MotionValue` through a function.
 * In this example, `y` will always be double `x`.
 *
 * @library
 *
 * ```jsx
 * import * as React from "react"
 * import { Frame, useMotionValue, useTransform } from "framer"
 *
 * export function MyComponent() {
 *   const x = useMotionValue(10)
 *   const y = useTransform(x, value => value * 2)
 *
 *   return <Frame x={x} y={y} />
 * }
 * ```
 *
 * @motion
 *
 * ```jsx
 * export const MyComponent = () => {
 *   const x = useMotionValue(10)
 *   const y = useTransform(x, value => value * 2)
 *
 *   return <motion.div style={{ x, y }} />
 * }
 * ```
 *
 * @param input - A `MotionValue` that will pass its latest value through `transform` to update the returned `MotionValue`.
 * @param transform - A function that accepts the latest value from `input` and returns a new value.
 * @returns `MotionValue`
 *
 * @public
 */
export declare function useTransform<I, O>(input: MotionValue<I>, transformer: SingleTransformer<I, O>): MotionValue<O>;

/**
 * Pass an array of `MotionValue`s and a function to combine them. In this example, `z` will be the `x` multiplied by `y`.
 *
 * @library
 *
 * ```jsx
 * import * as React from "react"
 * import { Frame, useMotionValue, useTransform } from "framer"
 *
 * export function MyComponent() {
 *   const x = useMotionValue(0)
 *   const y = useMotionValue(0)
 *   const z = useTransform([x, y], [latestX, latestY] => latestX * latestY)
 *
 *   return <Frame x={x} y={y} z={z} />
 * }
 * ```
 *
 * @motion
 *
 * ```jsx
 * export const MyComponent = () => {
 *   const x = useMotionValue(0)
 *   const y = useMotionValue(0)
 *   const z = useTransform([x, y], [latestX, latestY] => latestX * latestY)
 *
 *   return <motion.div style={{ x, y, z }} />
 * }
 * ```
 *
 * @param input - An array of `MotionValue`s that will pass their latest values through `transform` to update the returned `MotionValue`.
 * @param transform - A function that accepts the latest values from `input` and returns a new value.
 * @returns `MotionValue`
 *
 * @public
 */
export declare function useTransform<I, O>(input: MotionValue<string | number>[], transformer: MultiTransformer<I, O>): MotionValue<O>;

/**
 * Returns MotionValues that update when the viewport scrolls:
 *
 * - `scrollX` — Horizontal scroll distance in pixels.
 * - `scrollY` — Vertical scroll distance in pixels.
 * - `scrollXProgress` — Horizontal scroll progress between `0` and `1`.
 * - `scrollYProgress` — Vertical scroll progress between `0` and `1`.
 *
 * @library
 *
 * ```jsx
 * import * as React from "react"
 * import {
 *   Frame,
 *   useViewportScroll,
 *   useTransform
 * } from "framer"
 *
 * export function MyComponent() {
 *   const { scrollYProgress } = useViewportScroll()
 *   return <Frame scaleX={scrollYProgress} />
 * }
 * ```
 *
 * @motion
 *
 * ```jsx
 * export const MyComponent = () => {
 *   const { scrollYProgress } = useViewportScroll()
 *   return <motion.div style={{ scaleX: scrollYProgress }} />
 * }
 * ```
 *
 * @public
 */
export declare function useViewportScroll(): ScrollMotionValues;

/**
 * A generic function type that will return a specific VisualElement,
 * for instance useDomVisualElement will return either an SVGVisualElement
 * or a HTMLVisualElement.
 */
declare type UseVisualElement<E, P = MotionProps> = (Component: string | React_2.ComponentType<P>, props: MotionProps & P, isStatic?: boolean, ref?: Ref<E>) => VisualElement;

/**
 * @public
 */
export declare type ValueTarget = SingleTarget | KeyframesTarget;

/**
 * @public
 */
export declare type Variant = TargetAndTransition | TargetResolver;

declare interface VariantContextProps {
    parent?: VisualElement;
    initial?: VariantLabels | false;
    animate?: VariantLabels;
    whileHover?: VariantLabels;
    whileTap?: VariantLabels;
    whileDrag?: VariantLabels;
    whileFocus?: VariantLabels;
    exit?: VariantLabels;
}

/**
 * Either a string, or array of strings, that reference variants defined via the `variants` prop.
 * @public
 */
export declare type VariantLabels = string | string[];

/**
 * @public
 */
export declare type Variants = {
    [key: string]: Variant;
};

export declare enum VisibilityAction {
    Hide = 0,
    Show = 1
}

/**
 * VisualElement is an abstract class that provides a generic animation-optimised interface to the
 * underlying renderer.
 *
 * Currently many features interact directly with HTMLVisualElement/SVGVisualElement
 * but the idea is we can create, for instance, a ThreeVisualElement that extends
 * VisualElement and we can quickly offer all the same features.
 */
declare abstract class VisualElement<E = any> {
    parent?: VisualElement<E>;
    rootParent: VisualElement<E>;
    children: Set<VisualElement<E>>;
    variantChildren?: Set<VisualElement<E>>;
    animationState?: AnimationState;
    manuallyAnimateOnMount?: boolean;
    inheritsVariants?: boolean;
    /**
     * A set of values that we animate back to when a value is cleared of all overrides.
     */
    baseTarget: Target;
    getVariantPayload(): any;
    getVariant(label: string): Variants;
    addVariantChild(visualElement: VisualElement<E>): () => boolean;
    variantChildrenOrder?: Set<VisualElement<E>>;
    addVariantChildOrder(visualElement: VisualElement<E>): void;
    onAnimationStart(): void;
    onAnimationComplete(): void;
    getDefaultTransition(): any;
    prevSnapshot?: Snapshot;
    latest: ResolvedValues;
    private removeFromParent?;
    animateMotionValue?: typeof startAnimation;
    protected element: E;
    values: Map<string, MotionValue<any>>;
    private valueSubscriptions;
    private externalRef?;
    protected treePath: VisualElement[];
    protected config: VisualElementConfig;
    isPresenceRoot?: boolean;
    isMounted: boolean;
    presenceId: number;
    current: E;
    readonly depth: number;
    constructor(parent?: VisualElement<E>, ref?: Ref<E>);
    subscribe(child: VisualElement<E>): () => boolean;
    hasValue(key: string): boolean;
    addValue(key: string, value: MotionValue): void;
    removeValue(key: string): void;
    getValue<Value>(key: string): MotionValue<Value> | undefined;
    getValue<Value>(key: string, defaultValue: Value): MotionValue<Value>;
    forEachValue(callback: (value: MotionValue, key: string) => void): void;
    getInstance(): E;
    updateConfig(config?: VisualElementConfig): void;
    private update;
    abstract render(): void;
    abstract build(isReactRender: boolean): void;
    abstract clean(): void;
    abstract readNativeValue(key: string): string | number;
    abstract getBoundingBox(): AxisBox2D;
    abstract updateLayoutDelta(): void;
    abstract makeTargetAnimatable(targetAndTransition: TargetAndTransition, parseDOMValues?: boolean): TargetAndTransition;
    getBaseValue(key: string, _props: MotionProps): any;
    private setSingleStaticValue;
    setStaticValues(values: string | ResolvedValues, value?: string | number): void;
    triggerRender: () => void;
    scheduleRender(): void;
    scheduleUpdateLayoutDelta(): void;
    private subscribeToValue;
    protected mount(element: E): void;
    private unmount;
    ref: (element: E | null) => void;
}

/**
 * Base config for all VisualElements
 */
declare interface VisualElementConfig {
    /**
     * Optional, will be called once per frame on update if provided via props.
     */
    onUpdate?: MotionProps["onUpdate"];
}

declare class VisualElementDragControls {
    /**
     * Track whether we're currently dragging.
     *
     * @internal
     */
    isDragging: boolean;
    /**
     * The current direction of drag, or `null` if both.
     *
     * @internal
     */
    private currentDirection;
    /**
     * The permitted boundaries of travel, in pixels.
     *
     * @internal
     */
    private constraints;
    /**
     * A reference to the host component's latest props.
     *
     * @internal
     */
    private props;
    /**
     * @internal
     */
    private visualElement;
    /**
     * @internal
     */
    private hasMutatedConstraints;
    /**
     * Track the initial position of the cursor relative to the dragging element
     * when dragging starts as a value of 0-1 on each axis. We then use this to calculate
     * an ideal bounding box for the VisualElement renderer to project into every frame.
     *
     * @internal
     */
    cursorProgress: Point2D;
    private originPoint;
    private openGlobalLock;
    /**
     * @internal
     */
    private panSession;
    /**
     * A reference to the measured constraints bounding box
     */
    private constraintsBox?;
    constructor({ visualElement }: DragControlConfig);
    /**
     * Instantiate a PanSession for the drag gesture
     *
     * @public
     */
    start(originEvent: AnyPointerEvent, { snapToCursor, cursorProgress }?: DragControlOptions): void;
    /**
     * Ensure the component's layout and target bounding boxes are up-to-date.
     */
    prepareBoundingBox(): void;
    resolveDragConstraints(): void;
    resolveRefConstraints(layoutBox: AxisBox2D, constraints: RefObject<Element>): {
        x: {
            min: number;
            max: number;
        };
        y: {
            min: number;
            max: number;
        };
    };
    cancelDrag(): void;
    stop(event: AnyPointerEvent, info: PanInfo): void;
    snapToCursor(event: AnyPointerEvent): void;
    /**
     * Update the specified axis with the latest pointer information.
     */
    updateAxis(axis: DragDirection, event: AnyPointerEvent, offset?: Point2D): void;
    updateAxisMotionValue(axis: DragDirection, offset?: Point2D): void;
    updateVisualElementAxis(axis: DragDirection, event: AnyPointerEvent): void;
    updateProps({ drag, dragDirectionLock, dragPropagation, dragConstraints, dragElastic, dragMomentum, ...remainingProps }: DragControlsProps & MotionProps): void;
    /**
     * Drag works differently depending on which props are provided.
     *
     * - If _dragX and _dragY are provided, we output the gesture delta directly to those motion values.
     * - If the component will perform layout animations, we output the gesture to the component's
     *      visual bounding box
     * - Otherwise, we apply the delta to the x/y motion values.
     */
    private getAxisMotionValue;
    private animateDragEnd;
    stopMotion(): void;
    private startAxisValueAnimation;
    scalePoint(): void;
    mount(visualElement: HTMLVisualElement): () => void;
}

export { }
