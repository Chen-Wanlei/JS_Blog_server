const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const user = require("../../mongodb/user");

let router = express.Router();

let photoName;

let storage = multer.diskStorage({
    destination: function (req, res, cb){
        cb(null, path.join(__dirname, '../../public/images/upload/avatar'))
    },
    filename: function (req, file, cb){
        let fileName;
        if (req.session.login){
            photoName = req.session.login.headPortrait.match(/\/(\w+)\.(jpg|png|jpeg|gif)$/)[0];
            fileName = req.session.login._id + Date.now() + file.originalname.match(/\.(jpg|png|gif|jpeg)$/i)[0];
        }else {
            fileName = file.fieldname + '-' + Date.now() + file.originalname.match(/\.(jpg|png|gif|jpeg)$/i)[0];
        }
        cb(null, fileName)
    }
})

let upload = multer({ storage }).single('file');

router.post("/", (req,res) => {
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            //发生错误
            res.send(500);
        } else if (err) {
            //发生错误
            res.send(500);
        }else {
            //一切都好
            //更新用户表
            if (!req.session.login) return res.sendStatus(500);
            user.updateOne({_id:req.session.login._id},{headPortrait:"http://localhost:3000/images/upload/avatar/" + req.file.filename})
                .then(() => {
                    //需要更新session存储的数据
                    req.session.login.headPortrait = "http://localhost:3000/images/upload/avatar/" + req.file.filename;
                    fs.readFile(path.join(__dirname, '../../public/images/upload/avatar' + photoName),"utf8",(err,data)=>{
                        if (!data) return
                        fs.unlink(path.join(__dirname, '../../public/images/upload/avatar' + photoName),(err)=>{if (err) console.error(err)});
                    })
                    res.send("ok");
                })
                .catch(err => {
                    res.sendStatus(500);
                    console.error(err);
                })
        }
    })
});

module.exports = router;
