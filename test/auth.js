/*global beforeEach:false, it:false, describe:false */

var should = require('should');
var mp = require('../');

//测试鉴权
describe('auth', function(){


  var checkSig = mp.checkSig('keyboardcat123', function(res) {
    res.blocked = true;
  });
  var mockReq, mockRes;
 
  beforeEach(function(){
    mockReq = {
      method: 'GET',
      query: {
        timestamp: '1358482535021',
        nonce: '46943956264',
        echostr: 'echostr_2806854154',
        signature: '5b423de6127242a3b98b2f14207b5c881854bd69'
      }
    };
    mockRes = {
      blocked: false,
      statusCode: '',
      end: function(str){
        mockRes.echostr = str;
      },
      json: function(obj){
        mockRes.json = obj;
      }
    };
  });

  it('should pass good when get', function(){
    checkSig(mockReq, mockRes, null);
    mockRes.echostr.should.equal(mockReq.query.echostr);
  });

  it('should pass next when post', function(done){
    mockReq.method = 'POST';
    checkSig(mockReq, mockRes, function(){
      mockRes.statusCode.toString().should.not.equal('403');
      should.equal(mockRes.blocked, false);
      done();
    });
  });

  it('should block incorrent signature', function(){
    mockReq.query.signature = 'abc';
    checkSig(mockReq, mockRes);
    should.equal(mockRes.blocked, true);
  });

  it('should block when post without auth', function(){
    mockReq.method = 'POST';
    mockReq.query = {};
    checkSig(mockReq, mockRes);
    should.equal(mockRes.blocked, true);
  });

});
