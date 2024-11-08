// axobject-query.js

// Mock database for the sake of the example.
const axObjectData = {
  AbbrRole: { relatedConcepts: [{ name: 'abbr' }], type: 'structure' },
  AlertDialogRole: { relatedConcepts: [], type: 'window' },
  AlertRole: { relatedConcepts: [], type: 'structure' },
  // ...other roles
};

// Helper function to create iterable object from the data
const createIterable = (data) => ({
  entries: () => (Array.isArray(data) ? data : Object.entries(data)),
  get: (key) => (Array.isArray(data) ? data.find(([k]) => k.name === key.name) : data[key]) || null,
  has: (key) => (Array.isArray(data) ? data.some(([k]) => k.name === key.name) : key in data),
  keys: () => (Array.isArray(data) ? data.map(([k]) => k) : Object.keys(data)),
  values: () => (Array.isArray(data) ? data.map(([, v]) => v) : Object.values(data)),
});

// Main function to export AXObjects functionality
export const AXObjects = createIterable(axObjectData);

// Maps AXObjects to related HTML concepts
const axObjectElementsData = {
  AbbrRole: [{ name: 'abbr' }],
  ArticleRole: [{ name: 'article' }],
  AudioRole: [{ name: 'audio' }],
  // ... other mappings
};

export const AXObjectElements = createIterable(axObjectElementsData);

// Maps AXObjects to related ARIA roles
const axObjectRolesData = {
  AlertDialogRole: [{ name: 'alertdialog' }],
  AlertRole: [{ name: 'alert' }],
  ApplicationRole: [{ name: 'application' }],
  // ... other mappings
};

export const AXObjectRoles = createIterable(axObjectRolesData);

// Maps HTML elements to related AXObjects
const elementAXObjectsData = [
  [{ name: 'abbr' }, ['AbbrRole']],
  [{ name: 'article' }, ['ArticleRole']],
  [{ name: 'audio' }, ['AudioRole']],
  // ... other mappings
];

export const elementAXObjects = createIterable(elementAXObjectsData);
