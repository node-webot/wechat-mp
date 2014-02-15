# wechat-mp 微信公众平台API辅助工具 [![Build Status](https://travis-ci.org/node-webot/wechat-mp.png?branch=master)](https://travis-ci.org/node-webot/wechat-mp)

Utilities for wechat offical account API.

## Express Middlewares

```javascript
var mp = require('wechat-mp')(process.env.WX_TOKEN);
var app = require('express')();

// set your wechat api token here.
var verify = mp.checkSig(process.env.WX_TOKEN);

app.use(mp.start(), function(req, res, next) {

  console.log(req.wx_data);

  res.wx_data = {
    reply: 'Hi.'
    type: 'text';
  };

  next();
}, mp.end());

app.use('/wechat', mp)
```

Add session support:

```
app.use(mp.start())
app.use(connect.cookieParser())
app.use(connect.session({ store: ... }))
```

The `mp.start` must goes before cookieParser.


### mp( *[options]* )


#### options.token

The token for wechat to check signature.

#### options.tokenProp

Default: 'wx\_token'

Will try get `req[tokenProp]` as token.

#### options.prop

Default: 'wx\_data'

On What property of `res` and `req` do we need to attach wechat data to.

#### options.session

Set `options.session` to `true` to give session support for each wechat account subscriber.
Or set it with your customed cookie key.


## weixin-robot

使用 [wexin-robot](https://github.com/node-webot/weixin-robot) 模块，更傻瓜化地定义自动回复功能。
