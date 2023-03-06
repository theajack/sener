/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-06 23:54:05
 * @Description: Coding something
 */
const http = require('http');
const { URL } = require('url');

// const url = new URL('http://localhost:3002/user/test');

// console.log(url);

console.log(2222);
const req = http.request('http://localhost:3002/user/test', {
    method: 'GET',
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
    },
}

// host: 'localhost',
// path: '/message?app=cnchar&index=1&size=10',
// method: 'get',
// headers: {
//     'Content-Type': 'application/json;charset=utf-8',
// },
// port: 3001
, function (res) {
    console.log(1111);

    res.setEncoding('utf-8');
    let responseString = '';
    res.on('data', function (data) {
        responseString += data;
    });
    res.on('end', function () {
        const result = JSON.parse(responseString);
        console.log('end', result);
    });
    req.on('error', function (e) {
        console.log(`发送请求错误: ${e.message}`);
    });
    req.on('timeout', function (e) {
        console.log(`发送请求超时: ${e.message}`);
    });

});
req.on('error', function (e) {
    console.log('e', e);
});
req.end();