// Install dependencies using:
// npm install i18next i18next-fs-backend i18next-http-middleware express

const express = require('express');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');

// Initialize i18next with file system backend and language detection middleware
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en', // default language when requested language is not found
    backend: {
      loadPath: `${__dirname}/locales/{{lng}}/{{ns}}.json` // path to translation files
    }
  });

const app = express();

// Use i18next middleware in Express to handle language detection and translation
app.use(middleware.handle(i18next));

// Define a route that sends a translated welcome message
app.get('/', (req, res) => {
  const welcomeMessage = req.t('welcome'); // translate 'welcome' key based on current language
  res.send(welcomeMessage);
});

// Start the Express server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});

// Expected directory structure for localizations:
// - app.js (this file)
// - locales/
//    - en/
//      - translation.json
//    - de/
//      - translation.json

// Sample content for translation files:
// locales/en/translation.json
// {
//   "welcome": "Welcome to our application"
// }
//
// locales/de/translation.json
// {
//   "welcome": "Willkommen in unserer Anwendung"
// }
