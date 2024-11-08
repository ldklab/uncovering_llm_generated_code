"use strict";

import { MemoryCookieStore } from "../memstore";
import { pathMatch } from "../pathMatch";
import { permuteDomain } from "../permuteDomain";
import { getPublicSuffix } from "../getPublicSuffix";
import { Store } from "../store";
import { ParameterError } from "../validators";
import { version } from "../version";
import { canonicalDomain } from "./canonicalDomain";
import { PrefixSecurityEnum } from "./constants";
import { Cookie } from "./cookie";
import { cookieCompare } from "./cookieCompare";
import { CookieJar } from "./cookieJar";
import { defaultPath } from "./defaultPath";
import { domainMatch } from "./domainMatch";
import { formatDate } from "./formatDate";
import { parseDate } from "./parseDate";
import { permutePath } from "./permutePath";
import { Cookie as CookieClass } from "./cookie";

export {
  MemoryCookieStore,
  pathMatch,
  permuteDomain,
  getPublicSuffix,
  Store,
  ParameterError,
  version,
  canonicalDomain,
  PrefixSecurityEnum,
  Cookie,
  cookieCompare,
  CookieJar,
  defaultPath,
  domainMatch,
  formatDate,
  parseDate,
  permutePath
};

/**
 * Parses a cookie string.
 * {@inheritDoc Cookie.parse}
 * @public
 */
export function parse(str, options) {
  return CookieClass.parse(str, options);
}

/**
 * Creates a cookie instance from JSON.
 * {@inheritDoc Cookie.fromJSON}
 * @public
 */
export function fromJSON(str) {
  return CookieClass.fromJSON(str);
}
