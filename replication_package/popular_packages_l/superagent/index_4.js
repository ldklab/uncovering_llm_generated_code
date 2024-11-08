const superagent = require('superagent');

// POST request using callback
superagent
  .post('/api/pet')
  .send({ name: 'Manny', species: 'cat' }) // sends a JSON post body
  .set('X-API-Key', 'foobar')
  .set('accept', 'json')
  .end((err, res) => {
    if (err) {
      console.error('Error occurred:', err);
    } else {
      console.log('Response received:', res.body);
    }
  });

// POST request using Promises
superagent
  .post('/api/pet')
  .send({ name: 'Manny', species: 'cat' }) // ensures same request data as above
  .set('X-API-Key', 'foobar')
  .set('accept', 'json')
  .then(response => {
    console.log('Promise response:', response.body);
  })
  .catch(error => {
    console.error('Promise error:', error);
  });

// POST request using async/await
(async () => {
  try {
    const response = await superagent
      .post('/api/pet')
      .send({ name: 'Manny', species: 'cat' }) // ensures same request data as above
      .set('X-API-Key', 'foobar')
      .set('accept', 'json');
    console.log('Async/Await response:', response.body);
  } catch (error) {
    console.error('Async/Await error:', error);
  }
})();
