const { hasOwnProperty } = Object.prototype

const encode = (obj, options = {}) => {
  if (typeof options === 'string') {
    options = { section: options }
  }
  options.align = options.align === true
  options.newline = options.newline === true
  options.sort = options.sort === true
  options.whitespace = options.whitespace === true || options.align === true
  options.platform = options.platform || (typeof process !== 'undefined' && process.platform)
  options.bracketedArray = options.bracketedArray !== false

  const eol = options.platform === 'win32' ? '\r\n' : '\n'
  const separator = options.whitespace ? ' = ' : '='
  const children = []

  const keys = options.sort ? Object.keys(obj).sort() : Object.keys(obj)

  let padToChars = 0
  if (options.align) {
    padToChars = safe(
      (
        keys
          .filter(k => obj[k] === null || Array.isArray(obj[k]) || typeof obj[k] !== 'object')
          .map(k => Array.isArray(obj[k]) ? `${k}[]` : k)
      )
        .concat([''])
        .reduce((a, b) => safe(a).length >= safe(b).length ? a : b)
    ).length
  }

  let out = ''
  const arraySuffix = options.bracketedArray ? '[]' : ''

  for (const k of keys) {
    const val = obj[k]
    if (val && Array.isArray(val)) {
      for (const item of val) {
        out += safe(`${k}${arraySuffix}`).padEnd(padToChars, ' ') + separator + safe(item) + eol
      }
    } else if (val && typeof val === 'object') {
      children.push(k)
    } else {
      out += safe(k).padEnd(padToChars, ' ') + separator + safe(val) + eol
    }
  }

  if (options.section && out.length) {
    out = '[' + safe(options.section) + ']' + (options.newline ? eol + eol : eol) + out
  }

  for (const k of children) {
    const nk = splitSections(k, '.').join('\\.')
    const section = (options.section ? options.section + '.' : '') + nk
    const child = encode(obj[k], {
      ...options,
      section,
    })
    if (out.length && child.length) {
      out += eol
    }

    out += child
  }

  return out
}

function splitSections(str, separator) {
  let lastMatchIndex = 0
  let lastSeparatorIndex = 0
  let nextIndex = 0
  const sections = []

  do {
    nextIndex = str.indexOf(separator, lastMatchIndex)

    if (nextIndex !== -1) {
      lastMatchIndex = nextIndex + separator.length

      if (nextIndex > 0 && str[nextIndex - 1] === '\\') {
        continue
      }

      sections.push(str.slice(lastSeparatorIndex, nextIndex))
      lastSeparatorIndex = nextIndex + separator.length
    }
  } while (nextIndex !== -1)

  sections.push(str.slice(lastSeparatorIndex))

  return sections
}

const decode = (str, options = {}) => {
  options.bracketedArray = options.bracketedArray !== false
  const out = Object.create(null)
  let p = out
  let section = null
  const re = /^\[([^\]]*)\]\s*$|^([^=]+)(=(.*))?$/i
  const lines = str.split(/[\r\n]+/g)
  const duplicates = {}

  for (const line of lines) {
    if (!line || line.match(/^\s*[;#]/) || line.match(/^\s*$/)) {
      continue
    }
    const match = line.match(re)
    if (!match) {
      continue
    }
    if (match[1] !== undefined) {
      section = unsafe(match[1])
      if (section === '__proto__') {
        p = Object.create(null)
        continue
      }
      p = out[section] = out[section] || Object.create(null)
      continue
    }
    const keyRaw = unsafe(match[2])
    let isArray
    if (options.bracketedArray) {
      isArray = keyRaw.length > 2 && keyRaw.slice(-2) === '[]'
    } else {
      duplicates[keyRaw] = (duplicates?.[keyRaw] || 0) + 1
      isArray = duplicates[keyRaw] > 1
    }
    const key = isArray && keyRaw.endsWith('[]')
      ? keyRaw.slice(0, -2) : keyRaw

    if (key === '__proto__') {
      continue
    }
    const valueRaw = match[3] ? unsafe(match[4]) : true
    const value = valueRaw === 'true' ||
      valueRaw === 'false' ||
      valueRaw === 'null' ? JSON.parse(valueRaw)
      : valueRaw

    if (isArray) {
      if (!hasOwnProperty.call(p, key)) {
        p[key] = []
      } else if (!Array.isArray(p[key])) {
        p[key] = [p[key]]
      }
    }

    if (Array.isArray(p[key])) {
      p[key].push(value)
    } else {
      p[key] = value
    }
  }

  const remove = []
  for (const k of Object.keys(out)) {
    if (!hasOwnProperty.call(out, k) ||
      typeof out[k] !== 'object' ||
      Array.isArray(out[k])) {
      continue
    }

    const parts = splitSections(k, '.')
    p = out
    const l = parts.pop()
    const nl = l.replace(/\\\./g, '.')
    for (const part of parts) {
      if (part === '__proto__') {
        continue
      }
      if (!hasOwnProperty.call(p, part) || typeof p[part] !== 'object') {
        p[part] = Object.create(null)
      }
      p = p[part]
    }
    if (p === out && nl === l) {
      continue
    }

    p[nl] = out[k]
    remove.push(k)
  }
  for (const del of remove) {
    delete out[del]
  }

  return out
}

const isQuoted = val => {
  return (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
}

const safe = val => {
  if (
    typeof val !== 'string' ||
    val.match(/[=\r\n]/) ||
    val.match(/^\[/) ||
    (val.length > 1 && isQuoted(val)) ||
    val !== val.trim()
  ) {
    return JSON.stringify(val)
  }
  return val.split(';').join('\\;').split('#').join('\\#')
}

const unsafe = val => {
  val = (val || '').trim()
  if (isQuoted(val)) {
    if (val.charAt(0) === "'") {
      val = val.slice(1, -1)
    }
    try {
      val = JSON.parse(val)
    } catch {
      // ignore errors
    }
  } else {
    let esc = false
    let unesc = ''
    for (let i = 0, l = val.length; i < l; i++) {
      const c = val.charAt(i)
      if (esc) {
        if ('\\;#'.indexOf(c) !== -1) {
          unesc += c
        } else {
          unesc += '\\' + c
        }

        esc = false
      } else if (';#'.indexOf(c) !== -1) {
        break
      } else if (c === '\\') {
        esc = true
      } else {
        unesc += c
      }
    }
    if (esc) {
      unesc += '\\'
    }

    return unesc.trim()
  }
  return val
}

module.exports = {
  parse: decode,
  decode,
  stringify: encode,
  encode,
  safe,
  unsafe,
}