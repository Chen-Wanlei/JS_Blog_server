const express = require("express");
const axios = require("axios");
const btoa = require('btoa');
const router = express.Router();

const visitor = require("../../mongodb/visitor");

router.post("/", (req, res) => {
    visitor.find({}, {}, {skip: 0, limit: 12, sort: {date: -1}})
        .populate("user", {_id: 1, userName: 1, headPortrait: 1})
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
                msg: "服务器异常",
                data: []
            })
            console.error(err);
        })
})

//播放器图片取色代理接口，返回图片的base64
router.get("/color", (req, res) => {
    let url = req.query.url;
    if (url) {
        axios.get(url, {responseType: 'arraybuffer'})
            .then(response => {
                let base64 = 'data:image/png;base64,' + btoa(new Uint8Array(response.data).reduce((data, byte) => data + String.fromCharCode(byte), ''))
                res.send({
                    code: 0,
                    msg: "ok",
                    data: base64
                })
            })
            .catch(error => {
                console.log(error);
                res.send({
                    code: 4,
                    msg: "服务器错误",
                    data: "data:image/png;base64,"
                })
            })
        return
    }
    res.send({
        code: 2,
        msg: "请传入图片链接",
        data: "data:image/png;base64,"
    })
})

module.exports = router
