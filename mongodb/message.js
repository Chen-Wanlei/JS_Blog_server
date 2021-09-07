const mongoose = require("mongoose");

const Schema = mongoose.Schema;
let message = mongoose.model("message",new Schema({
    //关联用户表
    user : {type: Schema.Types.ObjectId,ref: "user",required: true},
    //内容
    content : {type: String,required: true},
    //浏览器类型
    browser : {type: String,default: "Unknown browser"},
    //位置
    location : {type: String,default: "中国"},
    //日期
    date : {type: Date,default: Date.now},
    //子留言
    children : [{
        user : {type: Schema.Types.ObjectId, ref:"user", required:true},
        content : {type: String,required: true},
        reUser : {type: String,required: true},
        date : {type: Date,default: Date.now},
        location : {type: String,default: "中国"},
        browser : {type: String,default: "Unknown browser"},
    }]
}))

module.exports = message