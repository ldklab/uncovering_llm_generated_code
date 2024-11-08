class CachePolicy {
    constructor(request, response, options = {}) {
        this.request = request;
        this.response = response;
        this.shared = options.shared !== undefined ? options.shared : true;
        this.cacheHeuristic = options.cacheHeuristic || 0.1;
        this.immutableMinTimeToLive = options.immutableMinTimeToLive || 86400000; // 24 hours in milliseconds
        this.ignoreCargoCult = options.ignoreCargoCult || false;
    }

    storable() {
        const cacheControl = this.response.headers['cache-control'];
        return cacheControl && !cacheControl.includes('no-store') && (!this.shared || !cacheControl.includes('private'));
    }

    satisfiesWithoutRevalidation(newRequest) {
        return newRequest.url === this.request.url &&
               newRequest.method === this.request.method &&
               this.isFresh();
    }

    isFresh() {
        const age = parseInt(this.response.headers['age'] || '0', 10);
        const maxAgeMatch = this.response.headers['cache-control']?.match(/max-age=(\d+)/);
        const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;
        return maxAge > age;
    }

    responseHeaders() {
        const headers = { ...this.response.headers };
        delete headers['te'];
        delete headers['connection'];
        headers['age'] = this.calculateAge();
        return headers;
    }

    calculateAge() {
        return (parseInt(this.response.headers['age'] || '0', 10) + 1).toString();
    }

    timeToLive() {
        const maxAgeMatch = this.response.headers['cache-control']?.match(/max-age=(\d+)/);
        const maxAge = maxAgeMatch ? parseInt(maxAgeMatch[1], 10) : 0;
        return maxAge - this.calculateAge();
    }

    toObject() {
        return {
            request: this.request,
            response: this.response,
            options: {
                shared: this.shared,
                cacheHeuristic: this.cacheHeuristic,
                immutableMinTimeToLive: this.immutableMinTimeToLive,
                ignoreCargoCult: this.ignoreCargoCult
            }
        };
    }

    static fromObject(obj) {
        return new CachePolicy(obj.request, obj.response, obj.options);
    }

    revalidationHeaders(newRequest) {
        return { ...newRequest.headers };
    }

    revalidatedPolicy(revalidationRequest, revalidationResponse) {
        const modified = revalidationResponse.status !== 304;
        const policy = new CachePolicy(revalidationRequest, revalidationResponse, {
            shared: this.shared,
            cacheHeuristic: this.cacheHeuristic,
            immutableMinTimeToLive: this.immutableMinTimeToLive,
            ignoreCargoCult: this.ignoreCargoCult
        });
        return { policy, modified };
    }
}

module.exports = CachePolicy;
