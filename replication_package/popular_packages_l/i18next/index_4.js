const express = require('express');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');

// Configure i18next with a file system backend and language detection
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: __dirname + '/locales/{{lng}}/{{ns}}.json'
    }
  });

const app = express();

// Use the i18next middleware to handle language detection
app.use(middleware.handle(i18next));

// Define a route that sends a localized welcome message
app.get('/', (req, res) => {
  res.send(req.t('welcome'));
});

// Start the Express server on port 3000
app.listen(3000, () => {
  console.log('Server running on port 3000');
});

// File structure example:
// - app.js
// - locales/
//    - en/
//      - translation.json
//    - de/
//      - translation.json
//
// Sample translation.json content:
// locales/en/translation.json
// {
//   "welcome": "Welcome to our application"
// }
// locales/de/translation.json
// {
//   "welcome": "Willkommen in unserer Anwendung"
// }
