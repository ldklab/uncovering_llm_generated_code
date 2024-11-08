const watchman = require('fb-watchman');

async function initWatch(path) {
  return new Promise((resolve, reject) => {
    const client = new watchman.Client();

    client.capabilityCheck({optional: [], required: ['relative_root']}, (error, resp) => {
      if (error) {
        console.error(error);
        client.end();
        return reject(error);
      }

      client.command(['watch-project', path], (error, resp) => {
        if (error) {
          console.error('Error initiating watch:', error);
          client.end();
          return reject(error);
        }

        console.log(`Watch established on ${resp.watch}`);
        resolve({
          client,
          watch: resp.watch,
          relativePath: resp.relative_path || '',
        });
      });
    });
  });
}

function subscribeToChanges(watchInfo, subscriptionName) {
  const {client, watch, relativePath} = watchInfo;
  const subscription = {
    expression: ['allof', ['match', '*.*']],
    fields: ['name', 'size', 'mtime_ms', 'exists', 'type'],
    relative_root: relativePath,
  };

  client.command(['subscribe', watch, subscriptionName, subscription], (error, resp) => {
    if (error) {
      console.error('Failed to subscribe:', error);
      client.end();
      return;
    }

    console.log(`Subscription ${subscriptionName} established.`);
  });

  client.on('subscription', (resp) => {
    if (resp.subscription !== subscriptionName) return;
    resp.files.forEach(file => console.log(`File ${file.name} changed.`));
  });
}

(async () => {
  const path = '/path/to/watch';
  try {
    const watchInfo = await initWatch(path);
    subscribeToChanges(watchInfo, 'my-subscription');
  } catch (error) {
    console.error('Error setting up watch:', error);
  }
})();
