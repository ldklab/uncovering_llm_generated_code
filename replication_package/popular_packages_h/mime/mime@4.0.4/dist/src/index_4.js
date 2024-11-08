import otherTypes from '../types/other.js';
import standardTypes from '../types/standard.js';
import Mime from './Mime.js';

// Re-export the Mime class for external use
export { default as Mime } from './Mime.js';

// Create and freeze a new Mime instance using the imported MIME types
const mimeInstance = new Mime(standardTypes, otherTypes)._freeze();

// Export the frozen instance as the default export of this module
export default mimeInstance;

//# sourceMappingURL=index.js.map
