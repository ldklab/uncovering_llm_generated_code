// resize-observer-polyfill.js

class ResizeObserverPolyfill {
    constructor(callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('callback must be a function');
        }
        this.callback = callback;
        this.observedElements = [];
        
        const handleMutations = (mutationsList) => {
            const entries = [];
            mutationsList.forEach(mutation => {
                if (this.observedElements.includes(mutation.target)) {
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
            if (entries.length > 0) {
                this.callback(entries, this);
            }
        };
        
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
        if (!(target instanceof Element)) {
            throw new TypeError('target must be an Element');
        }
        if (!this.observedElements.includes(target)) {
            this.observedElements.push(target);
            if (this.observer) {
                this.observer.observe(target, { attributes: true, childList: true, subtree: true });
            }
        }
    }
    
    unobserve(target) {
        const index = this.observedElements.indexOf(target);
        if (index !== -1) {
            this.observedElements.splice(index, 1);
            if (this.observer) {
                this.observer.disconnect();
                this.observedElements.forEach(el => {
                    this.observer.observe(el, { attributes: true, childList: true, subtree: true });
                });
            }
        }
    }
    
    disconnect() {
        this.observedElements = [];
        if (this.observer) {
            this.observer.disconnect();
        }
    }
}

export default ResizeObserverPolyfill;
