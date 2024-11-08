     superagent
       .post('/api/pet')
       .send({ name: 'Manny', species: 'cat' }) // sends a JSON post body
       .set('X-API-Key', 'foobar')
       .set('accept', 'json')
       .end((err, res) => {
         // Handle the response here
       });

     // Using Promises
     superagent.post('/api/pet').then(console.log).catch(console.error);

     // Using async/await
     (async () => {
       try {
         const res = await superagent.post('/api/pet');
         console.log(res);
       } catch (err) {
         console.error(err);
       }
     })();
     