const watchman = require('fb-watchman');

// Initializes a watch on the specified directory path
function initWatch(directoryPath) {
  return new Promise((resolve, reject) => {
    const client = new watchman.Client();

    client.capabilityCheck({optional: [], required: ['relative_root']}, (err, resp) => {
      if (err) {
        console.error(err);
        client.end();
        reject(err);
        return;
      }

      // Set up the watch
      client.command(['watch-project', directoryPath], (err, resp) => {
        if (err) {
          console.error('Error establishing watch: ', err);
          client.end();
          reject(err);
          return;
        }

        console.log(`Watch initiated on ${resp.watch}`);

        const watchPath = resp.watch;
        const relPath = resp.relative_path || '';

        resolve({client, watch: watchPath, relativePath: relPath});
      });
    });
  });
}

// Subscribes to file changes in the watched directory
function subscribeToChanges({client, watch, relativePath}, subscriptionLabel) {
  const subscriptionConfig = {
    expression: ['allof', ['match', '*.*']], // Modify this filter based on needs
    fields: ['name', 'size', 'mtime_ms', 'exists', 'type'],
    relative_root: relativePath,
  };

  client.command(['subscribe', watch, subscriptionLabel, subscriptionConfig], (err, resp) => {
    if (err) {
      console.error('Subscription failed: ', err);
      client.end();
      return;
    }

    console.log(`Subscription ${subscriptionLabel} set up.`);
  });

  client.on('subscription', (resp) => {
    if (resp.subscription !== subscriptionLabel) return;
    resp.files.forEach(file => {
      console.log(`Detected change in file: ${file.name}`);
    });
  });
}

// Demonstrates usage of the above functions
(async () => {
  try {
    const directoryPath = '/path/to/watch'; // Directory to be watched
    const {client, watch, relativePath} = await initWatch(directoryPath);
    subscribeToChanges({client, watch, relativePath}, 'sample-subscription');
  } catch (error) {
    console.error('Setup error for watch:', error);
  }
})();
