const superagent = require('superagent');

// Callback Pattern
superagent
  .post('/api/pet')
  .send({ name: 'Manny', species: 'cat' })
  .set('X-API-Key', 'foobar')
  .set('accept', 'json')
  .end((err, res) => {
    if (err) {
      console.error(err);
    } else {
      console.log(res.body);
    }
  });

// Promise Pattern
superagent
  .post('/api/pet')
  .send({ name: 'Manny', species: 'cat' })
  .set('X-API-Key', 'foobar')
  .set('accept', 'json')
  .then(res => {
    console.log(res.body);
  })
  .catch(err => {
    console.error(err);
  });

// Async/Await Pattern
(async () => {
  try {
    const res = await superagent
      .post('/api/pet')
      .send({ name: 'Manny', species: 'cat' })
      .set('X-API-Key', 'foobar')
      .set('accept', 'json');
    console.log(res.body);
  } catch (err) {
    console.error(err);
  }
})();
