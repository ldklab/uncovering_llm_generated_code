// for-each.js
module.exports = function forEach(collection, callback) {
  if (Array.isArray(collection)) {
    // Iterate over array elements
    for (let i = 0, len = collection.length; i < len; i++) {
      callback(collection[i], i, collection);
    }
  } else if (collection && typeof collection === 'object') {
    // Iterate over object properties
    for (const key in collection) {
      if (collection.hasOwnProperty(key)) {
        callback(collection[key], key, collection);
      }
    }
  }
}
