export function isNumeric(val) {
    return !Array.isArray(val) && (val - parseFloat(val) + 1) >= 0;
}
//# sourceMappingURL=isNumeric.js.map