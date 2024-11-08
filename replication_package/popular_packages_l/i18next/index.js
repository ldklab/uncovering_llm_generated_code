// Install dependencies using:
// npm install i18next i18next-fs-backend i18next-http-middleware express

const express = require('express');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');

// Initialize i18next
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    backend: {
      // path where resources get loaded from
      loadPath: __dirname + '/locales/{{lng}}/{{ns}}.json' 
    }
  });

const app = express();

// Setup i18next middleware
app.use(middleware.handle(i18next));

// Sample endpoint
app.get('/', (req, res) => {
  // Using i18next to change the response based on detected or set language
  res.send(req.t('welcome'));
});

// Start the server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});

// Example file structure:
// - app.js (this file)
// - locales/
//    - en/
//      - translation.json
//    - de/
//      - translation.json

// Example translation.json content:
// locales/en/translation.json
// {
//   "welcome": "Welcome to our application"
// }
//
// locales/de/translation.json
// {
//   "welcome": "Willkommen in unserer Anwendung"
// }
