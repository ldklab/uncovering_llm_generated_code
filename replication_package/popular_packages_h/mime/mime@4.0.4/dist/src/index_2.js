// Import types
import otherTypes from '../types/other.js';
import standardTypes from '../types/standard.js';

// Import Mime class and re-export it
import Mime from './Mime.js';
export { default as Mime } from './Mime.js';

// Create a new Mime instance with standardTypes and otherTypes, freeze it, and export as default
const mimeInstance = new Mime(standardTypes, otherTypes);
export default mimeInstance._freeze();

//# sourceMappingURL=index.js.map
