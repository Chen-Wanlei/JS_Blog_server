const express = require('express');
const svgCaptcha = require('svg-captcha');
const router = express.Router();

//使用user表
const user = require('../../mongodb/user');

router.post("/VCode",(req,res)=>{
    if (req.session.time){
        let _time = (new Date() - new Date(req.session.time))/1000;
        if (_time < 30){
            res.send({
                code : 2,
                msg : "请求过于频繁",
                data : req.session.VCode.data,
                countDown : 30 - (_time | 0)
            })
            return
        }
    }

    let captcha = svgCaptcha.create({noise:4});
    req.session.VCode = captcha;
    req.session.time = new Date();
    res.send({
        code : 0,
        msg : "ok",
        data : captcha.data,
        countDown : 30
    })
});
router.post("/checkVCode",(req,res)=>{
    if (!req.session.VCode){
        res.send({
            code: 3,
            msg: "session超时重置，验证码失效"
        })
        return ;
    }
    let VCode = req.body.VCode;
    if (!VCode || VCode.toLocaleLowerCase() !== req.session.VCode.text.toLocaleLowerCase()){
        res.send({
            code : 2,
            msg : "验证失败",
        })
    }else{
        res.send({
            code : 0,
            msg : "验证成功",
        })
    }
})
router.post("/",(req,res)=>{
    if (!req.session.VCode){
        res.send({
            code: 1,
            msg: "session超时重置，验证码失效"
        })
        return ;
    }
    req.session.time = undefined; //清除时间验证
    let {userName,password,VCode} = req.body;
    if (!userName || !password || !VCode){
        res.send({
            code : 1,
            msg : "数据为空，请检查后再注册",
        })
        return;
    }
    if (typeof userName !== 'string' || typeof password !== 'string' || typeof VCode !== "string"){
        res.send({
            code : 1,
            msg : "数据类型错误，请检查后再注册",
        })
        return;
    }
    if (!/^[\w\u4e00-\u9fa5\uac00-\ud7ff\u0800-\u4e00]{2,7}$/.test(userName) || !/^[\w<>,.?|;':"{}!@#$%^&*()\/\-\[\]\\]{6,18}$/.test(password)){
        res.send({
            code : 1,
            msg : "用户名或密码格式不正确，请检查后再注册",
        })
        return;
    }
    if (VCode.toLocaleLowerCase() !== req.session.VCode.text.toLocaleLowerCase()){
        res.send({
            code : 2,
            msg : "验证码错误，请检查后再注册",
        })
        return;
    }
    //用户名验重
    user.findOne({userName})
        .then(data => {
            if (data) {
                res.send({
                    code : 3,
                    msg : "用户名已存在"
                })
            }
            else {
                user.create({userName,password})
                    .then(() => {
                        res.send({
                            code : 0,
                            msg : "注册成功",
                        })
                    })
                    .catch(err => {
                        console.error(err);
                        res.send({
                            code : 4,
                            msg : "服务器错误，请稍后再注册",
                        })
                    })
            }
        })
        .catch(err => {
            console.error(err);
            res.send({
                code : 4,
                msg : "服务器错误，请稍后再注册"
            })
        })
})

module.exports = router;
