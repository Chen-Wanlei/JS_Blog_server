const express = require('express');
const router = express.Router();

//使用user表
const user = require('../../mongodb/user');
const visitor = require("../../mongodb/visitor");

router.post("/",(req,res)=>{
    if (req.session.login) {
        res.send({
            code : 2,
            msg : "已经登录！"
        })
    }
    let {userName,password} = req.body;
    if (!userName || !password){
        res.send({
            code : 1,
            msg : "数据为空，请检查后再登录",
        })
        return;
    }
    if (typeof userName !== 'string' || typeof password !== 'string'){
        res.send({
            code : 1,
            msg : "数据类型错误，请检查后再登录",
        })
        return;
    }
    if (!/^[\w\u4e00-\u9fa5\uac00-\ud7ff\u0800-\u4e00]{2,7}$/.test(userName) || !/^[\w<>,.?|;':"{}!@#$%^&*()\/\-\[\]\\]{6,18}$/.test(password)){
        res.send({
            code : 1,
            msg : "用户名或密码格式不正确，请检查后再登录",
        })
        return;
    }
    //查找用户名
    user.findOne({userName})
        .then(data => {
            if (data) {
                if (data.password === password){
                    let {_id,userName,headPortrait,reqDate,admin} = data;
                    req.session.login = data;
                    res.send({
                        code : 0,
                        msg : "账号密码正确",
                        userInfo : {
                            _id,
                            userName,
                            headPortrait,
                            reqDate,
                            admin,
                        }
                    })
                    /* 添加最近访客 */
                    visitor.deleteOne({"user":data._id})
                        .then(()=>{
                            visitor.create({"user":data._id},()=>{});
                        })
                        .catch(err=>{console.error(err)})
                }else {
                    res.send({
                        code : 3,
                        msg : "密码错误"
                    })
                }
            }
            else {
                res.send({
                    code : 2,
                    msg : "用户名不存在"
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
router.post("/ifLogin",(req,res)=>{
    if (!req.session.login) {
        res.send({
            userInfo : {
                code : 1,
                msg : "未登录",
            }
        })
        return
    }
    let {_id,userName,headPortrait,reqDate,admin} = req.session.login;
    res.send({
        userInfo : {
            code : 0,
            msg : "已登录",
            _id,
            userName,
            headPortrait,
            reqDate,
            admin
        }
    })
})
router.post("/logout",(req,res)=>{
    if (!req.session.login) {
        res.send({
            code : 1,
            msg : "未登录",
        })
        return
    }
    req.session.login = undefined;
    res.send({
        code : 0,
        msg : "登出成功",
    })
})

module.exports = router;