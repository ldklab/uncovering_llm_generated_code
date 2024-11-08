const watchman = require('fb-watchman');

// Function to initialize a watch on a given directory
const initWatch = async (path) => {
  return new Promise((resolve, reject) => {
    const client = new watchman.Client();
    
    client.capabilityCheck({optional:[], required:['relative_root']}, (error, resp) => {
      if (error) {
        console.error(error);
        client.end();
        return reject(error);
      }
      
      // Initiate a watch on the given path
      client.command(['watch-project', path], (error, resp) => {
        if (error) {
          console.error('Error initiating watch:', error);
          client.end();
          return reject(error);
        }
        
        console.log(`Watch established on ${resp.watch}`);
        
        const watch = resp.watch;
        const relativePath = resp.relative_path || '';

        resolve({ client, watch, relativePath });
      });
    });
  });
}

// Function to subscribe to changes
const subscribeToChanges = ({ client, watch, relativePath }, subscriptionName) => {
  const sub = {
    expression: ['allof', ['match', '*.*']], // Customize based on need
    fields: ['name', 'size', 'mtime_ms', 'exists', 'type'],
    relative_root: relativePath,
  };

  client.command(['subscribe', watch, subscriptionName, sub], (error, resp) => {
    if (error) {
      console.error('Failed to subscribe:', error);
      client.end();
      return;
    }

    console.log(`Subscription ${subscriptionName} established.`);
  });

  client.on('subscription', ({ subscription, files }) => {
    if (subscription !== subscriptionName) return;
    files.forEach(({ name }) => {
      console.log(`File ${name} changed.`);
    });
  });
}

// Example usage
(async () => {
  try {
    const path = '/path/to/watch';
    const { client, watch, relativePath } = await initWatch(path);
    subscribeToChanges({ client, watch, relativePath }, 'my-subscription');
  } catch (error) {
    console.error('Error setting up watch:', error);
  }
})();
