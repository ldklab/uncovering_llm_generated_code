class CachePolicy {
    constructor(request, response, options = {}) {
        this.request = request;
        this.response = response;
        this.shared = options.shared ?? true;
        this.cacheHeuristic = options.cacheHeuristic || 0.1;
        this.immutableMinTimeToLive = options.immutableMinTimeToLive || 24 * 3600 * 1000;
        this.ignoreCargoCult = options.ignoreCargoCult || false;
    }

    storable() {
        const cacheControl = this.response.headers['cache-control'];
        return cacheControl && !cacheControl.includes('no-store') && !(this.shared && cacheControl.includes('private'));
    }

    satisfiesWithoutRevalidation(newRequest) {
        return newRequest.url === this.request.url && newRequest.method === this.request.method && this.isFresh();
    }

    isFresh() {
        const age = Number(this.response.headers['age'] || 0);
        const maxAge = this.getMaxAge();
        return maxAge !== null && age < maxAge;
    }

    getMaxAge() {
        const match = this.response.headers['cache-control']?.match(/max-age=(\d+)/);
        return match ? Number(match[1]) : null;
    }

    responseHeaders() {
        const headers = { ...this.response.headers };
        delete headers['te'];
        delete headers['connection'];
        headers['age'] = this.calculateAge().toString();
        return headers;
    }

    calculateAge() {
        const age = Number(this.response.headers['age'] || 0);
        return age + 1;
    }

    timeToLive() {
        const maxAge = this.getMaxAge();
        return maxAge !== null ? maxAge - this.calculateAge() : 0;
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
        const newPolicy = new CachePolicy(
            revalidationRequest,
            revalidationResponse,
            {
                shared: this.shared,
                cacheHeuristic: this.cacheHeuristic,
                immutableMinTimeToLive: this.immutableMinTimeToLive,
                ignoreCargoCult: this.ignoreCargoCult
            }
        );
        return { policy: newPolicy, modified };
    }
}

module.exports = CachePolicy;
