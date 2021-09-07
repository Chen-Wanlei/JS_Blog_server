const CryptoJS = require('crypto-js');
const axios = require('axios');

//aes加密函数
function aes(a, b = false) {
    // noinspection JSUnresolvedVariable
    let txt = CryptoJS.enc.Utf8.parse(a);
    // noinspection JSUnresolvedVariable
    let vi = CryptoJS.enc.Utf8.parse("0102030405060708");
    // noinspection JSUnresolvedVariable
    let pw = CryptoJS.enc.Utf8.parse(b || "0CoJUm6Qyw8W8jud");

    // noinspection JSUnresolvedVariable
    let f = CryptoJS.AES.encrypt(txt, pw, {
        iv: vi,
        mode: CryptoJS.mode.CBC
    });
    return f.toString()
}

//RSA加密16位随机数得到encSecKey
const b = "a8LWv2uAtXjzSfkQ"; //16位随机数
const encSecKey = "2d48fd9fb8e58bc9c1f14a7bda1b8e49a3520a67a2300a1f73766caee29f2411c5350bceb15ed196ca963d6a6d0b61f3734f0a0f4a172ad853f16dd06018bc5ca8fb640eaa8decd1cd41f66e166cea7a3023bd63960e656ec97751cfc7ce08d943928e9db9b35400ff3d138bda1ab511a06fbee75585191cabe0e6e63f7350d6";

module.exports = function (music_id) {
    if (!music_id || 'string' !== typeof music_id) return new Promise((resolve, reject) => reject(new Error("The format of the passed in parameter '" + music_id + "' is incorrect")))
    let params = aes(aes(`{"ids":"[${music_id}]","br":128000,"level":"standard","encodeType":"aac","csrf_token":""}`), b); //传入16位随机数
    return axios({
        method: 'post',
        url: "https://music.163.com/weapi/song/enhance/player/url/v1?csrf_token=",
        data: {params, encSecKey},
        transformRequest: [
            function (data) {
                let ret = ''
                for (let it in data) {
                    // noinspection JSUnfilteredForInLoop
                    ret += encodeURIComponent(it) + '=' + encodeURIComponent(data[it]) + '&'
                }
                ret = ret.substring(0, ret.lastIndexOf('&'));
                return ret
            }
        ],
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, Like Gecko) Chrome/76.0.3809.87 Safari/537.36',
            'accrpt': '*/*'
        },
    })
}
