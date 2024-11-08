import otherTypes from '../types/other.js';
import standardTypes from '../types/standard.js';
import Mime from './Mime.js';

// Export the Mime class from './Mime.js'
export { default as Mime } from './Mime.js';

// Create and export a frozen instance of the Mime class
const mimeInstance = new Mime(standardTypes, otherTypes);
const frozenMimeInstance = mimeInstance._freeze();
export default frozenMimeInstance;
