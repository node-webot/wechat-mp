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
  if (!query) return false
  var sig = query.signature
  return query.signature === calcSig(token, query.timestamp, query.nonce)
}


function Wechat(options) {
  if (!(this instanceof Wechat)) {
    return new Wechat(options)
  }
  options = options || {}
  if ('string' == typeof options) {
    options = {token: options}
  }
  options.tokenProp = options.tokenProp || 'wx_token'
  this.options = options

  return this
}

/**
 * To parse wechat xml requests to webot Info realy-to-use Object.
 */
Wechat.prototype.start =
Wechat.prototype.parser = function bodyParser(opts) {
  var self = this, opts = opts || {}
  var tokenProp = opts.tokenProp || self.options.tokenProp
  var generateSid

  if (opts.session != false) {
    generateSid = function(data) {
      return ['wx', data.sp, data.uid].join('.')
    }
  }

  return function(req, res, next) {
    if (req.body) {
      // data already set, pass
      return next()
    }
    var token = req[tokenProp] || opts.token
    if (!checkSig(token, req.query)) {
      return Wechat.block(res)
    }
    if (req.method == 'GET') {
      return res.end(req.query.echostr)
    }
    if (req.method == 'HEAD') {
      return res.end()
    }
    Wechat.parse(req, function(err, data) {
      if (err) {
        res.statusCode = 400
        return res.end()
      }
      req.body = data
      if (generateSid) {
        var sid = generateSid(data)
        // always return the same sessionID for a given service_provider+subscriber
        var propdef = {
          get: function(){ return sid },
          set: function(){ }
        }
        Object.defineProperty(req, 'sessionID', propdef)
        Object.defineProperty(req, 'sessionId', propdef)
      }
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
    res.setHeader('Content-Type', 'application/xml')
    res.end(Wechat.dump(res.body))
  }
}

Wechat.parse = function(req, callback) {
  var b = ''
  req.on('data', function(data) { b += data })
  req.on('end', function() {
    var data
    try {
      data = Wechat.load(b)
    } catch (e) {
      return callback(e)
    }
    callback(null, data)
  })
}

/**
 * Block unsignatured request
 */
Wechat.block = function endRes(res) {
  res.statusCode = 401
  res.end('Invalid signature')
}

/**
 * Check signature
 */
Wechat.checkSignature = checkSig

/**
 * parse xml string
 */
Wechat.load = mp_xml.parse

/**
 * dump reply as xml string
 */
Wechat.dump = mp_xml.build


module.exports = Wechat
