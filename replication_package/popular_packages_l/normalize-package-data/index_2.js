const semver = require('semver');
const { validate } = require('validate-npm-package-license');

function normalizeData(pkgData, strictOrWarnFn = false, warnFn = null) {
    const strict = typeof strictOrWarnFn === 'boolean' ? strictOrWarnFn : false;
    if (typeof strictOrWarnFn === 'function') warnFn = strictOrWarnFn;

    const warn = (message) => { if (warnFn) warnFn(message); };

    const validateName = (name) => {
        if (typeof name !== 'string') return false;
        if (strict && /^\s*|\s*$/.test(name)) throw new Error('Invalid name: must not contain leading or trailing spaces');
        return !name.match(/[^a-zA-Z0-9\-._@/]/) && !name.match(/^(node_modules|favicon\.ico)$/i);
    };

    const validateVersion = (version) => {
        return semver.valid(semver.clean(version)) !== null;
    };

    const normalizePeople = (people) => {
        if (!people) return [];
        if (!Array.isArray(people)) people = [people];
        return people.map(person => {
            if (typeof person === 'string') {
                const match = person.match(/(.*?)\s*<(.*?)>\s*\((.*?)\)/) || [];
                return { name: match[1] || '', email: match[2] || '', url: match[3] || '' };
            }
            return person;
        });
    };

    if (!pkgData) throw new Error('No package data provided');
    
    pkgData.name = typeof pkgData.name === 'string' ? pkgData.name.trim() : '';
    if (!validateName(pkgData.name)) {
        warn(`Invalid name: "${pkgData.name}"`);
        if (strict) throw new Error(`Invalid package name: "${pkgData.name}"`);
    }

    pkgData.version = semver.clean(pkgData.version) || '';
    if (pkgData.version && !validateVersion(pkgData.version)) {
        warn(`Invalid version: "${pkgData.version}"`);
        if (strict) throw new Error(`Invalid version: "${pkgData.version}"`);
    }

    if (!Array.isArray(pkgData.files)) delete pkgData.files;

    ['dependencies', 'devDependencies', 'optionalDependencies'].forEach(field => {
        if (typeof pkgData[field] === 'string') {
            pkgData[field] = { [pkgData.name]: pkgData[field] };
        }
    });

    if (pkgData.bundledDependencies && !pkgData.bundleDependencies) {
        pkgData.bundleDependencies = pkgData.bundledDependencies;
        delete pkgData.bundledDependencies;
    }

    if (typeof pkgData.man === 'string') {
        pkgData.man = [pkgData.man];
    }

    if (typeof pkgData.keywords === 'string') {
        pkgData.keywords = pkgData.keywords.split(/\s+/);
    }

    ['author', 'maintainers', 'contributors'].forEach(field => {
        pkgData[field] = normalizePeople(pkgData[field]);
    });

    if (typeof pkgData.repository === 'string') {
        pkgData.repository = { type: 'git', url: pkgData.repository };
    }
    if (pkgData.repository && typeof pkgData.repository.url === 'string') {
        const repoUrl = pkgData.repository.url;
        if (!/^[a-zA-Z]+:\/\//.test(repoUrl) && repoUrl.includes('/')) {
            pkgData.repository.url = `git+https://github.com/${repoUrl}.git`;
        }
    }

    if (typeof pkgData.bugs === 'string') {
        pkgData.bugs = { url: pkgData.bugs };
    }
    if (pkgData.bugs && typeof pkgData.bugs === 'object') {
        const cleanBugs = {};
        if (typeof pkgData.bugs.url === 'string') cleanBugs.url = pkgData.bugs.url;
        if (typeof pkgData.bugs.email === 'string') cleanBugs.email = pkgData.bugs.email;
        pkgData.bugs = Object.keys(cleanBugs).length > 0 ? cleanBugs : undefined;
    }

    if (!pkgData.description && typeof pkgData.readme === 'string') {
        const firstPara = pkgData.readme.split(/(?:\r?\n){2,}/)[0];
        if (firstPara) pkgData.description = firstPara.replace(/\s+/g, ' ').trim();
    }

    if (typeof pkgData.homepage !== 'string') {
        delete pkgData.homepage;
    } else if (!/^[a-zA-Z]+:\/\//.test(pkgData.homepage)) {
        pkgData.homepage = `http://${pkgData.homepage}`;
    }

    if (pkgData.license && !validate(pkgData.license).validForNewPackages) {
        delete pkgData.license;
        warn('Invalid license field');
    }
}

module.exports = normalizeData;
