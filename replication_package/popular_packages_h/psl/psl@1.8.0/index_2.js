// Import necessary modules
'use strict';
const Punycode = require('punycode');
const rules = require('./data/rules.json').map(rule => ({
  rule,
  suffix: rule.replace(/^(\*\.|\!)/, ''),
  punySuffix: -1,
  wildcard: rule.charAt(0) === '*',
  exception: rule.charAt(0) === '!'
}));

// Helper function to check if a string ends with a specific suffix
const endsWith = (str, suffix) => str.endsWith(suffix);

// Find rule that matches a given domain
const findRule = (domain) => {
  const punyDomain = Punycode.toASCII(domain);
  return rules.reduce((memo, rule) => {
    if (rule.punySuffix === -1) {
      rule.punySuffix = Punycode.toASCII(rule.suffix);
    }
    if (!endsWith(punyDomain, '.' + rule.punySuffix) && punyDomain !== rule.punySuffix) {
      return memo;
    }
    return rule;
  }, null);
};

// Error messages for validation
const errorCodes = {
  DOMAIN_TOO_SHORT: 'Domain name too short.',
  DOMAIN_TOO_LONG: 'Domain name too long. It should be no more than 255 chars.',
  LABEL_STARTS_WITH_DASH: 'Domain name label cannot start with a dash.',
  LABEL_ENDS_WITH_DASH: 'Domain name label cannot end with a dash.',
  LABEL_TOO_LONG: 'Domain name label should be at most 63 chars long.',
  LABEL_TOO_SHORT: 'Domain name label should be at least 1 character long.',
  LABEL_INVALID_CHARS: 'Domain name label can only contain alphanumeric characters or dashes.'
};

// Validate the domain name structure
const validate = (input) => {
  const ascii = Punycode.toASCII(input);

  if (ascii.length < 1) return 'DOMAIN_TOO_SHORT';
  if (ascii.length > 255) return 'DOMAIN_TOO_LONG';

  for (const label of ascii.split('.')) {
    if (label.length === 0) return 'LABEL_TOO_SHORT';
    if (label.length > 63) return 'LABEL_TOO_LONG';
    if (label.startsWith('-')) return 'LABEL_STARTS_WITH_DASH';
    if (label.endsWith('-')) return 'LABEL_ENDS_WITH_DASH';
    if (!/^[a-z0-9\-]+$/.test(label)) return 'LABEL_INVALID_CHARS';
  }
};

// Public API to parse domain
const parse = (input) => {
  if (typeof input !== 'string') throw new TypeError('Domain name must be a string.');

  let domain = input.toLowerCase().replace(/\.$/, '');
  let error = validate(domain);
  if (error) {
    return { input, error: { message: errorCodes[error], code: error } };
  }

  const parsed = { input, tld: null, sld: null, domain: null, subdomain: null, listed: false };
  let domainParts = domain.split('.');

  if (domainParts[domainParts.length - 1] === 'local') return parsed;

  const handlePunycode = () => {
    if (!/xn--/.test(domain)) return parsed;
    if (parsed.domain) parsed.domain = Punycode.toASCII(parsed.domain);
    if (parsed.subdomain) parsed.subdomain = Punycode.toASCII(parsed.subdomain);
    return parsed;
  };

  const rule = findRule(domain);

  if (!rule) {
    if (domainParts.length < 2) return parsed;
    parsed.tld = domainParts.pop();
    parsed.sld = domainParts.pop();
    parsed.domain = [parsed.sld, parsed.tld].join('.');
    if (domainParts.length) parsed.subdomain = domainParts.join('.');
    return handlePunycode();
  }

  parsed.listed = true;

  const tldParts = rule.suffix.split('.');
  let privateParts = domainParts.slice(0, -tldParts.length);

  if (rule.exception) {
    privateParts.push(tldParts.shift());
  }

  parsed.tld = tldParts.join('.');

  if (privateParts.length === 0) return handlePunycode();

  if (rule.wildcard) {
    tldParts.unshift(privateParts.pop());
    parsed.tld = tldParts.join('.');
  }

  if (privateParts.length === 0) return handlePunycode();

  parsed.sld = privateParts.pop();
  parsed.domain = [parsed.sld, parsed.tld].join('.');

  if (privateParts.length) {
    parsed.subdomain = privateParts.join('.');
  }

  return handlePunycode();
};

// Get the full domain name
const get = (domain) => domain ? parse(domain).domain || null : null;

// Check if the domain belongs to a known public suffix
const isValid = (domain) => Boolean(parse(domain).domain && parse(domain).listed);

// Export methods
exports.errorCodes = errorCodes;
exports.parse = parse;
exports.get = get;
exports.isValid = isValid;
