/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-03 00:03:04
 * @Description: Coding something
 */

import { IJson, IMethod } from 'packages/types/src';
import { convertData, parseJson } from '../../utils';
import http from 'http';
import _https from 'https';

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
  data: any,
}>

export function request ({
    host, path, method, headers, https, port, body, query
}: IRequestOptions) {
    path = path + (query ? `?=${convertData(query)}` : '');
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
        return { success: true, data: json };
    } catch (e) {
        return { success: false, data: `fetch失败: ${e.message}` };
    }
}

function nodeRequest ({
    host, path, method, headers, https, port, body
}: IBaseOptions): ICommenReturn {
    return new Promise((resolve) => {
        const target = (https ? _https : http);
        const req = target.request({
            host, path, method, headers, port
        }, function (res) {
            res.setEncoding('utf-8');
            let responseString = '';
            res.on('data', function (data) {
                responseString += data;
            });
            res.on('end', function () {
                const result = parseJson(responseString);
                resolve({
                    success: !!result,
                    data: result || `json 解析失败: ${responseString}`
                });
            });

            req.on('error', function (e) {
                resolve({
                    success: false,
                    data: `发送请求错误: ${e.message}`
                });
            });
            req.on('timeout', function (e: any) {
                resolve({
                    success: false,
                    data: `发送请求超时: ${e.message}`
                });
            });
        });
        req.on('error', (e) => {
            resolve({
                success: false,
                data: `请求错误: ${e.message}`
            });
        });
        if (body && method !== 'get') {
            req.write(convertData(body));
        }
        req.end();
    });
}