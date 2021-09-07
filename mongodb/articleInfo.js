const mongoose = require("mongoose");

const Schema = mongoose.Schema;
let articleInfo = mongoose.model("articleInfo", new mongoose.Schema({
    type : {type: String, required: true},
    tags : {type: [String]},
    num : {type: Number},
    upArticleId : {type: Schema.Types.ObjectId, ref:"article"},
}));

module.exports = articleInfo;