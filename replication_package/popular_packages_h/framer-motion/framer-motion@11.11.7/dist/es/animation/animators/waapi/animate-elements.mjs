import { resolveElements } from '../../../render/dom/utils/resolve-element.mjs';
import { invariant } from '../../../utils/errors.mjs';
import { secondsToMilliseconds } from '../../../utils/time-conversion.mjs';
import { getValueTransition } from '../../utils/get-value-transition.mjs';
import { NativeAnimation } from './NativeAnimation.mjs';

function animateElements(elementOrSelector, keyframes, options, scope) {
    const elements = resolveElements(elementOrSelector, scope);
    const numElements = elements.length;
    invariant(Boolean(numElements), "No valid element provided.");
    const animations = [];
    for (let i = 0; i < numElements; i++) {
        const element = elements[i];
        const elementTransition = { ...options };
        /**
         * Resolve stagger function if provided.
         */
        if (typeof elementTransition.delay === "function") {
            elementTransition.delay = elementTransition.delay(i, numElements);
        }
        for (const valueName in keyframes) {
            const valueKeyframes = keyframes[valueName];
            const valueOptions = {
                ...getValueTransition(options, valueName),
            };
            valueOptions.duration = valueOptions.duration
                ? secondsToMilliseconds(valueOptions.duration)
                : valueOptions.duration;
            valueOptions.delay = secondsToMilliseconds(valueOptions.delay || 0);
            animations.push(new NativeAnimation(element, valueName, valueKeyframes, valueOptions));
        }
    }
    return animations;
}

export { animateElements };