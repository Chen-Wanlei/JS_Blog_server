const mongoose = require("mongoose");

//表规则
let Schema = mongoose.Schema;
let articleSchema = new Schema({
    //类型 --原创或转载
    type : {type: String,required: true},
    //文章名字
    title : {type: String,required: true},
    //文章预览介绍
    previewTxt: {type: String,required: true},
    //文章内容
    content : {type: String,required: true},
    //文章所属分类
    tag : {type: String,required: true},
    //文章封面
    preview : {type: String,default:"http://47.105.95.71:3000/images/bgImg.jpg"},
    //文章更新时间
    upDate : {type: Date,default: Date.now},
    //文章创建时间
    date : {type: Date,default: Date.now},
    //点击量
    pv : {type: Number,default: 1},
    //回复数
    rv : {type: Number,default: 0},
    //是否置顶
    ifUp : {type: Boolean,default: false},
    //文章背景音乐
    music : {
        //音乐名
        title : {type: String,default: ""},
        //演奏者
        artist : {type: String,default: ""},
        //音乐id
        id : {type: String,default: ""},
        //封面链接
        pic : {type: String,default: "http://47.105.95.71:3000/images/preview.jpg"},
        //歌词
        lrc : {type: String,default: "[00:00.00] (,,•́ . •̀,,) 抱歉，当前歌曲暂无歌词！"}
    },
});
articleSchema.pre("update",function (next){
    this.upDate = new Date;
    next();
})

//建表
let article = mongoose.model("article", articleSchema);

module.exports = article;

// for (let i=0;i<18;i++) {
//     article.create({
//         type: ["原创", "转载"][(Math.random() * 2) | 0],
//         title: `第${i + 1}篇文章`,
//         previewTxt: ("这是预览内容，纯文字~~~~~~~").repeat(20),
//         content: ("这是文章内容~~~").repeat(20),
//         tag: ["HTML&CSS", "JavaScript", "Vue&React", "NodeJs", "Other", "Personal Diary"][(Math.random() * 6) | 0],
//         pv: (Math.random() * 1000) | 0,
//         date: new Date(1604454706448 - i*1000000000),
//         music: {
//             title: '我们活着 (《灵笼》第一季插曲)',
//             artist: ' - 刘牧',
//             src: 'http://47.105.95.71:3000/media/刘牧 - 我们活着.mp3',
//             pic: 'https://p3fx.kgimg.com/stdmusic/240/20190710/20190710113607745197.jpg',
//             lrc: '[ti:我们活着 (《灵笼》第一季插曲)][ar:刘牧][al:《灵笼》第一季原声大碟][by:][offset:0][00:00.20]我们活着 - 刘牧[00:01.65]词 Lyricist：阮瑞[00:02.44]曲 Composer：杨秉音[00:03.41]编曲 Arranger：杨秉音[00:03.61]制作人 Producer：杨秉音[00:04.46]制作公司 Producing Company：秉音创声[00:05.24]动画出品 Animation Production：艺画开天[00:53.91]当世界面对死亡[00:57.52]灵魂点燃了微光[01:01.27]那是救赎者的妄想[01:04.19]是末日冰冷的悲伤[01:08.12]当我们面对死亡[01:11.50]我轻轻吻你的额头[01:14.40]温热的脸庞[01:20.16]闪烁着的眼眶[01:28.66]这 至暗的夜[01:33.90]再度被唤起的向往[01:37.58]无法阻挡[01:40.82]不顾一切 去疯狂[01:52.03]我们活着[01:55.40]告诉每一个人[01:59.16]生命是多么不可想象[02:02.36]深藏着无尽顽强[02:06.02]在那一刻[02:09.24]你我站在宇宙的中心[02:12.82]在那一刻[02:16.89]我们忘了 抵抗'
//         }
//     })
// }
