// @floating-ui/dom/index.js

import { computePosition } from '@floating-ui/core';

/**
 * Positions one HTML element relative to another by using computePosition to determine the
 * coordinates and applying those coordinates to the floating element's style.
 * 
 * @param {HTMLElement} referenceElement - The element that the positioning should reference against.
 * @param {HTMLElement} floatingElement - The element to be positioned.
 * @param {Object} options - Additional configuration for computing the position.
 * 
 * @returns {Promise<Object>} - A promise resolving to an object containing the position data.
 */
export async function positionFloatingElement(referenceElement, floatingElement, options) {
  // Validate provided elements are instances of HTMLElement
  if (!(referenceElement instanceof HTMLElement) || !(floatingElement instanceof HTMLElement)) {
    throw new Error('Invalid element(s) provided.');
  }

  // Calculate the position using the computePosition function from @floating-ui/core
  const positionData = await computePosition(referenceElement, floatingElement, options);

  // Update the floating element's style to reflect the computed position
  Object.assign(floatingElement.style, {
    position: 'absolute',
    left: `${positionData.x}px`,
    top: `${positionData.y}px`,
  });

  return positionData;
}

/**
 * Example usage:
 *
 * import { positionFloatingElement } from '@floating-ui/dom';
 * 
 * const referenceElement = document.querySelector('#reference');
 * const floatingElement = document.querySelector('#floating');
 * 
 * positionFloatingElement(referenceElement, floatingElement, {
 *   placement: 'bottom',
 *   // Additional options if needed...
 * }).then(positionData => {
 *   console.log('Positioning succeeded:', positionData);
 * }).catch(error => {
 *   console.error('Positioning failed:', error);
 * });
 */

// Export the primary positioning function
export default {
  positionFloatingElement,
};
