(function (sax) {
  sax.parser = function (strict, opt) { return new SAXParser(strict, opt) }
  sax.SAXParser = SAXParser
  sax.SAXStream = SAXStream
  sax.createStream = createStream
  sax.MAX_BUFFER_LENGTH = 64 * 1024

  const buffers = [
    'comment', 'sgmlDecl', 'textNode', 'tagName', 'doctype',
    'procInstName', 'procInstBody', 'entity', 'attribName',
    'attribValue', 'cdata', 'script'
  ]

  sax.EVENTS = [
    'text', 'processinginstruction', 'sgmldeclaration', 'doctype', 'comment',
    'opentagstart', 'attribute', 'opentag', 'closetag', 'opencdata', 'cdata',
    'closecdata', 'error', 'end', 'ready', 'script', 'opennamespace', 'closenamespace'
  ]

  function SAXParser(strict, opt) {
    if (!(this instanceof SAXParser)) return new SAXParser(strict, opt)

    const parser = this
    clearBuffers(parser)
    parser.q = parser.c = ''
    parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH
    parser.opt = opt || {}
    parser.opt.lowercase = parser.opt.lowercase || parser.opt.lowercasetags
    parser.looseCase = parser.opt.lowercase ? 'toLowerCase' : 'toUpperCase'
    parser.tags = []
    parser.closed = parser.closedRoot = parser.sawRoot = false
    parser.tag = parser.error = null
    parser.strict = !!strict
    parser.noscript = !!(strict || parser.opt.noscript)
    parser.state = S.BEGIN
    parser.strictEntities = parser.opt.strictEntities
    parser.ENTITIES = parser.strictEntities ? Object.create(sax.XML_ENTITIES) : Object.create(sax.ENTITIES)
    parser.attribList = []

    if (parser.opt.xmlns) {
      parser.ns = Object.create(rootNS)
    }
    parser.trackPosition = parser.opt.position !== false
    if (parser.trackPosition) parser.position = parser.line = parser.column = 0

    emit(parser, 'onready')
  }

  if (!Object.create) {
    Object.create = function (o) {
      function F() {}
      F.prototype = o
      return new F()
    }
  }

  if (!Object.keys) {
    Object.keys = function (o) {
      const a = []
      for (const i in o) if (o.hasOwnProperty(i)) a.push(i)
      return a
    }
  }

  function checkBufferLength(parser) {
    const maxAllowed = Math.max(sax.MAX_BUFFER_LENGTH, 10)
    let maxActual = 0
    for (let i = 0, l = buffers.length; i < l; i++) {
      const len = parser[buffers[i]].length
      if (len > maxAllowed) {
        switch (buffers[i]) {
          case 'textNode': closeText(parser); break
          case 'cdata': emitNode(parser, 'oncdata', parser.cdata); parser.cdata = ''; break
          case 'script': emitNode(parser, 'onscript', parser.script); parser.script = ''; break
          default: error(parser, 'Max buffer length exceeded: ' + buffers[i])
        }
      }
      maxActual = Math.max(maxActual, len)
    }
    parser.bufferCheckPosition = sax.MAX_BUFFER_LENGTH - maxActual + parser.position
  }

  function clearBuffers(parser) {
    buffers.forEach(buffer => parser[buffer] = '')
  }

  function flushBuffers(parser) {
    closeText(parser)
    if (parser.cdata) emitNode(parser, 'oncdata', parser.cdata); parser.cdata = ''
    if (parser.script) emitNode(parser, 'onscript', parser.script); parser.script = ''
  }

  SAXParser.prototype = {
    end: function () { end(this) },
    write,
    resume: function () { this.error = null; return this },
    close: function () { return this.write(null) },
    flush: function () { flushBuffers(this) }
  }

  const Stream = require('stream').Stream || function () {}

  const streamWraps = sax.EVENTS.filter(ev => !['error', 'end'].includes(ev))

  function createStream(strict, opt) {
    return new SAXStream(strict, opt)
  }

  function SAXStream(strict, opt) {
    if (!(this instanceof SAXStream)) return new SAXStream(strict, opt)

    Stream.apply(this)
    this._parser = new SAXParser(strict, opt)
    this.writable = true
    this.readable = true
    const me = this

    this._parser.onend = function () { me.emit('end') }
    this._parser.onerror = function (er) {
      me.emit('error', er)
      me._parser.error = null
    }

    this._decoder = null

    streamWraps.forEach(function (ev) {
      Object.defineProperty(me, 'on' + ev, {
        get: function () { return me._parser['on' + ev] },
        set: function (h) {
          if (!h) me.removeAllListeners(ev)
          me._parser['on' + ev] = h
          if (h) me.on(ev, h)
          return h
        },
        enumerable: true,
        configurable: false
      })
    })
  }

  SAXStream.prototype = Object.create(Stream.prototype, {
    constructor: { value: SAXStream }
  })

  SAXStream.prototype.write = function (data) {
    if (Buffer.isBuffer && Buffer.isBuffer(data)) {
      if (!this._decoder) {
        const SD = require('string_decoder').StringDecoder
        this._decoder = new SD('utf8')
      }
      data = this._decoder.write(data)
    }

    this._parser.write(data.toString())
    this.emit('data', data)
    return true
  }

  SAXStream.prototype.end = function (chunk) {
    if (chunk && chunk.length) this.write(chunk)
    this._parser.end()
    return true
  }

  SAXStream.prototype.on = function (ev, handler) {
    const me = this
    if (!me._parser['on' + ev] && streamWraps.includes(ev)) {
      me._parser['on' + ev] = function (...args) {
        me.emit(ev, ...args)
      }
    }
    return Stream.prototype.on.call(me, ev, handler)
  }

  const CDATA = '[CDATA['
  const DOCTYPE = 'DOCTYPE'
  const XML_NAMESPACE = 'http://www.w3.org/XML/1998/namespace'
  const XMLNS_NAMESPACE = 'http://www.w3.org/2000/xmlns/'
  const rootNS = { xml: XML_NAMESPACE, xmlns: XMLNS_NAMESPACE }

  const nameStart = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/
  const nameBody = /[:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/
  const entityStart = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD]/
  const entityBody = /[#:_A-Za-z\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02FF\u0370-\u037D\u037F-\u1FFF\u200C-\u200D\u2070-\u218F\u2C00-\u2FEF\u3001-\uD7FF\uF900-\uFDCF\uFDF0-\uFFFD\u00B7\u0300-\u036F\u203F-\u2040.\d-]/

  function isWhitespace(c) { return c === ' ' || c === '\n' || c === '\r' || c === '\t' }
  function isQuote(c) { return c === '"' || c === '\'' }
  function isAttribEnd(c) { return c === '>' || isWhitespace(c) }
  function isMatch(regex, c) { return regex.test(c) }
  function notMatch(regex, c) { return !isMatch(regex, c) }

  let S = 0
  sax.STATE = {
    BEGIN: S++, BEGIN_WHITESPACE: S++, TEXT: S++, TEXT_ENTITY: S++, OPEN_WAKA: S++,
    SGML_DECL: S++, SGML_DECL_QUOTED: S++, DOCTYPE: S++, DOCTYPE_QUOTED: S++,
    DOCTYPE_DTD: S++, DOCTYPE_DTD_QUOTED: S++, COMMENT_STARTING: S++, COMMENT: S++,
    COMMENT_ENDING: S++, COMMENT_ENDED: S++, CDATA: S++, CDATA_ENDING: S++, 
    CDATA_ENDING_2: S++, PROC_INST: S++, PROC_INST_BODY: S++, PROC_INST_ENDING: S++,
    OPEN_TAG: S++, OPEN_TAG_SLASH: S++, ATTRIB: S++, ATTRIB_NAME: S++, 
    ATTRIB_NAME_SAW_WHITE: S++, ATTRIB_VALUE: S++, ATTRIB_VALUE_QUOTED: S++, 
    ATTRIB_VALUE_CLOSED: S++, ATTRIB_VALUE_UNQUOTED: S++, ATTRIB_VALUE_ENTITY_Q: S++, 
    ATTRIB_VALUE_ENTITY_U: S++, CLOSE_TAG: S++, CLOSE_TAG_SAW_WHITE: S++, 
    SCRIPT: S++, SCRIPT_ENDING: S++
  }

  sax.XML_ENTITIES = { 'amp': '&', 'gt': '>', 'lt': '<', 'quot': '"', 'apos': "'" }

  sax.ENTITIES = {
    'amp': '&', 'gt': '>', 'lt': '<', 'quot': '"', 'apos': "'", 'nbsp': 160,
    'iexcl': 161, 'cent': 162, 'pound': 163, 'curren': 164,
    // ... (remaining entities trimmed for brevity)
  }

  Object.keys(sax.ENTITIES).forEach(function (key) {
    const e = sax.ENTITIES[key]
    const s = typeof e === 'number' ? String.fromCharCode(e) : e
    sax.ENTITIES[key] = s
  })

  for (const s in sax.STATE) {
    sax.STATE[sax.STATE[s]] = s
  }

  S = sax.STATE

  function emit(parser, event, data) {
    if (parser[event]) parser[event](data)
  }

  function emitNode(parser, nodeType, data) {
    if (parser.textNode) closeText(parser)
    emit(parser, nodeType, data)
  }

  function closeText(parser) {
    parser.textNode = textopts(parser.opt, parser.textNode)
    if (parser.textNode) emit(parser, 'ontext', parser.textNode)
    parser.textNode = ''
  }

  function textopts(opt, text) {
    if (opt.trim) text = text.trim()
    if (opt.normalize) text = text.replace(/\s+/g, ' ')
    return text
  }

  function error(parser, er) {
    closeText(parser)
    if (parser.trackPosition) {
      er += '\nLine: ' + parser.line + '\nColumn: ' + parser.column + '\nChar: ' + parser.c
    }
    er = new Error(er)
    parser.error = er
    emit(parser, 'onerror', er)
    return parser
  }

  function end(parser) {
    if (parser.sawRoot && !parser.closedRoot) strictFail(parser, 'Unclosed root tag')
    if (![S.BEGIN, S.BEGIN_WHITESPACE, S.TEXT].includes(parser.state)) {
      error(parser, 'Unexpected end')
    }
    closeText(parser)
    parser.c = ''
    parser.closed = true
    emit(parser, 'onend')
    SAXParser.call(parser, parser.strict, parser.opt)
    return parser
  }

  function strictFail(parser, message) {
    if (typeof parser !== 'object' || !(parser instanceof SAXParser)) {
      throw new Error('bad call to strictFail')
    }
    if (parser.strict) {
      error(parser, message)
    }
  }

  function newTag(parser) {
    if (!parser.strict) parser.tagName = parser.tagName[parser.looseCase]()
    const parent = parser.tags[parser.tags.length - 1] || parser
    const tag = parser.tag = { name: parser.tagName, attributes: {} }
    if (parser.opt.xmlns) tag.ns = parent.ns
    parser.attribList.length = 0
    emitNode(parser, 'onopentagstart', tag)
  }

  function qname(name, attribute) {
    const i = name.indexOf(':')
    const qualName = i < 0 ? [ '', name ] : name.split(':')
    let [prefix, local] = qualName
    if (attribute && name === 'xmlns') prefix = 'xmlns', local = ''
    return { prefix, local }
  }

  function attrib(parser) {
    if (!parser.strict) {
      parser.attribName = parser.attribName[parser.looseCase]()
    }
    if (parser.attribList.includes(parser.attribName) ||
        parser.tag.attributes.hasOwnProperty(parser.attribName)) {
      parser.attribName = parser.attribValue = ''
      return
    }

    if (parser.opt.xmlns) {
      const qn = qname(parser.attribName, true)
      const prefix = qn.prefix
      const local = qn.local

      if (prefix === 'xmlns') {
        if (local === 'xml' && parser.attribValue !== XML_NAMESPACE) {
          strictFail(parser, 'xml: prefix must be bound to ' + XML_NAMESPACE + '\nActual: ' + parser.attribValue)
        } else if (local === 'xmlns' && parser.attribValue !== XMLNS_NAMESPACE) {
          strictFail(parser, 'xmlns: prefix must be bound to ' + XMLNS_NAMESPACE + '\nActual: ' + parser.attribValue)
        } else {
          const tag = parser.tag
          const parent = parser.tags[parser.tags.length - 1] || parser
          if (tag.ns === parent.ns) tag.ns = Object.create(parent.ns)
          tag.ns[local] = parser.attribValue
        }
      }
      parser.attribList.push([parser.attribName, parser.attribValue])
    } else {
      parser.tag.attributes[parser.attribName] = parser.attribValue
      emitNode(parser, 'onattribute', { name: parser.attribName, value: parser.attribValue })
    }

    parser.attribName = parser.attribValue = ''
  }

  function openTag(parser, selfClosing) {
    if (parser.opt.xmlns) {
      const tag = parser.tag
      const qn = qname(parser.tagName)
      tag.prefix = qn.prefix
      tag.local = qn.local
      tag.uri = tag.ns[qn.prefix] || ''

      if (tag.prefix && !tag.uri) {
        strictFail(parser, 'Unbound namespace prefix: ' + JSON.stringify(parser.tagName))
        tag.uri = qn.prefix
      }

      const parent = parser.tags[parser.tags.length - 1] || parser
      if (tag.ns && parent.ns !== tag.ns) {
        Object.keys(tag.ns).forEach(function (p) {
          emitNode(parser, 'onopennamespace', { prefix: p, uri: tag.ns[p] })
        })
      }

      parser.attribList.forEach(nv => {
        const [name, value] = nv
        const qualName = qname(name, true)
        const { prefix, local } = qualName
        const uri = prefix === '' ? '' : (tag.ns[prefix] || '')
        const a = { name, value, prefix, local, uri }
        if (prefix && prefix !== 'xmlns' && !uri) {
          strictFail(parser, 'Unbound namespace prefix: ' + JSON.stringify(prefix))
          a.uri = prefix
        }
        parser.tag.attributes[name] = a
        emitNode(parser, 'onattribute', a)
      })
      parser.attribList.length = 0
    }

    parser.tag.isSelfClosing = !!selfClosing
    parser.sawRoot = true
    parser.tags.push(parser.tag)
    emitNode(parser, 'onopentag', parser.tag)
    if (!selfClosing) {
      parser.state = parser.tagName.toLowerCase() === 'script' && !parser.noscript ? S.SCRIPT : S.TEXT
      parser.tag = null
      parser.tagName = ''
    }
    parser.attribName = parser.attribValue = ''
    parser.attribList.length = 0
  }

  function closeTag(parser) {
    if (!parser.tagName) {
      strictFail(parser, 'Weird empty close tag.')
      parser.textNode += '</>'
      parser.state = S.TEXT
      return
    }

    if (parser.script) {
      if (parser.tagName !== 'script') {
        parser.script += '</' + parser.tagName + '>'
        parser.tagName = ''
        parser.state = S.SCRIPT
        return
      }
      emitNode(parser, 'onscript', parser.script)
      parser.script = ''
    }

    const t = parser.tags.length
    let tagName = parser.tagName
    if (!parser.strict) {
      tagName = tagName[parser.looseCase]()
    }
    let closeTo = tagName
    while (parser.tags[--t]) {
      if (parser.tags[t].name !== closeTo) {
        strictFail(parser, 'Unexpected close tag')
      } else break
    }

    if (t < 0) {
      strictFail(parser, 'Unmatched closing tag: ' + parser.tagName)
      parser.textNode += '</' + parser.tagName + '>'
      parser.state = S.TEXT
      return
    }
    parser.tagName = tagName
    let s = parser.tags.length
    while (s-- > t) {
      const tag = parser.tag = parser.tags.pop()
      parser.tagName = parser.tag.name
      emitNode(parser, 'onclosetag', parser.tagName)

      const x = {}
      for (const i in tag.ns) x[i] = tag.ns[i]

      const parent = parser.tags[parser.tags.length - 1] || parser
      if (parser.opt.xmlns && tag.ns !== parent.ns) {
        Object.keys(tag.ns).forEach(function (p) {
          const n = tag.ns[p]
          emitNode(parser, 'onclosenamespace', { prefix: p, uri: n })
        })
      }
    }
    if (t === 0) parser.closedRoot = true
    parser.tagName = parser.attribValue = parser.attribName = ''
    parser.attribList.length = 0
    parser.state = S.TEXT
  }

  function parseEntity(parser) {
    let entity = parser.entity 
    const entityLC = entity.toLowerCase()
    let num, numStr = ''

    if (parser.ENTITIES[entity]) return parser.ENTITIES[entity]
    if (parser.ENTITIES[entityLC]) return parser.ENTITIES[entityLC]
    entity = entityLC
    if (entity[0] === '#') {
      if (entity[1] === 'x') {
        entity = entity.slice(2)
        num = parseInt(entity, 16)
        numStr = num.toString(16)
      } else {
        entity = entity.slice(1)
        num = parseInt(entity, 10)
        numStr = num.toString(10)
      }
    }
    entity = entity.replace(/^0+/, '')
    if (isNaN(num) || numStr.toLowerCase() !== entity) {
      strictFail(parser, 'Invalid character entity')
      return '&' + parser.entity + ';'
    }
    return String.fromCodePoint(num)
  }

  function beginWhiteSpace(parser, c) {
    if (c === '<') {
      parser.state = S.OPEN_WAKA
      parser.startTagPosition = parser.position
    } else if (!isWhitespace(c)) {
      strictFail(parser, 'Non-whitespace before first tag.')
      parser.textNode = c
      parser.state = S.TEXT
    }
  }

  function charAt(chunk, i) {
    return chunk.charAt(i) || ''
  }

  function write(chunk) {
    const parser = this
    if (this.error) throw this.error
    if (parser.closed) return error(parser, 'Cannot write after close. Assign an onready handler.')
    if (chunk === null) return end(parser)
    if (typeof chunk === 'object') chunk = chunk.toString()
    
    let i = 0, c = ''
    while (true) {
      c = charAt(chunk, i++)
      parser.c = c

      if (!c) break

      if (parser.trackPosition) {
        parser.position++
        if (c === '\n') {
          parser.line++
          parser.column = 0
        } else {
          parser.column++
        }
      }

      switch (parser.state) {
        case S.BEGIN:
          parser.state = S.BEGIN_WHITESPACE
          if (c === '\uFEFF') continue
          beginWhiteSpace(parser, c)
          continue

        case S.BEGIN_WHITESPACE:
          beginWhiteSpace(parser, c)
          continue

        case S.TEXT:
          if (parser.sawRoot && !parser.closedRoot) {
            const starti = i - 1
            while (c && c !== '<' && c !== '&') {
              c = charAt(chunk, i++)
              if (c && parser.trackPosition) {
                parser.position++
                if (c === '\n') {
                  parser.line++
                  parser.column = 0
                } else {
                  parser.column++
                }
              }
            }
            parser.textNode += chunk.substring(starti, i - 1)
          }
          if (c === '<' && !(parser.sawRoot && parser.closedRoot && !parser.strict)) {
            parser.state = S.OPEN_WAKA
            parser.startTagPosition = parser.position
          } else {
            if (!isWhitespace(c) && (!parser.sawRoot || parser.closedRoot)) {
              strictFail(parser, 'Text data outside of root node.')
            }
            if (c === '&') {
              parser.state = S.TEXT_ENTITY
            } else {
              parser.textNode += c
            }
          }
          continue

        case S.SCRIPT:
          if (c === '<') parser.state = S.SCRIPT_ENDING
          else parser.script += c
          continue

        case S.SCRIPT_ENDING:
          if (c === '/') parser.state = S.CLOSE_TAG
          else {
            parser.script += '<' + c
            parser.state = S.SCRIPT
          }
          continue

        case S.OPEN_WAKA:
          if (c === '!') {
            parser.state = S.SGML_DECL
            parser.sgmlDecl = ''
          } else if (isWhitespace(c)) {
            continue
          } else if (isMatch(nameStart, c)) {
            parser.state = S.OPEN_TAG
            parser.tagName = c
          } else if (c === '/') {
            parser.state = S.CLOSE_TAG
            parser.tagName = ''
          } else if (c === '?') {
            parser.state = S.PROC_INST
            parser.procInstName = parser.procInstBody = ''
          } else {
            strictFail(parser, 'Unencoded <')
            if (parser.startTagPosition + 1 < parser.position) {
              const pad = parser.position - parser.startTagPosition
              c = new Array(pad).join(' ') + c
            }
            parser.textNode += '<' + c
            parser.state = S.TEXT
          }
          continue

        case S.SGML_DECL:
          if ((parser.sgmlDecl + c).toUpperCase() === CDATA) {
            emitNode(parser, 'onopencdata')
            parser.state = S.CDATA
            parser.sgmlDecl = ''
            parser.cdata = ''
          } else if ((parser.sgmlDecl + c) === '--') {
            parser.state = S.COMMENT
            parser.comment = ''
            parser.sgmlDecl = ''
          } else if ((parser.sgmlDecl + c).toUpperCase() === DOCTYPE) {
            parser.state = S.DOCTYPE
            if (parser.doctype || parser.sawRoot) {
              strictFail(parser, 'Inappropriately located doctype declaration')
            }
            parser.doctype = ''
            parser.sgmlDecl = ''
          } else if (c === '>') {
            emitNode(parser, 'onsgmldeclaration', parser.sgmlDecl)
            parser.sgmlDecl = ''
            parser.state = S.TEXT
          } else if (isQuote(c)) {
            parser.state = S.SGML_DECL_QUOTED
            parser.sgmlDecl += c
          } else {
            parser.sgmlDecl += c
          }
          continue

        case S.SGML_DECL_QUOTED:
          if (c === parser.q) {
            parser.state = S.SGML_DECL
            parser.q = ''
          }
          parser.sgmlDecl += c
          continue

        case S.DOCTYPE:
          if (c === '>') {
            parser.state = S.TEXT
            emitNode(parser, 'ondoctype', parser.doctype)
            parser.doctype = true
          } else {
            parser.doctype += c
            if (c === '[') parser.state = S.DOCTYPE_DTD
            else if (isQuote(c)) {
              parser.state = S.DOCTYPE_QUOTED
              parser.q = c
            }
          }
          continue

        case S.DOCTYPE_QUOTED:
          parser.doctype += c
          if (c === parser.q) {
            parser.q = ''
            parser.state = S.DOCTYPE
          }
          continue

        case S.DOCTYPE_DTD:
          parser.doctype += c
          if (c === ']') parser.state = S.DOCTYPE
          else if (isQuote(c)) {
            parser.state = S.DOCTYPE_DTD_QUOTED
            parser.q = c
          }
          continue

        case S.DOCTYPE_DTD_QUOTED:
          parser.doctype += c
          if (c === parser.q) {
            parser.state = S.DOCTYPE_DTD
            parser.q = ''
          }
          continue

        case S.COMMENT:
          if (c === '-') parser.state = S.COMMENT_ENDING
          else parser.comment += c
          continue

        case S.COMMENT_ENDING:
          if (c === '-') {
            parser.state = S.COMMENT_ENDED
            parser.comment = textopts(parser.opt, parser.comment)
            if (parser.comment) emitNode(parser, 'oncomment', parser.comment)
            parser.comment = ''
          } else {
            parser.comment += '-' + c
            parser.state = S.COMMENT
          }
          continue

        case S.COMMENT_ENDED:
          if (c !== '>') {
            strictFail(parser, 'Malformed comment')
            parser.comment += '--' + c
            parser.state = S.COMMENT
          } else {
            parser.state = S.TEXT
          }
          continue

        case S.CDATA:
          if (c === ']') parser.state = S.CDATA_ENDING
          else parser.cdata += c
          continue

        case S.CDATA_ENDING:
          if (c === ']') parser.state = S.CDATA_ENDING_2
          else {
            parser.cdata += ']' + c
            parser.state = S.CDATA
          }
          continue

        case S.CDATA_ENDING_2:
          if (c === '>') {
            if (parser.cdata) emitNode(parser, 'oncdata', parser.cdata)
            emitNode(parser, 'onclosecdata')
            parser.cdata = ''
            parser.state = S.TEXT
          } else if (c === ']') {
            parser.cdata += ']'
          } else {
            parser.cdata += ']]' + c
            parser.state = S.CDATA
          }
          continue

        case S.PROC_INST:
          if (c === '?') parser.state = S.PROC_INST_ENDING
          else if (isWhitespace(c)) parser.state = S.PROC_INST_BODY
          else parser.procInstName += c
          continue

        case S.PROC_INST_BODY:
          if (!parser.procInstBody && isWhitespace(c)) continue
          else if (c === '?') parser.state = S.PROC_INST_ENDING
          else parser.procInstBody += c
          continue

        case S.PROC_INST_ENDING:
          if (c === '>') {
            emitNode(parser, 'onprocessinginstruction', { name: parser.procInstName, body: parser.procInstBody })
            parser.procInstName = parser.procInstBody = ''
            parser.state = S.TEXT
          } else {
            parser.procInstBody += '?' + c
            parser.state = S.PROC_INST_BODY
          }
          continue

        case S.OPEN_TAG:
          if (isMatch(nameBody, c)) parser.tagName += c
          else {
            newTag(parser)
            if (c === '>') openTag(parser)
            else if (c === '/') parser.state = S.OPEN_TAG_SLASH
            else if (!isWhitespace(c)) strictFail(parser, 'Invalid character in tag name')
            else parser.state = S.ATTRIB
          }
          continue

        case S.OPEN_TAG_SLASH:
          if (c === '>') {
            openTag(parser, true)
            closeTag(parser)
          } else {
            strictFail(parser, 'Forward-slash in opening tag not followed by >')
            parser.state = S.ATTRIB
          }
          continue

        case S.ATTRIB:
          if (isWhitespace(c)) continue
          else if (c === '>') openTag(parser)
          else if (c === '/') parser.state = S.OPEN_TAG_SLASH
          else if (isMatch(nameStart, c)) {
            parser.attribName = c
            parser.attribValue = ''
            parser.state = S.ATTRIB_NAME
          } else {
            strictFail(parser, 'Invalid attribute name')
          }
          continue

        case S.ATTRIB_NAME:
          if (c === '=') parser.state = S.ATTRIB_VALUE
          else if (c === '>') {
            strictFail(parser, 'Attribute without value')
            parser.attribValue = parser.attribName
            attrib(parser)
            openTag(parser)
          } else if (isWhitespace(c)) parser.state = S.ATTRIB_NAME_SAW_WHITE
          else if (isMatch(nameBody, c)) parser.attribName += c
          else strictFail(parser, 'Invalid attribute name')
          continue

        case S.ATTRIB_NAME_SAW_WHITE:
          if (c === '=') parser.state = S.ATTRIB_VALUE
          else if (isWhitespace(c)) continue
          else {
            strictFail(parser, 'Attribute without value')
            parser.tag.attributes[parser.attribName] = ''
            parser.attribValue = ''
            emitNode(parser, 'onattribute', { name: parser.attribName, value: '' })
            parser.attribName = ''
            if (c === '>') openTag(parser)
            else if (isMatch(nameStart, c)) {
              parser.attribName = c
              parser.state = S.ATTRIB_NAME
            } else {
              strictFail(parser, 'Invalid attribute name')
              parser.state = S.ATTRIB
            }
          }
          continue

        case S.ATTRIB_VALUE:
          if (isWhitespace(c)) continue
          else if (isQuote(c)) {
            parser.q = c
            parser.state = S.ATTRIB_VALUE_QUOTED
          } else {
            strictFail(parser, 'Unquoted attribute value')
            parser.state = S.ATTRIB_VALUE_UNQUOTED
            parser.attribValue = c
          }
          continue

        case S.ATTRIB_VALUE_QUOTED:
          if (c !== parser.q) {
            if (c === '&') parser.state = S.ATTRIB_VALUE_ENTITY_Q
            else parser.attribValue += c
            continue
          }
          attrib(parser)
          parser.q = ''
          parser.state = S.ATTRIB_VALUE_CLOSED
          continue

        case S.ATTRIB_VALUE_CLOSED:
          if (isWhitespace(c)) parser.state = S.ATTRIB
          else if (c === '>') openTag(parser)
          else if (c === '/') parser.state = S.OPEN_TAG_SLASH
          else if (isMatch(nameStart, c)) {
            strictFail(parser, 'No whitespace between attributes')
            parser.attribName = c
            parser.attribValue = ''
            parser.state = S.ATTRIB_NAME
          } else {
            strictFail(parser, 'Invalid attribute name')
          }
          continue

        case S.ATTRIB_VALUE_UNQUOTED:
          if (!isAttribEnd(c)) {
            if (c === '&') parser.state = S.ATTRIB_VALUE_ENTITY_U
            else parser.attribValue += c
            continue
          }
          attrib(parser)
          if (c === '>') openTag(parser)
          else parser.state = S.ATTRIB
          continue

        case S.CLOSE_TAG:
          if (!parser.tagName) {
            if (isWhitespace(c)) continue
            else if (notMatch(nameStart, c)) {
              if (parser.script) {
                parser.script += '</' + c
                parser.state = S.SCRIPT
              } else strictFail(parser, 'Invalid tagname in closing tag.')
            } else parser.tagName = c
          } else if (c === '>') closeTag(parser)
          else if (isMatch(nameBody, c)) parser.tagName += c
          else if (parser.script) {
            parser.script += '</' + parser.tagName
            parser.tagName = ''
            parser.state = S.SCRIPT
          } else {
            if (!isWhitespace(c)) strictFail(parser, 'Invalid tagname in closing tag')
            parser.state = S.CLOSE_TAG_SAW_WHITE
          }
          continue

        case S.CLOSE_TAG_SAW_WHITE:
          if (isWhitespace(c)) continue
          if (c === '>') closeTag(parser)
          else strictFail(parser, 'Invalid characters in closing tag')
          continue

        case S.TEXT_ENTITY:
        case S.ATTRIB_VALUE_ENTITY_Q:
        case S.ATTRIB_VALUE_ENTITY_U:
          let returnState, buffer
          switch (parser.state) {
            case S.TEXT_ENTITY: returnState = S.TEXT; buffer = 'textNode'; break
            case S.ATTRIB_VALUE_ENTITY_Q: returnState = S.ATTRIB_VALUE_QUOTED; buffer = 'attribValue'; break
            case S.ATTRIB_VALUE_ENTITY_U: returnState = S.ATTRIB_VALUE_UNQUOTED; buffer = 'attribValue'; break
          }

          if (c === ';') {
            parser[buffer] += parseEntity(parser)
            parser.entity = ''
            parser.state = returnState
          } else if (isMatch(parser.entity.length ? entityBody : entityStart, c)) {
            parser.entity += c
          } else {
            strictFail(parser, 'Invalid character in entity name')
            parser[buffer] += '&' + parser.entity + c
            parser.entity = ''
            parser.state = returnState
          }
          continue

        default:
          throw new Error(parser, 'Unknown state: ' + parser.state)
      }
    }

    if (parser.position >= parser.bufferCheckPosition) checkBufferLength(parser)
    return parser
  }

  if (!String.fromCodePoint) {
    (function () {
      const stringFromCharCode = String.fromCharCode
      const floor = Math.floor
      const fromCodePoint = function () {
        const MAX_SIZE = 0x4000
        const codeUnits = []
        let highSurrogate, lowSurrogate
        let index = -1
        const length = arguments.length
        if (!length) return ''
        let result = ''
        while (++index < length) {
          let codePoint = Number(arguments[index])
          if (!isFinite(codePoint) || codePoint < 0 || codePoint > 0x10FFFF || floor(codePoint) !== codePoint) {
            throw RangeError('Invalid code point: ' + codePoint)
          }
          if (codePoint <= 0xFFFF) {
            codeUnits.push(codePoint)
          } else {
            codePoint -= 0x10000
            highSurrogate = (codePoint >> 10) + 0xD800
            lowSurrogate = (codePoint % 0x400) + 0xDC00
            codeUnits.push(highSurrogate, lowSurrogate)
          }
          if (index + 1 === length || codeUnits.length > MAX_SIZE) {
            result += stringFromCharCode.apply(null, codeUnits)
            codeUnits.length = 0
          }
        }
        return result
      }
      if (Object.defineProperty) {
        Object.defineProperty(String, 'fromCodePoint', {
          value: fromCodePoint,
          configurable: true,
          writable: true
        })
      } else {
        String.fromCodePoint = fromCodePoint
      }
    }())
  }
})(typeof exports === 'undefined' ? this.sax = {} : exports)
