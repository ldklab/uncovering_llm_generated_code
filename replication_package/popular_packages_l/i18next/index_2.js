const express = require('express');
const i18next = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');

i18next
  .use(Backend)
  .use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: `${__dirname}/locales/{{lng}}/{{ns}}.json`, 
    }
  });

const app = express();

app.use(middleware.handle(i18next));

app.get('/', (req, res) => {
  res.send(req.t('welcome'));
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
