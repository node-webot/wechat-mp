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
  var req, res;

  beforeEach(function(){
    req = {
      setEncoding: noop,
      wx_data: null,
      on: noop
    };
    res = {};
  });

  it('should pass text', function(done){
    var info = {
      type: 'text',
      text: 'hi'
    };
    req.on = function(e, cb){
      if(e == 'data'){
        cb(getXML(info));
      }else if(e == 'end'){
        cb();
      }
    };
    bodyParser(req, res, function(err){
      should.exist(req.wx_data);
      should.ok(req.wx_data.created);
      req.wx_data.created.should.be.an.instanceof(Date);
      should.equal(req.wx_data.sp, info.sp);
      should.equal(req.wx_data.uid, info.uid);
      should.equal(req.wx_data.type, info.type);
      should.equal(req.wx_data.text, info.text);
      done();
    });
  });

  it('should pass location', function(done){
    var info = {
      type: 'location',
      lat: '23.08',
      lng: '113.24',
      scale: '20',
      label: 'this is a location'
    };
    req.on = function(e, cb){
      if(e == 'data'){
        cb(getXML(info));
      }else if(e == 'end'){
        cb();
      }
    };
    bodyParser(req, res, function(err){
      should.exist(req.wx_data);
      should.exist(req.wx_data.param);
      should.equal(req.wx_data.original.MsgType, info.type);
      should.equal(req.wx_data.original.Location_X, info.lat);
      should.equal(req.wx_data.param.lng, info.lng);
      should.equal(req.wx_data.param.scale, info.scale);
      should.equal(req.wx_data.param.label, info.label);
      done();
    });
  });

  it('should pass image', function(done){
    var info = {
      type: 'image',
      pic: 'http://example.com/pic.jpg'
    };
    req.on = function(e, cb){
      if(e == 'data'){
        cb(getXML(info));
      }else if(e == 'end'){
        cb();
      }
    };
    bodyParser(req, res, function(err){
      should.exist(req.wx_data);
      should.equal(req.wx_data.type, info.type);
      should.equal(req.wx_data.param.picUrl, info.pic);
      done();
    });
  });

  it('should pass event', function(done){
    var info = {
      type: 'event',
      event: 'click',
      eventKey: 'test_key',
    };
    req.on = function(e, cb){
      if(e == 'data'){
        cb(getXML(info));
      }else if(e == 'end'){
        cb();
      }
    };
    bodyParser(req, res, function(err){
      should.exist(req.wx_data);
      should.equal(req.wx_data.param.event, info.event);
      should.equal(req.wx_data.param.eventKey, info.eventKey);
      done();
    });
  });

  it('should pass link', function(done){
    var info = {
      type: 'link',
      title: 'Link title here',
      url: 'http://example.com/',
      description: 'Hahahah....',
    };
    req.on = function(e, cb){
      if(e == 'data'){
        cb(getXML(info));
      }else if(e == 'end'){
        cb();
      }
    };
    bodyParser(req, res, function(err){
      should.exist(req.wx_data);
      should.equal(req.wx_data.param.title, info.title);
      should.equal(req.wx_data.param.url, info.url);
      should.equal(req.wx_data.param.description, info.description);
      done();
    });
  });
  it('should return parser error', function(done){
    req.on = function(e, cb){
      cb();
    };
    bodyParser(req, res, function(err){
      should.exist(err);
      done();
    });
  });
});

describe('builder', function() {
  var builder = mp.resBuilder();
  var req, res;

  beforeEach(function(){
    req = {};
    res = {
      wx_data: {
        sp: 'webot',
        uid: 'user_here',
        text: 'Hehehor'
      },
      send: noop,
      type: noop,
    };
  });

  it('should pass text reply', function(done) {
    res.wx_data.reply = 'Hello';
    res.send = function(str) {
      mp.parseXml(str, {}, function(err, obj) {
        should.not.exists(err);
        should.equal(obj.original.Content, 'Hello');
        done();
      });
    };
    builder(req, res);
  });

});
