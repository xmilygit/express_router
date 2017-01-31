var express = require('express');
var wechatapi = require('wechat-api');
var xml2js = require('xml2js');
var xmlparser = require('express-xml-bodyparser');
var crypto = require('crypto');
var fs = require('fs');
var request = require('request');
//console.log(crypto.getHashes());
//fjxxmail2的登录配置
//var myauth={
//    appid:'wxbc80d33f96722772',
//    appsecret:'087a63126694bcd908b33eeef8f00038'
//};

//测试配置
var myauth = {
    appid: 'wxba8db6584881bbab',
    appsecret: '7d234a1b76eb803e6683d3a8945985bb'
}

var app = express();
var router = express.Router();
//var api=new wechatapi(myauth.appid,myauth.appsecret)
var parser = new xml2js.Parser();
var jstoxml = new xml2js.Builder();
var lasttoken = { "access_token": "", "expires_in": 7200 };

var api = new wechatapi(myauth.appid, myauth.appsecret, function (callback) {
    // 传入一个获取全局token的方法
    fs.readFile('access_token.txt', 'utf8', function (err, txt) {
        if (err) { return callback(err); }
        callback(null, JSON.parse(txt));
    });
}, function (token, callback) {
    // 请将token存储到全局，跨进程、跨机器级别的全局，比如写到数据库、redis等
    // 这样才能在cluster模式及多机情况下使用，以下为写入到文件的示例
    fs.writeFile('access_token.txt', JSON.stringify(token), callback);
});

function sendMsg(recvMsg, repalyContent) {
    //发送消息的osn
    let sendTextXml =
        {
            xml: {
                ToUserName: '',
                FromUserName: '',
                CreateTime: Date.now().toString(),
                MsgType: '',
                Content: Date.now().toString()
            }
        };
    sendTextXml.xml.ToUserName = recvMsg.fromusername;//msg.FromUserName;
    sendTextXml.xml.FromUserName = recvMsg.tousername;
    sendTextXml.xml.MsgType = 'Text';
    sendTextXml.xml.Content = repalyContent;
    console.log(sendTextXml);
    return jstoxml.buildObject(sendTextXml);
}


//生成菜单的json
var menu =
    {
        "button": [
            {
                "type": "click",
                "name": "我",
                "key": "Account_me"
            },
            {
                "name": "校园微网",
                "sub_button": [
                    {
                        "type": "view",
                        "name": "搜索",
                        "url": "http://www.baidu.com/"
                    },
                    {
                        "type": "view",
                        "name": "校园网站",
                        "url": "http://fjxx.tunnel.2bdata.com"
                    },
                    {
                        "type": "click",
                        "name": "赞一下我们",
                        "key": "V1001_GOOD"
                    }
                ]
            }
        ]
    };






router.post('/wechat', function (req, res, next) {
    /*
    api.getAccessToken(function(err,token){
        if(err){
            console.log('获取token失败');
        }
        console.log('token:'+token.accessToken);
        lasttoken=token;
    });
    */
    /*
    api.getLatestToken(function(err,token){
        console.log(token);
    });
    */

    //console.log(req.body);
    //console.log(req.body.xml.content);
    var msg = req.body.xml;
    console.log(msg);
    switch (msg.msgtype[0]) {
        case 'text':
            switch (msg.content[0]) {
                case "链接2":
                    api.sendText(msg.fromusername[0], '<a href="http://fjxx.tunnel.2bdata.com/">链接</a>', function (err, result) {
                        if (err) {
                            console.log(err.code + err.message);
                        }
                    });
                    break;
                case '链接':
                    api.sendText(msg.fromusername[0], '<a href="https://open.weixin.qq.com/connect/oauth2/authorize?appid=' + myauth.appid + '&redirect_uri=' + encodeURIComponent("http://fjxx.tunnel.2bdata.com/") + '&response_type=code&scope=snsapi_base&state=123#wechat_redirect">链接</a>', function (err, result) {
                        if (err) {
                            console.log(err.code + err.message);
                        }
                    });
                    break;
                case '创建菜单':
                    api.getMenu(function (err, result) {
                        if (err) {
                            res.end(sendMsg(msg, '创建菜单失败' + err.code + ':' + err.message));
                            if (err.code == 46003) {
                                api.sendText(msg.fromusername[0], '开始创建菜单', function (err, result) {
                                    if (err) {
                                        console.log(err.code + err.message);
                                    }
                                });

                                api.createMenu(menu, function (err, result) {
                                    if (err) {
                                        api.sendText(msg.fromusername[0], '创建失败' + err.code + err.message, function (err, result) {
                                            if (err) {
                                                console.log(err.code + err.message);
                                            }
                                        });
                                    }
                                    else {
                                        api.sendText(msg.fromusername[0], '创建成功请重新关注查看结果', function (err, result) {
                                            if (err) {
                                                console.log(err.code + err.message);
                                            }
                                        });
                                    }
                                });

                            }

                        } else {

                            console.log(result);
                            api.sendText(msg.fromusername[0], '菜单已经建立', function (err, result) {
                                if (err) {
                                    console.log(err.code + err.message);
                                }
                            });
                        }
                    });
                    break;
                default:
                    res.end(sendMsg(msg, '你输入的是：' + msg.content));
                    break;
            }
            break;
        case 'event':   
            switch (msg.eventkey[0]) {
                case "Account_me":
                    api.getUser(msg.fromusername[0], function (err, result) {
                        if (err) {
                            console.log(err.code + err.message)
                        } else {
                            console.log(result)
                            api.sendText(msg.fromusername[0], '你的用户名是' + result.nickname + "/r你的openid是：" + result.openid, function (err, result) {
                                if (err) {
                                    console.log(err.code + err.message);
                                }
                            });
                        }
                    });

                    break;
                case "V1001_GOOD":
                    api.sendText(msg.fromusername[0], '子菜单点击', function (err, result) {
                        if (err) {
                            console.log(err.code + err.message);
                        }
                    });
                    break;
            }


            break;
    }
    res.end();
})

//配置微信服务器时的地址验证
router.get('/wechat', function (req, res, next) {
    //1. 将token、timestamp、nonce三个参数进行字典序排序
    //将这三个参数放入数据
    let queryStr = ['xmilyhh', req.query['timestamp'], req.query['nonce']];
    //设置sha1加密
    let sha1 = crypto.createHash('sha1');
    //将数组进行字典排序sort()后再连接成一组字符串join(''),再进行加密update()
    sha1.update(queryStr.sort().join(''))
    //将加密的结果赋值给vali变量
    let vali = sha1.digest('hex');

    console.log(queryStr);
    console.log('signature=' + req.query['signature']);
    console.log('sha1=' + vali);
    //3. 开发者获得加密后的字符串可与signature对比，标识该请求来源于微信
    if (vali == req.query['signature']) {
        //匹配成功则返回echostr参数
        res.end(req.query['echostr'])
    } else {
        //否则验证失败
        next();
    }
})



router.get('/test', function (req, res, next) {
    res.end('{"a":"1","b":"2"}');
})

router.get('/', function (req, res, next) {
            //获取用户openid
            /*
        let reqUrl = "https://api.weixin.qq.com/sns/oauth2/access_token?appid=" + myauth.appid + "&secret=" + myauth.appsecret + "&code=" + req.query['code'] + "&grant_type=authorization_code";
        request(reqUrl, function (err, res2, body) {
            if (!err && res2.statusCode == 200) {
                useinfo = JSON.parse(body)
                console.log(useinfo);
                console.log("code:" + req.query['code'] + "openid:" + useinfo.openid);
    
                res.end('<h1>' + req.query['code'] + '</h1></br><h1>' + useinfo.openid + '</h1>');
            } else {
                res.end();
            }
        })
*/
    //获取js_sdk的config
    var param = {
        debug: true,
        jsApiList: ['onMenuShareTimeline', 'onMenuShareAppMessage', 'scanQRCode'],
        url: 'http://fjxx.tunnel.2bdata.com/'
    };
    api.getJsConfig(param, function (err, results) {
        if (err) {
            console.log(err)
        } else {
            console.log(results);
            res.end(
                               
                "<script src=\"http://res.wx.qq.com/open/js/jweixin-1.0.0.js\"></script>\n\r" +
                "<script>\n\r" +
                "wx.config(" + JSON.stringify(results) + ");\n\r" +
                "wx.ready(function(){\n\r"+   
                "wx.checkJsApi({\n\r" +
                "'jsApiList':['onMenuShareTimeline', 'onMenuShareAppMessage', 'scanQRCode'],\n\r" +
                "success:function (res) {\n\r" +
                "alert(JSON.stringify(res));\n\r" +
                "}});\n\r"+
"wx.scanQRCode({\n\r"+
    "needResult: 1,\n\r"+
    "scanType: ['qrCode','barCode'],\n\r"+
    "success: function (res) {\n\r"+
    "var result = res.resultStr;\n\r"+
    "alert(result)\n\r"+
"}\n\r"+
"});\n\r"+
                "});\n\r"+
                "wx.error(function(res){\n\r"+
                "alert(res)\n\r"+
                "});\n\r"+
                "</script>"
            )
        }
        //end

    })
    
});

    app.use(xmlparser());
    app.post('/wechat', router);
    app.get('/wechat', router);
    app.get('/test', router);
    app.get('/', router);

    console.log('微信服务端开始监听');
    app.listen(3000);