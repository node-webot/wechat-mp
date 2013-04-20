/*global beforeEach:false, it:false, describe:false */

var should = require('should');
var mp = require('../');
var lodash_tmp = require('lodash-template');

var noop = function(){};

var tpl = lodash_tmp([
  '<xml>',
    '<ToUserName><![CDATA[<%= sp %>]]></ToUserName>',
    '<FromUserName><![CDATA[<%= uid  %>]]></FromUserName>',
    '<CreateTime><%= (Math.floor(new Date().getTime() / 1000)) %></CreateTime>',
    '<MsgType><![CDATA[<%= type %>]]></MsgType>',
    '<% if(type=="text"){  %>',
      '<Content><![CDATA[<%= text %>]]></Content>',
    '<% }else if(type=="location"){   %>',
      '<Location_X><%= lat %></Location_X>',
      '<Location_Y><%= lng %></Location_Y>',
      '<Scale><%= scale %></Scale>',
      '<Label><![CDATA[<%= label %>]]></Label>',
    '<% }else if(type=="event"){   %>',
      '<Event><![CDATA[<%= event %>]]></Event>',
      '<EventKey><![CDATA[<%= eventKey %>]]></EventKey>',
    '<% }else if(type=="link"){   %>',
      '<Title><![CDATA[<%= title %>]]></Title>',
      '<Description><![CDATA[<%= description %>]]></Description>',
      '<Url><![CDATA[<%= url %>]]></Url>',
    '<% }else if(type=="image"){   %>',
      '<PicUrl><![CDATA[<%= pic %>]]></PicUrl>',
    '<% }  %>',
  '</xml>'
].join(''));

function defaults(a, b) {
  for (var key in b) {
    if (!(key in a)) {
      a[key] = b[key];
    }
  }
}

function getXML(info){
  defaults(info, {
    sp: 'webot',
    uid: 'client'
  });

  return tpl(info);
}

//测试编码/解码
describe('xml2json', function(){
  var bodyParser = mp.bodyParser();
  var mockReq, mockRes;

  beforeEach(function(){
    mockReq = {
      setEncoding: noop,
      wx_data: null,
      on: noop
    };
    mockRes = {};
  });

  it('should pass text', function(){
    var info = {
      type: 'text',
      text: 'hi'
    };
    mockReq.on = function(e, cb){
      if(e == 'data'){
        cb(getXML(info));
      }else if(e == 'end'){
        cb();
      }
    };
    bodyParser(mockReq, mockRes, function(err){
      should.exist(mockReq.wx_data);
      should.ok(mockReq.wx_data.created);
      mockReq.wx_data.created.should.be.an.instanceof(Date);
      should.equal(mockReq.wx_data.sp, info.sp);
      should.equal(mockReq.wx_data.uid, info.uid);
      should.equal(mockReq.wx_data.type, info.type);
      should.equal(mockReq.wx_data.text, info.text);
    });
  });

  it('should pass location', function(){
    var info = {
      type: 'location',
      lat: '23.08',
      lng: '113.24',
      scale: '20',
      label: 'this is a location'
    };
    mockReq.on = function(e, cb){
      if(e == 'data'){
        cb(getXML(info));
      }else if(e == 'end'){
        cb();
      }
    };
    bodyParser(mockReq, mockRes, function(err){
      should.exist(mockReq.wx_data);
      should.exist(mockReq.wx_data.param);
      should.equal(mockReq.wx_data.original.MsgType, info.type);
      should.equal(mockReq.wx_data.original.Location_X, info.lat);
      should.equal(mockReq.wx_data.param.lng, info.lng);
      should.equal(mockReq.wx_data.param.scale, info.scale);
      should.equal(mockReq.wx_data.param.label, info.label);
    });
  });

  it('should pass image', function(){
    var info = {
      type: 'image',
      pic: 'http://example.com/pic.jpg'
    };
    mockReq.on = function(e, cb){
      if(e == 'data'){
        cb(getXML(info));
      }else if(e == 'end'){
        cb();
      }
    };
    bodyParser(mockReq, mockRes, function(err){
      should.exist(mockReq.wx_data);
      should.equal(mockReq.wx_data.type, info.type);
      should.equal(mockReq.wx_data.param.picUrl, info.pic);
    });
  });

  it('should pass event', function(){
    var info = {
      type: 'event',
      event: 'click',
      eventKey: 'test_key',
    };
    mockReq.on = function(e, cb){
      if(e == 'data'){
        cb(getXML(info));
      }else if(e == 'end'){
        cb();
      }
    };
    bodyParser(mockReq, mockRes, function(err){
      should.exist(mockReq.wx_data);
      should.equal(mockReq.wx_data.param.event, info.event);
      should.equal(mockReq.wx_data.param.eventKey, info.eventKey);
    });
  });

  it('should pass link', function(){
    var info = {
      type: 'link',
      title: 'Link title here',
      url: 'http://example.com/',
      description: 'Hahahah....',
    };
    mockReq.on = function(e, cb){
      if(e == 'data'){
        cb(getXML(info));
      }else if(e == 'end'){
        cb();
      }
    };
    bodyParser(mockReq, mockRes, function(err){
      should.exist(mockReq.wx_data);
      should.equal(mockReq.wx_data.param.title, info.title);
      should.equal(mockReq.wx_data.param.url, info.url);
      should.equal(mockReq.wx_data.param.description, info.description);
    });
  });
  it('should return parser error', function(){
    mockReq.on = function(e, cb){
      cb();
    };
    bodyParser(mockReq, mockRes, function(err){
      should.exist(err);
    });
  });

});
