# wechat-mp 微信公众平台API辅助工具

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

### mp.bodyParser([options])

Parse the request from wechat, attach the result to req.wx_data.

#### options.propMap

#### options.paramMap

### mp.resBuilder()

Build a xml string for wechat server, and send it. 
