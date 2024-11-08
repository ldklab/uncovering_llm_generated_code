markdown
// for-each.js
module.exports = function forEach(collection, callback) {
  if (Array.isArray(collection)) {
    // Array case
    for (let i = 0; i < collection.length; i++) {
      callback(collection[i], i, collection);
    }
  } else if (collection !== null && typeof collection === 'object') {
    // Object case
    for (const key in collection) {
      if (Object.prototype.hasOwnProperty.call(collection, key)) {
        callback(collection[key], key, collection);
      }
    }
  }
}
