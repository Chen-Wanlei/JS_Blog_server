const mongoose = require("mongoose");

const Schema = mongoose.Schema;
const comment = mongoose.model("comment",new Schema({
    articleId : {type: Schema.Types.ObjectId, ref:"article", required:true},
    comment : [{
        //关联用户表
        user : {type: Schema.Types.ObjectId,ref: "user",required: true},
        //内容
        content : {type: String,required: true},
        //日期
        date : {type: Date,default: Date.now},
        //子留言
        children : [{
            user : {type: Schema.Types.ObjectId, ref:"user", required:true},
            content : {type: String,required: true},
            reUser : {type: String,required: true},
            date : {type: Date,default: Date.now},
        }]
    }]
}))

module.exports = comment