/*
* req.session.VCode
*   存储注册时的验证码
* req.session.time
*   存储注册时的验证码的时间验证凭证
* req.session.login
*   存储登录时的登录状态
*
* */

const session = require('express-session');
const sessionMongo = require('connect-mongo')(session);

module.exports = session({
    secret : "|with no relatives|",
    cookie : {maxAge:10*60*1000},
    rolling : true,
    resave : false,
    saveUninitialized : false,
    //将session存储到数据库
    store : new sessionMongo({
        url : "mongodb://localhost:27017/blog"
    })
})