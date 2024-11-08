// Importing the functionalities from their respective files
const parallel = require('./parallel.js');
const serial = require('./serial.js');
const serialOrdered = require('./serialOrdered.js');

// Exporting the imported functionalities as an object
module.exports = {
  parallel,
  serial,
  serialOrdered
};
