# wechat-mp 微信公众平台API辅助工具 [![Build Status](https://travis-ci.org/node-webot/wechat-mp.png?branch=master)](https://travis-ci.org/node-webot/wechat-mp)

Utilities for wechat media platform.

## Express Middlewares

```javascript
var mp = require('wechat-mp');
var app = require('express')();

// set your wechat api token here.
var verify = mp.checkSig(process.env.WX_TOKEN);

app.get('/wechat', verify);
app.post('/wechat', verify, mp.bodyParser(), function(req, res, next) {
  console.log(req.wx_data);

  var data = req.wx_data;

  data.reply = 'Hi.';
  res.wx_data = data;
}, mp.resBuilder());
```

Hey, why don't you dive into the source code? It's pretty simple.

### mp.bodyParser( *[options]* )

`bodyParser()` will parse wechat request XML to a JavaScript object.
and attach the result to **req.wx_data**.

`data.original` will be the original object parsed by xml2js.
Common parameters will be set as `data` properties directly.
Parameters for different type of messages will be stored in
`data.param`.

For the convinience of integerating with [webot](https://github.com/node-webot/webot),
all parameters will be mapped to more JavaScript like names.

You can use `options.propMap` and `options.paramMap` to override
the default mapping.

#### options.propMap

```javascript
{
    FromUserName: 'uid'
  , ToUserName: 'sp'
  , MsgId: 'id'
  , MsgType: 'type'
  , Content: 'text'
};
```

#### options.paramMap

```javascript
{
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
```

### mp.resBuilder([mapping])

Build a xml string for wechat server, and send it. 

Just attrive the original `req.wx_data`, set a `data.reply`,
then attach it to `res.wx_data`.

With different kind of `data.reply`, you can send different type of message.

- **{Array}**   Multiple image-text message.
- **{String}**  Simple text message.
- **{Object}**  Return special type of message if `reply.type` is setted, otherwise return an image-text message. 

#### mapping

You can set a mapping object/function to preprocess each item of an array of
image-text message.

`mapping` could be:

- {Function}  对每一条图文消息（item）都执行 `mapping(item, i, info)`
- {Object}    标准属性值与回复对象属性值的对应关系

Example:

```javascript
var mapping = {
  pic: 'image',
  description: 'desc'
};

var reply = {
  title: '《奇迹之书》',
  url: 'http://book.douban.com/...',
  author: '谁谁谁',
  desc: '本书由谁谁谁编写',
  image: 'http://......'
};

// reply will be
{
  title: '《奇迹之书》',
  url: 'http://book.douban.com/...',
  description: '本书由谁谁谁编写',
  pic: 'http://......'
};
```

## weixin-robot

使用 [wexin-robot](https://github.com/node-webot/weixin-robot) 模块，更傻瓜化地定义自动回复功能。
