const watchman = require('fb-watchman');

// Function to set up a watch on a given directory
async function setupDirectoryWatch(path) {
  try {
    const client = new watchman.Client();
    await client.capabilityCheckAsync({optional:[], required:['relative_root']});

    const resp = await client.commandAsync(['watch-project', path]);
    console.log(`Watch established on ${resp.watch}`);

    return {
      client,
      watch: resp.watch,
      relativePath: resp.relative_path || ''
    };
  } catch (error) {
    console.error('Failed to set up watch:', error);
    throw error;
  }
}

// Function to handle subscriptions to directory changes
function monitorDirectoryChanges({client, watch, relativePath}, subscriptionName) {
  const subscriptionConfig = {
    expression: ['allof', ['match', '*.*']],
    fields: ['name', 'size', 'mtime_ms', 'exists', 'type'],
    relative_root: relativePath,
  };

  client.command(['subscribe', watch, subscriptionName, subscriptionConfig], (error, resp) => {
    if (error) {
      console.error('Subscription failed:', error);
      client.end();
      return;
    }
    console.log(`Subscription ${subscriptionName} is active.`);
  });

  client.on('subscription', (resp) => {
    if (resp.subscription === subscriptionName) {
      resp.files.forEach(file => {
        console.log(`File changed: ${file.name}`);
      });
    }
  });
}

// Main execution: setting up a watch and monitoring changes
(async () => {
  const directoryPath = '/path/to/watch';
  try {
    const { client, watch, relativePath } = await setupDirectoryWatch(directoryPath);
    monitorDirectoryChanges({ client, watch, relativePath }, 'file-change-subscription');
  } catch (err) {
    console.error('Error in initializing watch:', err);
  }
})();
