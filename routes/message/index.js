const express = require("express");
const router = express.Router();

const message = require("../../mongodb/message");

router.post("/commit",(req,res) => {
    if (!req.session.login){
        res.send({
            code : 1,
            msg : "未登录或登录超时"
        })
        return
    }
    let {user,content,browser,location} = req.body;
    if (!user || !content){
        res.send({
            code : 1,
            msg : "数据错误"
        })
        return
    }
    //添加评论
    message.create({user,content,browser,location})
        .then(()=>{
            res.send({
                code : 0,
                msg : "留言提交成功"
            });
        })
        .catch(err=>{
            console.error(err);
            res.send({
                code : 4,
                msg : "服务器错误"
            })
        })
})
router.post("/childCommit",(req,res)=>{
    if (!req.session.login){
        res.send({
            code : 1,
            msg : "未登录或登录超时"
        })
        return
    }
    let {parentId,user,reUser,content,location,browser} = req.body;
    if (!parentId && !user && !reUser && !content){
        res.send({
            code : 1,
            msg : "数据格式错误",
        })
        return
    }
    message.findById(parentId)
        .then(data=>{
            if (data){
                //父留言存在
                message.updateOne({_id:parentId},{$push:{'children':{user,reUser,content,location,browser}}})
                    .then(()=>{
                        res.send({
                            code : 0,
                            msg : "评论成功"
                        })
                    })
                    .catch(err=>{
                        console.error(err);
                        res.send({
                            code : 4,
                            msg : "服务器错误"
                        })
                    })
            }else {
                //父留言不存在
                res.send({
                    code : 2,
                    msg : "此留言不存在"
                })
            }
        })
        .catch(err=>{
            res.send({
                code : 4,
                msg : "服务器错误",
            })
        console.error(err);
    })
})
router.post("/getList",(req, res) => {
    let {skip,limit} = req.body;
    message.find({},{__v:0},{skip,limit,sort:{date:-1}})
        .populate("user",{__v:0,password:0})
        .populate("children.user",{__v:0,password:0})
        .then((data)=>{
            res.send({
                code : 0,
                msg : "请求成功",
                data
            })
        })
        .catch(err=>{
            console.error(err);
            res.send({
                code : 4,
                msg : "服务器错误",
                data : [],
            })
        })
})

module.exports = router;