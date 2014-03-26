var should = require('should')
var supertest = require('supertest')
var express = require('express')
var crypto = require('crypto')

var Wechat = require('../')


function calcSig(token, timestamp, nonce) {
  var s = [token, timestamp, nonce].sort().join('')
  return crypto.createHash('sha1').update(s).digest('hex')
}


describe('wechat-mp', function() {

  var mp, app, req

  supertest.Test.prototype.addsig = function addsig(token) {
    var query = {
      echostr: 'abc',
      timestamp: +new Date(),
      nounce: Math.random()
    }
    query.signature = calcSig(token, query.timestamp, query.nonce)
    return this.query(query)
  }

  beforeEach(function() {
    app = express()
    request = supertest(app)
  })

  it('should block', function(done) {
    mp = Wechat('abc')
    app.use(mp.start())
    request.get('/')
      .expect(401, done)
  })

  it('should accept token', function(done) {
    mp = Wechat('abc')
    app.use(mp.start())
    test_valid_token('abc', done)
  })

  it('should accept token on .start()', function(done) {
    app.use(mp.start('token'))
    test_valid_token('token', done)
  })

  it('should accept options.tokenProp', function(done) {
    app.use(function(req, res, next) {
      req.wx = 'tokk'
      next()
    })
    app.use(mp.start({tokenProp: 'wx'}))
    test_valid_token('tokk', done)
  })

  it('should accept options.dataProp', function(done) {
    var err = null
    app.use(mp.start({token: 'dataprop', dataProp: 'wx_data'}))
    app.use(function(req, res, next) {
      try {
        req.wx_data.type.should.eql('text')
      } catch (e) {
        err = e
      }
      next()
    })
    app.use(mp.end())
    test_send_message('dataprop', function() {
      if (err) {
        throw err
      }
      done()
    })
  })

  it('should end response', function(done) {
    app.use(function(req, res, next) {
      res.body = {
        content: 'abc'
      }
      next()
    })
    app.use(mp.end())
    request.post('/')
      .expect(200)
      .end(function(req, res) {
        res.text.should.include('<![CDATA[abc]]>')
        done()
      })
  })

  it('should handle empty response', function(done) {
    app.use(mp.end())
    test_send_message('', done)
  })

  function test_valid_token(token, done) {
    return request.get('/')
      .addsig(token)
      .expect(200, done)
  }

  function test_send_message(token, done) {
    return request.post('/')
      .addsig(token)
      .send('<xml><MsgType>text</MsgType></xml>')
      .expect('Content-Type', 'application/xml')
      .expect(200, done)
  }

})
