# wechat-mp 微信公众平台API辅助工具 [![Build Status](https://travis-ci.org/node-webot/wechat-mp.png?branch=master)](https://travis-ci.org/node-webot/wechat-mp)

Utilities for wechat offical account API.

## Express Middlewares

```javascript
var mp = require('wechat-mp')(process.env.WX_TOKEN);
var app = require('express')();

app.use('/wechat', mp.start())
app.post('/wechat', function(req, res, next) {

  console.log(req.wx_data);

  res.body = {
    reply: 'Hi.'
    type: 'text';
  };

  next();
}, mp.end());
```

Add session support:

```
app.use('/wechat', mp.start())
app.use(connect.cookieParser())
app.use(connect.session({ store: ... }))
```

### mp( *[options]* )


#### options.token

The token for wechat to check signature.

#### options.tokenProp

Default: 'wx\_token'

Will try get `req[tokenProp]` as token. Good for dynamically set token.

#### options.session

Unless `options.session` is set to `false`,
the `mp.start()` middleware will set `req.sessionID` and `req.sessionId`
as `"wx.#{toUserName}.#{fromUserName}"`.


## weixin-robot

使用 [wexin-robot](https://github.com/node-webot/weixin-robot) 模块，更傻瓜化地定义自动回复功能。
