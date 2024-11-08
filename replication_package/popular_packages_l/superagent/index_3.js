const superagent = require('superagent');

// Using Callback
superagent
  .post('/api/pet')
  .send({ name: 'Manny', species: 'cat' }) // sends a JSON post body
  .set('X-API-Key', 'foobar')
  .set('accept', 'json')
  .end((err, res) => {
    if (err) {
      console.error('Error occurred:', err);
    } else {
      console.log('Response:', res.body);
    }
  });

// Using Promises
superagent
  .post('/api/pet')
  .send({ name: 'Manny', species: 'cat' }) // sends a JSON post body
  .set('X-API-Key', 'foobar')
  .set('accept', 'json')
  .then(res => console.log('Response:', res.body))
  .catch(err => console.error('Error occurred:', err));

// Using async/await
(async () => {
  try {
    const res = await superagent
      .post('/api/pet')
      .send({ name: 'Manny', species: 'cat' }) // sends a JSON post body
      .set('X-API-Key', 'foobar')
      .set('accept', 'json');
    console.log('Response:', res.body);
  } catch (err) {
    console.error('Error occurred:', err);
  }
})();
