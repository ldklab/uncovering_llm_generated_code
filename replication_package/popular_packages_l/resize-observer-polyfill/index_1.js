class ResizeObserverPolyfill {
    constructor(callback) {
        if (typeof callback !== 'function') {
            throw new TypeError('Callback must be a function');
        }
        this.callback = callback;
        this.observedElements = [];

        this.handleMutations = (mutations) => {
            const entries = mutations.map(mutation => {
                const target = mutation.target;
                if (this.observedElements.includes(target)) {
                    const rect = target.getBoundingClientRect();
                    return {
                        target,
                        contentRect: {
                            left: rect.left,
                            top: rect.top,
                            width: rect.width,
                            height: rect.height
                        }
                    };
                }
                return null;
            }).filter(entry => entry !== null);

            if (entries.length > 0) {
                this.callback(entries, this);
            }
        };

        if (window.MutationObserver) {
            this.observer = new MutationObserver(this.handleMutations);
        } else if (document.implementation.hasFeature('MutationEvents', '2.0')) {
            this.setupLegacyEventListeners();
        } else {
            throw new Error('ResizeObserverPolyfill requires MutationObserver or MutationEvents');
        }
    }

    setupLegacyEventListeners() {
        this.handleMutations = this.handleMutations.bind(this);
        document.addEventListener('DOMNodeInserted', this.handleMutations, false);
        document.addEventListener('DOMNodeRemoved', this.handleMutations, false);
        document.addEventListener('DOMAttrModified', this.handleMutations, false);
        document.addEventListener('DOMCharacterDataModified', this.handleMutations, false);
    }

    observe(target) {
        if (!(target instanceof Element)) {
            throw new TypeError('Target must be an Element');
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
