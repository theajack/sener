/*
 * @Author: chenzhongsheng
 * @Date: 2024-09-22 21:57:58
 * @Description: Coding something
 */
const http = require('http'),
    httpProxy = require('http-proxy');
//
// Create your proxy server and set the target in the options.
//
httpProxy.createProxyServer({
    target: 'http://127.0.0.1:3005/api/test',
    'ignorePath': true,
}).listen(8000); // See (†)
