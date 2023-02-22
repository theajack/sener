/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-22 15:06:17
 * @Description: Coding something
 */
const statik = require('node-static');
const path = require('path');

const fileServer = new statik.Server(path.resolve(__dirname, './public'));

require('http').createServer(function (request, response) {
    console.log('8080');
    request.addListener('end', function () {
        console.log('end');
        (fileServer.serve(request, response).on('success', (d) => {
            console.log(request.url, d);
        }).on('error', (d) => {
            console.log('error', request.url, d);
        }));
    }).resume();
}).listen(8080);