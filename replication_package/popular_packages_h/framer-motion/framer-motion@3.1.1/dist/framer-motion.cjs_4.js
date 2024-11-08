'use strict';

import * as React from 'react';
import { __assign, __spread, __read, __values, __rest } from 'tslib';
import { motionValue, animate, startAnimation, AnimationControls, createBatcher, PresenceContext, SharedLayoutContext } from 'some-animation-library';
import { useConstant, useEffect, useMemo, useRef, useIsomorphicLayoutEffect, useUnmountEffect } from 'some-react-hooks-library';
import { MotionConfigContext, useAnimation, usePresence, useCycle, useDragControls, useReducedMotion, useMotionValue, useMotionTemplate, useTransform, useViewportScroll, useTapGesture, usePanGesture, useGestures } from 'some-hooks-and-motion-config-library';

// Some utility functions
function isCSSVariable(key) {
    return key.startsWith("--");
}

function noop(any) {
    return any;
}

function createMotionComponent(Component, config) {
    function MotionComponent(props, externalRef) {
        const isStatic = React.useContext(MotionConfigContext).isStatic;
        const visualElement = useVisualElement(Component, props, isStatic, externalRef);
        
        useMotionValues(visualElement, props);
        const variantContext = useVariants(visualElement, props, isStatic);
        const features = useFeatures(defaultFeatures, isStatic, visualElement, props);
        
        const context = React.useMemo(() => ({ visualElement: visualElement, variantContext: variantContext }), [visualElement, variantContext]);
        
        const component = useRender(Component, props, visualElement);
        
        useSnapshotOnUnmount(visualElement);

        return (
            <React.Fragment>
                <MotionContext.Provider value={context}>
                    {component}
                </MotionContext.Provider>
                {features}
            </React.Fragment>
        );
    }

    return React.forwardRef(MotionComponent);
}

const allMotionFeatures = [MeasureLayout, Animation, Drag, Gestures, Exit, AnimateLayout];
const domBaseConfig = { useVisualElement: useDomVisualElement, useRender: useRender };
const motion = createMotionProxy(allMotionFeatures);
const m = createMotionProxy([MeasureLayout]);

export { motion, animate, startAnimation, AnimationControls, useAnimation, useCycle, useDragControls, useReducedMotion, useMotionValue, useMotionTemplate, useTransform, useViewportScroll, useTapGesture, usePanGesture, useGestures };
