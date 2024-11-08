// ResizeObserverPolyfill.js

class ResizeObserverPolyfill {
    constructor(callback) {
        // Ensure the provided callback is a function
        if (typeof callback !== 'function') {
            throw new TypeError('callback must be a function');
        }
        // Store callback and an array to hold observed elements
        this.callback = callback;
        this.observedElements = [];
        
        // Function to handle detected mutations
        const handleMutations = (mutationsList) => {
            const entries = [];
            // For each mutation, check if we are observing the target
            mutationsList.forEach(mutation => {
                if (this.observedElements.includes(mutation.target)) {
                    // Get bounding rectangle of the target and prepare entry
                    const rect = mutation.target.getBoundingClientRect();
                    entries.push({
                        target: mutation.target,
                        contentRect: {
                            left: rect.left,
                            top: rect.top,
                            width: rect.width,
                            height: rect.height
                        }
                    });
                }
            });
            // If any entries were found, invoke the callback
            if (entries.length > 0) {
                this.callback(entries, this);
            }
        };

        // Use MutationObserver if available, otherwise fallback to mutation events
        if (window.MutationObserver) {
            this.observer = new MutationObserver(handleMutations);
        } else if (document.implementation.hasFeature('MutationEvents', '2.0')) {
            this.handleMutations = handleMutations.bind(this);
            document.addEventListener('DOMNodeInserted', this.handleMutations, false);
            document.addEventListener('DOMNodeRemoved', this.handleMutations, false);
            document.addEventListener('DOMAttrModified', this.handleMutations, false);
            document.addEventListener('DOMCharacterDataModified', this.handleMutations, false);
        } else {
            throw new Error('ResizeObserverPolyfill: Environment does not support MutationObserver or deprecated MutationEvents');
        }
    }
    
    observe(target) {
        // Ensure the target is an Element
        if (!(target instanceof Element)) {
            throw new TypeError('target must be an Element');
        }
        // Add to observed elements if not already added
        if (!this.observedElements.includes(target)) {
            this.observedElements.push(target);
            if (this.observer) {
                // Observe mutations related to attributes and child nodes
                this.observer.observe(target, { attributes: true, childList: true, subtree: true });
            }
        }
    }
    
    unobserve(target) {
        // Find the target in the observed elements
        const index = this.observedElements.indexOf(target);
        if (index !== -1) {
            // Remove the target from observed elements
            this.observedElements.splice(index, 1);
            if (this.observer) {
                // Disconnect the observer to remove old targets, then reobserve the remaining
                this.observer.disconnect();
                this.observedElements.forEach(el => {
                    this.observer.observe(el, { attributes: true, childList: true, subtree: true });
                });
            }
        }
    }
    
    disconnect() {
        // Clear all observed elements and disconnect the observer
        this.observedElements = [];
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

export default ResizeObserverPolyfill;
