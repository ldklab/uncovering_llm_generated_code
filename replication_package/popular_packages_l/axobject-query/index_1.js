// Mock database for accessibility object data
const axObjectData = {
  AbbrRole: { relatedConcepts: [{ name: 'abbr' }], type: 'structure' },
  AlertDialogRole: { relatedConcepts: [], type: 'window' },
  AlertRole: { relatedConcepts: [], type: 'structure' },
};

// Helper function to create iterable objects
const createIterable = (data) => ({
  entries: () => Object.entries(data),
  get: (key) => data[key] || null,
  has: (key) => key in data,
  keys: () => Object.keys(data),
  values: () => Object.values(data),
});

// Exported object representing AXObjects
export const AXObjects = createIterable(axObjectData);

// Mapping of AXObjects to related HTML concepts
const axObjectElementsData = {
  AbbrRole: [{ name: 'abbr' }],
  ArticleRole: [{ name: 'article' }],
  AudioRole: [{ name: 'audio' }],
};

// Exported object representing AXObject to HTML element relationships
export const AXObjectElements = createIterable(axObjectElementsData);

// Mapping of AXObjects to related ARIA roles
const axObjectRolesData = {
  AlertDialogRole: [{ name: 'alertdialog' }],
  AlertRole: [{ name: 'alert' }],
  ApplicationRole: [{ name: 'application' }],
};

// Exported object representing AXObject to ARIA roles relationships
export const AXObjectRoles = createIterable(axObjectRolesData);

// Mapping of HTML elements to AXObjects
const elementAXObjectsData = [
  [{ name: 'abbr' }, ['AbbrRole']],
  [{ name: 'article' }, ['ArticleRole']],
  [{ name: 'audio' }, ['AudioRole']],
];

// Exported iterable object representing HTML element to AXObject mappings
export const elementAXObjects = createIterable({
  entries: () => elementAXObjectsData,
  get: (element) => elementAXObjectsData.find(([key]) => key.name === element.name) || null,
  has: (element) => elementAXObjectsData.some(([key]) => key.name === element.name),
  keys: () => elementAXObjectsData.map(([key]) => key),
  values: () => elementAXObjectsData.map(([, value]) => value),
});
