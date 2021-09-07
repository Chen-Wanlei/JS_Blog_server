var express = require('express');
var router = express.Router();

//文章相关的接口
router.use("/article",require("./article/index"));
//注册相关的接口
router.use("/register",require("./register/index"));
//登录相关的接口
router.use("/login",require("./login/index"));
//留言相关的接口
router.use("/message",require("./message/index"));
//最近访客的接口
router.use("/visitor",require("./visitor/index"));
//头像上传的接口
router.use("/upload",require("./upload/index"));

module.exports = router;
