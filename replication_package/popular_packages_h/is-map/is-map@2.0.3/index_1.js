'use strict';

let exported;

// Check if Map and Set are available in the environment
const isMapAvailable = typeof Map === 'function' && Map.prototype;
const isSetAvailable = typeof Set === 'function' && Set.prototype;
const mapHasMethod = isMapAvailable && Map.prototype.has;
const setHasMethod = isSetAvailable && Set.prototype.has;

// Function to determine if an object is a Map
const isMap = function (x) {
    if (!x || typeof x !== 'object') {
        return false;
    }
    try {
        // Use Map.prototype.has if available
        mapHasMethod.call(x);
        // Check if object is not a Set by ensuring an error in calling Set.prototype.has
        if (setHasMethod) {
            try {
                setHasMethod.call(x);
            } catch (e) {
                return true;
            }
        }
        return x instanceof Map; // Check via instanceof when Map is available
    } catch (e) {
        return false;
    }
};

// Assign exported function based on environment capabilities
exported = !isMapAvailable || !mapHasMethod ? () => false : isMap;

// Export the isMap function as the module
module.exports = exported;
