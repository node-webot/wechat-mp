var should = require('should')
var http = require('http')
var Wechat = require('../')

describe('wechat-mp', function() {

  var server = http.createServer()
  var mp = Wechat('abc')
  var port = process.env.TEST_PORT || 3111

  before(function(done) {
    server.listen(port, done)
  })

  function run(middleware, deco, callback) {
    if (!callback) {
      callback = deco
      deco = function() {}
    }
    server.once('request', function(req, res) {
      deco(req, res)
      middleware(req, res, function() {
        res.end()
      })
    })
    var req = http.request({
      port: port,
      method: 'POST',
      path: '/'
    }, callback)
    return req
  }

  it('should block', function(done) {
    var mp = Wechat({ tokenProp: 'wxx' })
    var req = run(mp.start(), function(message) {
      message.statusCode.should.eql(401)
      should.not.exist(req.body)
      done()
    })
    req.end()
  })

  it('should end response', function(done) {
    var req = run(mp.end(), function(req, res) {
      req.body = {}
    }, function(message) {
      message.on('data', function(data) {
        // consume the data to resume stream
      })
      message.on('end', function() {
        message.headers['content-type'].should.eql('application/xml')
        done()
      })
    })
    req.end()
  })

})
