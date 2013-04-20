var lodash_tmpl = require('lodash-template');
var xml2js = require('xml2js');
var xmlParser = new xml2js.Parser();

// convert weixin props to
// standard more human readable names
var propMap = {
    FromUserName: 'uid'
  , ToUserName: 'sp'
  , MsgId: 'id'
  , MsgType: 'type'
  , Content: 'text'
};
var paramMap = {
    Location_X: 'lat'
  , Location_Y: 'lng'
  , Scale: 'scale'
  , Label: 'label'
  , PicUrl: 'picUrl'
  , Event: 'event'
  , EventKey: 'eventKey'
  , Url: 'url'
  , Title: 'title'
  , Description: 'description'
};

function parseXml(b, options, cb) {
  options = options || {};

  var pmap = options.propMap|| propMap;
  var mmap = options.paramMap || paramMap;

  xmlParser.parseString(b, function(err, result) {
    if (err || !result || !result.xml) {
      console.error('Bad request', err, err.stack);
      return cb(err || 400);
    }
    var original = result.xml;
    var param = {};

    var data = {
      original: original,
      param: param
    };

    var key, val;
    for (key in original) {
      val = original[key];
      // normalize for xml2js
      if (val.length === 1) {
        val = original[key] = val[0]
      }
      if (key in pmap) {
        data[pmap[key]] = val;
      } else if (key in mmap) {
        param[mmap[key]] = val;
      } else {
        data[key] = val;
      }
    }
    data.created = new Date(parseInt(original.CreateTime, 10) * 1000);
    cb(null, data);
  });
}

var info2xml = lodash_tmpl([
  '<xml>',
    '<ToUserName><![CDATA[<%= uid %>]]></ToUserName>',
    '<FromUserName><![CDATA[<%= sp %>]]></FromUserName>',
    '<CreateTime><%= (Math.floor(new Date().getTime() / 1000)) %></CreateTime>',
    '<FuncFlag><%= flag ? 1 : 0 %></FuncFlag>',
    '<% if(Array.isArray(reply)){ %>',
      '<MsgType><![CDATA[news]]></MsgType>',
      '<ArticleCount><%= reply.length %></ArticleCount>',
      '<Articles>',
        '<% reply.forEach(function(item){ %>',
          '<item>',
            '<Title><![CDATA[<%= item.title %>]]></Title>',
            '<Description><![CDATA[<%= item.description %>]]></Description>',
            '<PicUrl><![CDATA[<%= item.picUrl || item.pic %>]]></PicUrl>',
            '<Url><![CDATA[<%= item.url %>]]></Url>',
          '</item>',
        '<% }); %>',
      '</Articles>',
    '<% } else if (reply.type === "music") { %>',
      '<MsgType><![CDATA[music]]></MsgType>',
      '<MusicUrl><![CDATA[<%=reply.MusicUrl || reply.url%>]]></MusicUrl>',
      '<HQMusicUrl><![CDATA[<%=reply.HQMusicUrl || reply.hq_url%>]]></HQMusicUrl>',
    '<% } else { %>',
      '<MsgType><![CDATA[text]]></MsgType>',
      '<Content><![CDATA[<%=String(reply)%>]]></Content>',
    '<% } %>',
  '</xml>'
].join(''));


module.exports = {
  parser: parseXml,
  builder: info2xml
};
