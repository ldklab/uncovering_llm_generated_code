const isArray = Array.isArray || function (arr) {
  return Object.prototype.toString.call(arr) === '[object Array]';
};

module.exports = isArray;
