var crypto = require('crypto');

var mp_xml = require('./xml');

function calcSig(token, timestamp, nonce) {
  var s = [token, timestamp, nonce].sort().join('');
  return crypto.createHash('sha1').update(s).digest('hex');
}

function endRes(res) {
  res.statusCode = 403;
  res.json({ r: 403, msg: 'check signature failed.' });
}

/**
 * Check signature of request.
 */
function checkSig(token, block) {
  block = block || endRes;
  return function checkSig(req, res, next) {
    var query = req.query || {};
    var sig = query.signature;
    if (query.signature === calcSig(token, query.timestamp, query.nonce)) {
      if (req.method == 'GET') return res.end(query.echostr);
      return next();
    }
    return block(res);
  };
}

/**
 * To parse wechat xml requests to webot Info realy-to-use Object.
 */
function bodyParser(options) {
  options = options || {};

  return function(req, res, next) {
    var b = '';
    req.setEncoding('utf-8');
    req.on('data', function(data) {
      b += data;
    });
    req.on('end', function() {
      mp_xml.parser(b, options, function(err, data) {
        req.wx_data = data;
        next(err);
      });
    });
  };
}

/**
 * to build reply object as xml string
 */
function resBuilder() {
  return function(req, res, next) {
    res.type('xml');
    res.send(mp_xml.builder(res.wx_data));
  }
}

module.exports = {
  calcSig: calcSig,
  checkSig: checkSig,
  parseXml: mp_xml.parser,
  info2xml: mp_xml.builder,
  bodyParser: bodyParser,
  resBuilder: resBuilder
};
