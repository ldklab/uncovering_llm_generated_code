/**
 * @preserve
 * JS Implementation of incremental MurmurHash3 (r150) (as of May 10, 2013)
 *
 * This hash function is suitable for applications like hash tables.
 * Original authors: Jens Taylor, Gary Court, Austin Appleby
 */

(function() {
    // Singleton cache for single-threaded environments
    let cacheInstance;

    // MurmurHash3 Constructor - handles both single and multi-instance use
    function MurmurHash3(key, seed) {
        let instance = this instanceof MurmurHash3 ? this : cacheInstance;
        instance.reset(seed);

        if (typeof key === 'string' && key.length > 0) {
            instance.hash(key);
        }

        return instance !== this ? instance : undefined;
    }

    // Add the string to the hash incrementally
    MurmurHash3.prototype.hash = function(key) {
        let h1 = this.h1, k1 = this.k1, i = 0, len = key.length;
        this.len += len; // Accumulate length for finalization

        switch (this.rem) {
            case 0: k1 ^= len > i ? (key.charCodeAt(i++) & 0xffff) : 0; // fall through
            case 1: k1 ^= len > i ? (key.charCodeAt(i++) & 0xffff) << 8 : 0; // fall through
            case 2: k1 ^= len > i ? (key.charCodeAt(i++) & 0xffff) << 16 : 0; // fall through
            case 3:
                if (len > i) {
                    k1 ^= (key.charCodeAt(i) & 0xff) << 24;
                    k1 ^= (key.charCodeAt(i++) & 0xff00) >> 8;
                }
                break;
        }

        this.rem = (len + this.rem) & 3;
        len -= this.rem;

        while (len > 0 && i < len) {
            k1 = ((key.charCodeAt(i++) & 0xffff)) ^
                 ((key.charCodeAt(i++) & 0xffff) << 8) ^
                 ((key.charCodeAt(i++) & 0xffff) << 16);
            let top = key.charCodeAt(i++);
            k1 ^= ((top & 0xff) << 24) ^ ((top & 0xff00) >> 8);

            k1 = (k1 * 0x2d51 + (k1 & 0xffff) * 0xcc9e0000) & 0xffffffff;
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = (k1 * 0x3593 + (k1 & 0xffff) * 0x1b870000) & 0xffffffff;
            
            h1 ^= k1;
            h1 = (h1 << 13) | (h1 >>> 19);
            h1 = (h1 * 5 + 0xe6546b64) & 0xffffffff;
        }

        if (this.rem > 0) {
            k1 = 0;
            if (this.rem >= 3) k1 ^= (key.charCodeAt(i + 2) & 0xffff) << 16;
            if (this.rem >= 2) k1 ^= (key.charCodeAt(i + 1) & 0xffff) << 8;
            if (this.rem >= 1) k1 ^= (key.charCodeAt(i) & 0xffff);
        }

        this.h1 = h1;
        this.k1 = k1;
        return this;
    };

    // Retrieve the 32-bit hash value
    MurmurHash3.prototype.result = function() {
        let k1 = this.k1;
        let h1 = this.h1;

        if (k1 > 0) {
            k1 = (k1 * 0x2d51 + (k1 & 0xffff) * 0xcc9e0000) & 0xffffffff;
            k1 = (k1 << 15) | (k1 >>> 17);
            k1 = (k1 * 0x3593 + (k1 & 0xffff) * 0x1b870000) & 0xffffffff;
            h1 ^= k1;
        }

        h1 ^= this.len;
        h1 ^= h1 >>> 16;
        h1 = (h1 * 0xca6b + (h1 & 0xffff) * 0x85eb0000) & 0xffffffff;
        h1 ^= h1 >>> 13;
        h1 = (h1 * 0xae35 + (h1 & 0xffff) * 0xc2b20000) & 0xffffffff;
        h1 ^= h1 >>> 16;

        return h1 >>> 0; // Convert to unsigned 32-bit integer
    };

    // Reset the hashing state
    MurmurHash3.prototype.reset = function(seed) {
        this.h1 = typeof seed === 'number' ? seed : 0;
        this.rem = this.k1 = this.len = 0;
        return this;
    };

    // Initialization of a cached instance if suitable
    cacheInstance = new MurmurHash3();

    // Export the module for Node.js environments or attach to global scope
    if (typeof(module) != 'undefined') {
        module.exports = MurmurHash3;
    } else {
        this.MurmurHash3 = MurmurHash3;
    }
}());
