module.exports = function (xs, fn) {
    const res = [];
    xs.forEach((item, index) => {
        const result = fn(item, index);
        if (Array.isArray(result)) {
            res.push(...result);
        } else {
            res.push(result);
        }
    });
    return res;
};
