'use strict';

const Punycode = require('punycode');
const internals = {};

internals.rules = require('./data/rules.json').map(rule => ({
  rule,
  suffix: rule.replace(/^(\*\.|\!)/, ''),
  punySuffix: -1,
  wildcard: rule.charAt(0) === '*',
  exception: rule.charAt(0) === '!'
}));

internals.endsWith = (str, suffix) => str.indexOf(suffix, str.length - suffix.length) !== -1;

internals.findRule = domain => {
  const punyDomain = Punycode.toASCII(domain);
  return internals.rules.reduce((memo, rule) => {
    if (rule.punySuffix === -1) rule.punySuffix = Punycode.toASCII(rule.suffix);
    if (!internals.endsWith(punyDomain, `.${rule.punySuffix}`) && punyDomain !== rule.punySuffix) {
      return memo;
    }
    return rule;
  }, null);
};

exports.errorCodes = {
  DOMAIN_TOO_SHORT: 'Domain name too short.',
  DOMAIN_TOO_LONG: 'Domain name too long. It should be no more than 255 chars.',
  LABEL_STARTS_WITH_DASH: 'Domain name label can not start with a dash.',
  LABEL_ENDS_WITH_DASH: 'Domain name label can not end with a dash.',
  LABEL_TOO_LONG: 'Domain name label should be at most 63 chars long.',
  LABEL_TOO_SHORT: 'Domain name label should be at least 1 character long.',
  LABEL_INVALID_CHARS: 'Domain name label can only contain alphanumeric characters or dashes.'
};

internals.validate = (input) => {
  const ascii = Punycode.toASCII(input);
  if (ascii.length < 1) return 'DOMAIN_TOO_SHORT';
  if (ascii.length > 255) return 'DOMAIN_TOO_LONG';

  const labels = ascii.split('.');
  for (const label of labels) {
    if (!label.length) return 'LABEL_TOO_SHORT';
    if (label.length > 63) return 'LABEL_TOO_LONG';
    if (label.charAt(0) === '-') return 'LABEL_STARTS_WITH_DASH';
    if (label.charAt(label.length - 1) === '-') return 'LABEL_ENDS_WITH_DASH';
    if (!/^[a-z0-9\-]+$/.test(label)) return 'LABEL_INVALID_CHARS';
  }
};

exports.parse = (input) => {
  if (typeof input !== 'string') throw new TypeError('Domain name must be a string.');

  let domain = input.toLowerCase();
  if (domain.charAt(domain.length - 1) === '.') {
    domain = domain.slice(0, domain.length - 1);
  }

  const error = internals.validate(domain);
  if (error) {
    return {
      input,
      error: {
        message: exports.errorCodes[error],
        code: error
      }
    };
  }

  const parsed = {
    input,
    tld: null,
    sld: null,
    domain: null,
    subdomain: null,
    listed: false
  };

  const domainParts = domain.split('.');
  if (domainParts[domainParts.length - 1] === 'local') return parsed;

  const handlePunycode = () => {
    if (!/xn--/.test(domain)) return parsed;
    parsed.domain = parsed.domain ? Punycode.toASCII(parsed.domain) : null;
    parsed.subdomain = parsed.subdomain ? Punycode.toASCII(parsed.subdomain) : null;
    return parsed;
  };

  const rule = internals.findRule(domain);
  if (!rule) {
    if (domainParts.length < 2) return parsed;
    parsed.tld = domainParts.pop();
    parsed.sld = domainParts.pop();
    parsed.domain = `${parsed.sld}.${parsed.tld}`;
    if (domainParts.length) parsed.subdomain = domainParts.pop();
    return handlePunycode();
  }

  parsed.listed = true;
  const tldParts = rule.suffix.split('.');
  const privateParts = domainParts.slice(0, domainParts.length - tldParts.length);

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

exports.get = (domain) => {
  if (!domain) return null;
  return exports.parse(domain).domain || null;
};

exports.isValid = (domain) => {
  const parsed = exports.parse(domain);
  return Boolean(parsed.domain && parsed.listed);
};
