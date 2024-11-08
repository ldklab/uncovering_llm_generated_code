// Simple fetch polyfill using XMLHttpRequest
function fetchPolyfill(url, options={}) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open(options.method || 'GET', url);

        // Set headers if provided
        if (options.headers) {
            for (let [key, value] of Object.entries(options.headers)) {
                xhr.setRequestHeader(key, value);
            }
        }

        xhr.onload = () => {
            const response = {
                ok: xhr.status >= 200 && xhr.status < 300,
                status: xhr.status,
                statusText: xhr.statusText,
                headers: {
                    get: (name) => xhr.getResponseHeader(name)
                },
                url: xhr.responseURL,
                text: () => Promise.resolve(xhr.responseText),
                json: () => Promise.resolve(JSON.parse(xhr.responseText))
            };
            resolve(response);
        };

        xhr.onerror = () => reject(new TypeError('Network request failed'));
        xhr.ontimeout = () => reject(new TypeError('Network request failed'));

        if (options.credentials === 'include') {
            xhr.withCredentials = true;
        }

        xhr.send(options.body || null);
    });
}

// Example of usage:
fetchPolyfill('/api/data', {
    method: 'GET',
    headers: {
        'Accept': 'application/json',
    }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Failed to fetch:', error));
