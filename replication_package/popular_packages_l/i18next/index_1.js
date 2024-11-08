const express = require('express');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');

// Initialize i18next with file backend and middleware for language detection
i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: `${__dirname}/locales/{{lng}}/{{ns}}.json`
    }
  });

const app = express();

// Use i18next middleware in the express app
app.use(middleware.handle(i18next));

// Define root route with translated response
app.get('/', (req, res) => {
  res.send(req.t('welcome'));
});

// Start express server
app.listen(3000, () => {
  console.log('Server running on port 3000');
});

// Structure:
// - app.js (this file)
// - locales/
//    - en/
//      - translation.json
//    - de/
//      - translation.json

// en/translation.json:
// {
//   "welcome": "Welcome to our application"
// }
//
// de/translation.json:
// {
//   "welcome": "Willkommen in unserer Anwendung"
// }
