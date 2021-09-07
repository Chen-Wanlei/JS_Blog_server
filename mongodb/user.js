const mongoose = require("mongoose");

let user = mongoose.model("user",new mongoose.Schema({
    userName : {type: String,required: true},
    password : {type: String,required: true},
    //注册时间
    reqDate : {type: Date,default: Date.now},
    //头像
    headPortrait : {type: String,default: "http://47.105.95.71:3000/images/defaultPhoto.jpg"},
    //是否禁言
    disabled : {type: Boolean,default: false},
    //是否是管理员
    admin : {type: Boolean,default: false},
}))

module.exports = user;