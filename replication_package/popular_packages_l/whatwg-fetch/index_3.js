// A simplified implementation of the Fetch API using XMLHttpRequest.
function fetchPolyfill(url, options = {}) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(options.method || 'GET', url);

        // If headers are specified, set them on the XMLHttpRequest
        if (options.headers) {
            Object.entries(options.headers).forEach(([key, value]) => {
                xhr.setRequestHeader(key, value);
            });
        }

        // Define a function to handle the response
        xhr.onload = () => {
            const response = {
                ok: xhr.status >= 200 && xhr.status < 300,
                status: xhr.status,
                statusText: xhr.statusText,
                headers: {
                    get: (name) => xhr.getResponseHeader(name) // Function to get a response header
                },
                url: xhr.responseURL,
                text: () => Promise.resolve(xhr.responseText), // Return the response as text
                json: () => Promise.resolve(JSON.parse(xhr.responseText)) // Parse and return the response as JSON
            };
            resolve(response);
        };

        // Handle network errors
        xhr.onerror = () => reject(new TypeError('Network request failed'));
        xhr.ontimeout = () => reject(new TypeError('Network request failed'));

        // Include credentials if specified
        if (options.credentials === 'include') {
            xhr.withCredentials = true;
        }

        // Send the request
        xhr.send(options.body || null);
    });
}

// Example usage of fetchPolyfill
fetchPolyfill('/api/data', {
    method: 'GET',
    headers: {
        'Accept': 'application/json', // Specify the header to accept JSON format
    }
})
.then(response => response.json()) // Parse the response as JSON
.then(data => console.log(data)) // Log the parsed JSON data
.catch(error => console.error('Failed to fetch:', error)); // Log any errors
