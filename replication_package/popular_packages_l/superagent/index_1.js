const superagent = require('superagent');

// Using callback function
superagent
  .post('/api/pet')
  .send({ name: 'Manny', species: 'cat' }) // sends a JSON post body
  .set('X-API-Key', 'foobar') // sets the API key header
  .set('accept', 'json') // sets the accept header for JSON response format
  .end((err, res) => {
    if (err) {
      console.error('Error:', err); // handle error
    } else {
      console.log('Response:', res.body); // handle success response
    }
  });

// Using Promises
superagent
  .post('/api/pet')
  .send({ name: 'Manny', species: 'cat' }) // sends a JSON post body
  .set('X-API-Key', 'foobar') // sets the API key header
  .set('accept', 'json') // sets the accept header for JSON response format
  .then(res => {
    console.log('Response:', res.body); // handle success response
  })
  .catch(err => {
    console.error('Error:', err); // handle error
  });

// Using async/await
(async () => {
  try {
    const res = await superagent
      .post('/api/pet')
      .send({ name: 'Manny', species: 'cat' }) // sends a JSON post body
      .set('X-API-Key', 'foobar') // sets the API key header
      .set('accept', 'json'); // sets the accept header for JSON response format
    console.log('Response:', res.body); // handle success response
  } catch (err) {
    console.error('Error:', err); // handle error
  }
})();
