var crypto = require('crypto')

var mp_xml = require('./xml')

function calcSig(token, timestamp, nonce) {
  var s = [token, timestamp, nonce].sort().join('')
  return crypto.createHash('sha1').update(s).digest('hex')
}

/**
 * Check signature
 */
function checkSig(token, query) {
  query = query || {}
  var sig = query.signature
  return query.signature === calcSig(token, query.timestamp, query.nonce)
}


function Wechat(options) {
  if (!(this instanceof Wechat)) {
    return new Wechat(options)
  }
  if ('string' == typeof options) {
    options = {token: options}
  }
  options.prop = options.prop || 'wx_data'
  this.options = options

  return this
}

Wechat.block = function endRes(res) {
  res.statusCode = 401
  res.end('invalid signature')
}

/**
 * To parse wechat xml requests to webot Info realy-to-use Object.
 */
Wechat.prototype.start =
Wechat.prototype.parser = function bodyParser(opts) {
  var self = this, opts = opts || {}
  var prop = opts.prop || self.options.prop
  var tokenProp = opts.tokenProp || self.options.tokenProp
  var generateSid

  if (opts.session != false) {
    generateSid = function(data) {
      return ['wx', data.sp, data.uid].join('.')
    }
  }

  return function(req, res, next) {
    if (req[prop]) {
      // data already set, pass
      return next()
    }
    var token = req[tokenProp] || opts.token
    if (!checkSig(token, req.query)) {
      return Wechat.block(res)
    }
    if (req.method == 'GET') {
      return req.query.echostr
    }
    var b = ''
    req.on('data', function(data) { b += data })
    req.on('end', function() {
      var data
      try {
        data = Wechat.load(b)
      } catch (e) {
        res.statusCode = 400
        return res.end()
      }
      req[prop] = data
      var sid = generateSid(data)
      Object.defineProperty(req, 'sessionID', { value: sid })
      Object.defineProperty(req, 'sessionId', { value: sid })
      next()
    })
  }
}

/**
 * to build reply object as xml string
 */
Wechat.prototype.end =
Wechat.prototype.responder = function responder() {
  return function(req, res, next) {
    res.type('xml')
    res.end(Wechat.dump(res.body))
  }
}

/**
 * parse xml string
 */
Wechat.load = mp_xml.parse

/**
 * dump reply as xml string
 */
Wechat.dump = mp_xml.build


module.exports = Wechat
