// for-each.js
module.exports = function forEach(collection, callback) {
  if (Array.isArray(collection)) {
    // If the collection is an array, execute the callback for each element
    for (let i = 0; i < collection.length; i++) {
      callback(collection[i], i, collection);
    }
  } else if (collection && typeof collection === 'object') {
    // If the collection is an object, execute the callback for each own property
    for (const key in collection) {
      if (collection.hasOwnProperty(key)) {
        callback(collection[key], key, collection);
      }
    }
  }
}
