import { secondsInMinute } from "./constants.js";

/**
 * @name minutesToSeconds
 * @category Conversion Helpers
 * @summary Convert minutes to seconds.
 *
 * @description
 * Convert a number of minutes to a full number of seconds.
 *
 * @param minutes - The number of minutes to be converted
 *
 * @returns The number of minutes converted in seconds
 *
 * @example
 * // Convert 2 minutes to seconds
 * const result = minutesToSeconds(2)
 * //=> 120
 */
export function minutesToSeconds(minutes) {
  return Math.trunc(minutes * secondsInMinute);
}

// Fallback for modularized imports:
export default minutesToSeconds;
