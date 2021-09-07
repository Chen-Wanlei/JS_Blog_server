const express = require('express');
const router = express.Router();

//使用文章相关的表
const article = require("../../mongodb/article");
const articleInfo = require("../../mongodb/articleInfo");
const comment = require("../../mongodb/comment");

//代理网易云音乐的api，传歌曲id返回promise
const music163Api = require("./music163Api");
const QQMusicApi = require("./QQMusicApi");

//防止过度向网易接口发送post请求
let timeObj = {}, urlObj = {};
//定期清除timeObj和urlObj，防止产生过多的无用数据
let originDate = new Date();

router.post("/getInfo", (req, res) => {
    articleInfo.find({}, {_id: 0, __v: 0})
        .populate("upArticleId", {title: 1})
        .then(data => {
            res.send({
                code: 0,
                mag: "OK",
                data
            })
        })
        .catch((err) => {
            res.send({
                code: 4,
                msg: "server error",
                err: err,
                data: null
            })
        })
});
router.post("/getHot", (req, res) => {
    let limit = req.body.limit;
    limit = (typeof limit === 'number') ? limit : 8;
    article.find({pv: {$gt: 20}}, {__v: 0}, {sort: {pv: -1}, skit: 0, limit})
        .then(data => {
            res.send({
                code: 0,
                mag: "OK",
                data
            })
        })
        .catch((err) => {
            res.send({
                code: 4,
                msg: "server error",
                err: err,
                data: null
            })
            console.error(err);
        })
});
router.post("/getArticle", (req, res) => {
    let {skip, limit, tag} = req.body;
    let conditions = tag ? {tag} : {};
    article.find(conditions, {__v: 0, content: 0, music: 0, comment: 0, upDate: 0}, {
        skip,
        limit,
        sort: {ifUp: -1, date: -1}
    })
        .then(data => {
            res.send({
                code: 0,
                mag: "OK",
                data
            })
        })
        .catch(err => {
            res.send({
                code: 4,
                msg: "server error",
                err: err,
                data: null
            })
        })
});
//搜索文章
router.post("/search", (req, res) => {
    let {keywords} = req.body;
    if (!keywords) {
        res.send({
            code: 1,
            msg: "请传入查询参数",
            data: []
        })
        return
    }

    let reg = new RegExp(keywords, 'i');
    article.find({$or: [{title: reg}]}, {title: 1}, {limit: 5, sort: {pv: -1}})
        .then(data => {
            res.send({
                code: 0,
                msg: "ok",
                data
            })
        })
        .catch(err => {
            res.send({
                code: 4,
                msg: "服务器错误",
                data: []
            })
            console.error(err)
        })
});
//单篇文章
router.post("/oneArticle", (req, res) => {
    let {_id} = req.body;
    if (!_id) {
        res.send({
            code: 1,
            msg: "文章id为空",
            data: {},
        })
        return
    }
    if (typeof _id !== 'string') {
        res.send({
            code: 1,
            msg: "数据格式错误",
            data: {},
        })
        return
    }
    article.findById(_id, {__v: 0, preview: 0, ifUp: 0, type: 0, previewTxt: 0})
        .then(data => {
            let {date, pv, comment, _id, title, content, music, tag} = data;
            article.updateOne({_id}, {$inc: {pv: 1}}).then().catch(err => console.log(err));

            if (!music.id) {
                return res.send({
                    code: 0,
                    msg: "ok",
                    data: {date, pv, comment, _id, title, content, music, tag}
                })
            }

            if (!!timeObj[_id+music.id]) {
                if ((new Date() - timeObj[_id+music.id]) / 1000 / 60 / 60 <= 4) return res.send({
                    code: 0,
                    msg: "ok",
                    data: {
                        date, pv, comment, _id, title, content, tag, "music": {
                            title: music.title,
                            artist: music.artist,
                            pic: music.pic,
                            lrc: music.lrc,
                            "src": urlObj[_id+music.id]
                        }
                    }
                })
            }

            function thenFn(d, ifQQMusic = false) {
                if ((new Date() - originDate) / 1000 / 60 / 60 / 24 > 10) {
                    timeObj = {};
                    urlObj = {};
                    originDate = new Date();
                }
                timeObj[_id+music.id] = new Date();
                urlObj[_id+music.id] = !ifQQMusic ? d.data.data[0].url : d.data.req_0.data.sip[0] + d.data.req_0.data.midurlinfo[0].purl;
                if (d.data.code !== (!ifQQMusic?200:0)) return res.send({
                    code: 0,
                    msg: "后台代理错误",
                    data: {date, pv, comment, _id, title, content, music: {}, tag}
                })
                res.send({
                    code: 0,
                    msg: "ok",
                    data: {
                        date, pv, comment, _id, title, content, tag, "music": {
                            "title": music.title,
                            "artist": music.artist,
                            "pic": music.pic,
                            "lrc": music.lrc,
                            "src": urlObj[_id+music.id]
                        }
                    }
                })
            }

            if (!/^[0-9]*$/.test(music.id)) {
                QQMusicApi(music.id)
                    .then(d => thenFn(d, true))
                    .catch(err => {
                        res.send({
                            code: 0,
                            msg: "服务器错误",
                            data: {date, pv, comment, _id, title, content, music: {}, tag}
                        })
                        console.error(err)
                    });
            }else {
                music163Api(music.id)
                    .then(d => thenFn(d))
                    .catch(err => {
                        res.send({
                            code: 0,
                            msg: "服务器错误",
                            data: {date, pv, comment, _id, title, content, music: {}, tag}
                        })
                        console.error(err)
                    });
            }
        })
        .catch(err => {
            console.error(err)
            res.send({
                code: 4,
                msg: "服务器错误",
                data: {},
            })
        })
});
//当前文章的上一篇
function fn(res, data) {
    if (!data) {
        res.send({
            code: 1,
            msg: "查询错误",
            data: {}
        })
        return
    }
    if (typeof data[0] === "undefined") {
        res.send({
            code: 0,
            msg: "成功",
            data: {}
        })
        return
    }
    let {_id, title} = data[0];
    res.send({
        code: 0,
        msg: "成功",
        data: {_id, title}
    })
}
router.post("/previousArticle", (req, res) => {
    let {date} = req.body;
    if (!date) {
        res.send({
            code: 1,
            msg: "文章id或类型为空",
            data: {},
        })
        return
    }
    if (typeof date !== 'string') {
        res.send({
            code: 1,
            msg: "数据格式错误",
            data: {}
        })
        return
    }
    article.find({'date': {'$gt': date}}, {title: 1}, {limit: 2, sort: {date: 1}})
        .then(data => {
            fn(res, data);
        })
        .catch(err => {
            res.send({
                code: 4,
                msg: "服务器错误",
                data: {},
            })
            console.error(err);
        })
});
//当前文章的下一篇
router.post("/nextArticle", (req, res) => {
    let {date} = req.body;
    if (!date) {
        res.send({
            code: 1,
            msg: "文章id或类型为空",
            data: {},
        })
        return
    }
    if (typeof date !== 'string') {
        res.send({
            code: 1,
            msg: "数据格式错误",
            data: {},
        })
        return
    }
    article.find({'date': {'$lt': date}}, {title: 1}, {limit: 2, sort: {date: -1}})
        .then(data => {
            fn(res, data);
        })
        .catch(err => {
            res.send({
                code: 4,
                msg: "服务器错误",
                data: {},
            })
            console.error(err)
        })
});
//获取文章评论
router.post("/getComment", (req, res) => {
    let {articleId} = req.body;
    if (!articleId || typeof articleId !== 'string') {
        res.send({
            code: 1,
            msg: "数据错误",
            data: {},
        })
    }
    comment.findOne({articleId}, {comment: 1})
        .populate("comment.user", {__v: 0, password: 0})
        .populate("comment.children.user", {__v: 0, password: 0})
        .then(data => {
            if (!data && typeof data !== 'undefined' && data !== 0 && data !== "") {
                article.findById(articleId)
                    .then(data => {
                        if (!data) {
                            res.send({
                                code: 1,
                                msg: "未找到文章",
                                data: {}
                            })
                            return
                        }
                        res.send({
                            code: 0,
                            msg: "成功",
                            data: {}
                        })
                        comment.create({articleId}).catch(err => console.error(err))
                    })
                    .catch(err => {
                        res.send({
                            code: 4,
                            msg: "服务器错误",
                            data: {}
                        })
                        console.error(err)
                    })
                return
            }
            let i = 0; //对文章回复数进行校正
            data.comment.forEach(item => {
                i++;
                i += item.children.length;
            })
            article.updateOne({_id: articleId}, {rv: i}).then().catch(err => console.log(err));
            res.send({
                code: 0,
                msg: "成功",
                data
            })
        })
        .catch(err => {
            res.send({
                code: 4,
                msg: "服务器错误",
                data: {},
            })
            console.error(err);
        })
});
//文章评论
router.post("/comment", (req, res) => {
    if (!req.session.login) {
        res.send({
            code: 1,
            msg: "未登录或登录超时"
        })
        return
    }
    let {user, content, articleId} = req.body;
    if (!user || !content || !articleId) {
        res.send({
            code: 1,
            msg: "数据错误"
        })
        return
    }
    //添加文章评论
    comment.updateOne({articleId}, {$push: {comment: {user, content}}})
        .then((data) => {
            if (!data.n) {
                res.send({
                    code: 2,
                    msg: "评论失败"
                })
                return
            }
            res.send({
                code: 0,
                msg: "评论提交成功"
            });
        })
        .catch(err => {
            console.error(err);
            res.send({
                code: 4,
                msg: "服务器错误"
            })
        })
});
//文章评论的回复
router.post("/childComment", (req, res) => {
    if (!req.session.login) {
        res.send({
            code: 1,
            msg: "未登录或登录超时"
        })
        return
    }
    let {user, content, articleId, reUser, parentId} = req.body;
    if (!user || !content || !articleId || !reUser || !parentId) {
        res.send({
            code: 1,
            msg: "数据错误"
        })
        return
    }
    comment.updateOne({articleId, 'comment': {$elemMatch: {'_id': parentId}}}, {
        $push: {
            "comment.$.children": {
                user,
                reUser,
                content
            }
        }
    })
        .then(data => {
            if (!data.n || !data.n) {
                res.send({
                    code: 2,
                    msg: "评论失败"
                })
                return
            }
            res.send({
                code: 0,
                msg: "评论提交成功"
            });
        })
        .catch(err => {
            res.send({
                code: 4,
                msg: "服务器错误",
            })
            console.error(err)
        })
});

module.exports = router;
