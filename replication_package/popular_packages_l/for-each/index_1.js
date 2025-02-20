// for-each.js
module.exports = function forEach(collection, callback) {
  if (Array.isArray(collection)) {
    // Iterate over arrays
    collection.forEach((item, index) => callback(item, index, collection));
  } else if (collection !== null && typeof collection === 'object') {
    // Iterate over objects
    Object.entries(collection).forEach(([key, value]) => {
      callback(value, key, collection);
    });
  }
}
