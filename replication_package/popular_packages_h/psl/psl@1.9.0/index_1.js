'use strict';

const Punycode = require('punycode');
const rulesData = require('./data/rules.json');

const internals = {
  rules: rulesData.map(rule => ({
    rule,
    suffix: rule.replace(/^(\*\.|\!)/, ''),
    punySuffix: -1,
    wildcard: rule.startsWith('*'),
    exception: rule.startsWith('!')
  })),

  endsWith(str, suffix) {
    return str.endsWith(suffix);
  },

  findRule(domain) {
    const punyDomain = Punycode.toASCII(domain);
    return this.rules.reduce((memo, rule) => {
      if (rule.punySuffix === -1) {
        rule.punySuffix = Punycode.toASCII(rule.suffix);
      }
      if (!this.endsWith(punyDomain, `.${rule.punySuffix}`) && punyDomain !== rule.punySuffix) {
        return memo;
      }
      return rule;
    }, null);
  },

  validate(input) {
    const ascii = Punycode.toASCII(input);
    if (ascii.length < 1) return 'DOMAIN_TOO_SHORT';
    if (ascii.length > 255) return 'DOMAIN_TOO_LONG';

    for (const label of ascii.split('.')) {
      if (!label.length) return 'LABEL_TOO_SHORT';
      if (label.length > 63) return 'LABEL_TOO_LONG';
      if (label.startsWith('-')) return 'LABEL_STARTS_WITH_DASH';
      if (label.endsWith('-')) return 'LABEL_ENDS_WITH_DASH';
      if (!/^[a-z0-9\-]+$/.test(label)) return 'LABEL_INVALID_CHARS';
    }
  }
};

const errorCodes = {
  DOMAIN_TOO_SHORT: 'Domain name too short.',
  DOMAIN_TOO_LONG: 'Domain name too long. It should be no more than 255 chars.',
  LABEL_STARTS_WITH_DASH: 'Domain name label can not start with a dash.',
  LABEL_ENDS_WITH_DASH: 'Domain name label can not end with a dash.',
  LABEL_TOO_LONG: 'Domain name label should be at most 63 chars long.',
  LABEL_TOO_SHORT: 'Domain name label should be at least 1 character long.',
  LABEL_INVALID_CHARS: 'Domain name label can only contain alphanumeric characters or dashes.'
};

const parse = input => {
  if (typeof input !== 'string') throw new TypeError('Domain name must be a string.');

  let domain = input.toLowerCase();
  if (domain.endsWith('.')) domain = domain.slice(0, -1);

  const error = internals.validate(domain);
  if (error) {
    return {input, error: {message: errorCodes[error], code: error}};
  }

  const parsed = {input, tld: null, sld: null, domain: null, subdomain: null, listed: false};
  const domainParts = domain.split('.');

  if (domainParts.at(-1) === 'local') return parsed;

  const handlePunycode = () => {
    if (!/xn--/.test(domain)) return parsed;
    if (parsed.domain) parsed.domain = Punycode.toASCII(parsed.domain);
    if (parsed.subdomain) parsed.subdomain = Punycode.toASCII(parsed.subdomain);
    return parsed;
  };

  const rule = internals.findRule(domain);
  if (!rule) {
    if (domainParts.length < 2) return parsed;
    parsed.tld = domainParts.pop();
    parsed.sld = domainParts.pop();
    parsed.domain = `${parsed.sld}.${parsed.tld}`;
    if (domainParts.length) parsed.subdomain = domainParts.join('.');
    return handlePunycode();
  }

  parsed.listed = true;
  const tldParts = rule.suffix.split('.');
  const privateParts = domainParts.slice(0, -tldParts.length);

  if (rule.exception) privateParts.push(tldParts.shift());

  parsed.tld = tldParts.join('.');

  if (!privateParts.length) return handlePunycode();
  if (rule.wildcard) {
    tldParts.unshift(privateParts.pop());
    parsed.tld = tldParts.join('.');
  }

  if (!privateParts.length) return handlePunycode();
  parsed.sld = privateParts.pop();
  parsed.domain = `${parsed.sld}.${parsed.tld}`;
  if (privateParts.length) parsed.subdomain = privateParts.join('.');

  return handlePunycode();
};

const get = domain => domain ? parse(domain).domain || null : null;
const isValid = domain => Boolean(parse(domain).domain && parse(domain).listed);

module.exports = {
  errorCodes,
  parse,
  get,
  isValid
};
