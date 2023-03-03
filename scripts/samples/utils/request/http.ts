/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-03 00:03:04
 * @Description: Coding something
 */

import { IJson, IMethod } from 'packages/types/src';
import { convertData, parseJson } from '../utils';

let _http: any, _https: any = null;

interface IBaseOptions {
  host: string,
  path: string, // get方式使用的地址
  method: IMethod, // get方式或post方式
  headers: IJson,
  https: boolean,
  port?: number,
  body?: any,
}

interface IRequestOptions extends IBaseOptions {
  query?: any,
}

type ICommenReturn = Promise<{
  success: boolean,
  result: any,
  code?: number,
  err?: any
}>

export function request ({
    host, path, method, headers, https, port, body, query
}: IRequestOptions) {
    if (!path.startsWith('/')) path = `/${path}`;
    path = path + (query ? `?${convertData(query)}` : '');
    if (typeof window !== 'undefined') {
        return windowFetch({ host, path, method, headers, https, port, body });
    } else {
        return nodeRequest({ host, path, method, headers, https, port, body });
    }
}

async function windowFetch ({
    host, path, method, headers, https, port, body
}: IBaseOptions): ICommenReturn {
    const options: IJson = {
        method,
        headers,
    };
    if (method !== 'get' && body) options.body = body;

    try {
        const protocol = https ? 'https' : 'http';
        host = host || location.host;
        if (port) host += `:${port}`;
        const result = await fetch(`${protocol}://${host}${path}`, options);

        const json = await result.json();
        return { success: true, result: json };
    } catch (e) {
        return { success: false, result: `fetch失败: ${e.message}` };
    }
}

function nodeRequest ({
    host, path, method, headers, https, port, body
}: IBaseOptions): ICommenReturn {
    if (!_http) _http = require('http');
    if (!_https) _https = require('https');

    // console.log({ host, path, method, headers, https, port, body });
    return new Promise((resolve) => {
        const target = (https ? _https : _http);
        const req = target.request({
            host, path, method, headers, port
        }, function (res: any) {
            res.setEncoding('utf-8');
            let responseString = '';
            res.on('data', function (data: any) {
                responseString += data;
            });
            res.on('end', function () {
                const result = parseJson(responseString);
                resolve({
                    success: !!result,
                    result: result || `json 解析失败: ${responseString}`
                });
            });

            req.on('error', function (e: any) {
                resolve({
                    success: false,
                    result: `发送请求错误: ${e.message}`
                });
            });
            req.on('timeout', function (e: any) {
                resolve({
                    success: false,
                    result: `发送请求超时: ${e.message}`
                });
            });
        });
        req.on('error', (e: any) => {
            resolve({
                success: false,
                result: `请求错误: ${e.message}`
            });
        });
        if (body && method !== 'get') {
            req.write(convertData(body));
        }
        req.end();
    });
}