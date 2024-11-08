// This function acts as a polyfill for the Fetch API using the older XMLHttpRequest object
function fetchPolyfill(url, options = {}) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest(); // Create a new XMLHttpRequest object
        xhr.open(options.method || 'GET', url); // Open a connection with the given method and URL

        // If headers are provided in the options, set them on the request
        if (options.headers) {
            for (let [key, value] of Object.entries(options.headers)) {
                xhr.setRequestHeader(key, value);
            }
        }

        // Define what should happen when the request is successful
        xhr.onload = () => {
            const response = {
                ok: xhr.status >= 200 && xhr.status < 300, // A successful request has a status code in the range of 200-299
                status: xhr.status, // HTTP status code from the server
                statusText: xhr.statusText, // HTTP status message from the server
                headers: {
                    get: (name) => xhr.getResponseHeader(name) // Get a specific header from the response
                },
                url: xhr.responseURL, // The final URL after following all redirects
                text: () => Promise.resolve(xhr.responseText), // Method to get response text
                json: () => Promise.resolve(JSON.parse(xhr.responseText)) // Method to parse response as JSON
            };
            resolve(response); // Fulfill the promise with a response object
        };

        // Reject the promise in case of a network error or timeout
        xhr.onerror = () => reject(new TypeError('Network request failed'));
        xhr.ontimeout = () => reject(new TypeError('Network request failed'));

        // Handle credentials if the credentials option is set to 'include'
        if (options.credentials === 'include') {
            xhr.withCredentials = true;
        }

        xhr.send(options.body || null); // Send the request with the provided body or null
    });
}

// Example of how to use the fetchPolyfill function
fetchPolyfill('/api/data', {
    method: 'GET',
    headers: {
        'Accept': 'application/json', // Setting headers for the request
    }
})
.then(response => response.json()) // Once the request is resolved, extract the JSON body
.then(data => console.log(data)) // Log the data if the request was successful
.catch(error => console.error('Failed to fetch:', error)); // Handle errors by logging them
