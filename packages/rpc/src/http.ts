/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-03 00:03:04
 * @Description: Coding something
 */

import { IJson, IMethod, parseJson } from 'sener-types';
import { convertData } from './utils';

let _http: any, _https: any = null;

interface IBaseOptions {
    url: string,
    method: IMethod, // get方式或post方式
    headers: IJson,
    body?: any,
    form?: boolean,
    traceid?: string,
}

interface IRequestOptions extends IBaseOptions {
    query?: any,
}

type ICommenReturn = Promise<{
    success: boolean,
    data?: any,
    code?: number,
    msg: string,
    err?: any
}>

export function request ({
    url, method, headers = {}, body, query, form, traceid
}: IRequestOptions) {
    url = url + (query ? `${convertData(query)}` : '');

    if (!form) headers = Object.assign({ 'Content-Type': 'application/json;charset=utf-8' }, headers || {});

    if (typeof window !== 'undefined') {
        return windowFetch({ url, method, headers, body, form });
    } else {
        return nodeRequest({ url, method, headers, body, traceid });
    }
}

async function windowFetch ({
    url, method, headers, body, form
}: IBaseOptions): ICommenReturn {
    const options: IJson = {
        method,
        headers,
    };
    if (method !== 'get' && body) {
        options.body = form ? body : JSON.stringify(body);
    }
    try {
        const result = await fetch(url, options);

        const json = await result.json();
        return { success: json.code === 0, ...json };
    } catch (e) {
        return { success: false, msg: `fetch失败: ${e.message}` };
    }
}

function nodeRequest ({
    url, method, headers, body, traceid
}: IBaseOptions): ICommenReturn {
    // console.log('----host', host, path, method, headers, https, port, body);
    if (!_http) _http = require('http');
    if (!_https) _https = require('https');

    if (traceid) headers['x-trace-id'] = traceid;

    // console.log({ host, path, method, headers, https, port, body });
    return new Promise((resolve) => {
        const target = (url.startsWith('https://') ? _https : _http);
        const req = target.request(url, {
            method, headers,
        }, function (res: any) {
            res.setEncoding('utf-8');
            let responseString = '';
            res.on('data', function (data: any) {
                responseString += data;
            });
            res.on('end', function () {
                const result = parseJson(responseString);
                resolve({
                    success: (result && result.code === 0),
                    ...(result || {}),
                });
            });

            req.on('error', function (e: any) {
                resolve({
                    success: false,
                    msg: `发送请求错误: ${e.message}`
                });
            });
            req.on('timeout', function (e: any) {
                resolve({
                    success: false,
                    msg: `发送请求超时: ${e.message}`
                });
            });
        });
        req.on('error', (e: any) => {
            resolve({
                success: false,
                msg: `请求错误: ${e.message}`
            });
        });
        if (body && method !== 'get') {
            req.write(convertData(body, false));
        }
        req.end();
    });
}