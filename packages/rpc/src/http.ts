/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-03 00:03:04
 * @Description: Coding something
 */

import type { IJson, IMethod } from 'sener-types';
import { parseJson } from 'sener-types';
import { convertData, windowFetch } from './utils';

let _http: any, _https: any = null;

export interface IFetchOptions {
    credentials?: 'omit'|'same-origin'|'include',
    mode?: 'cors'|'no-cors'|'same-origin',
}
export interface IBaseOptions {
    url: string,
    method: IMethod, // get方式或post方式
    headers?: IJson,
    body?: any,
    query?: IJson,
    form?: boolean,
    traceid?: string,
    stringifyBody?: boolean,
    fetchOptions?: IFetchOptions,
}

export interface IHttpRequestOptions extends IBaseOptions {
    query?: any,
}

export interface IRPCResponse {
    success: boolean,
    data?: any,
    code?: number,
    msg: string,
    err?: any,
    [prop: string]: any,
}

export function request ({
    url, method, headers = {}, body, query, form, traceid, fetchOptions,
}: IHttpRequestOptions) {

    if (!form) headers = Object.assign({ 'Content-Type': 'application/json;charset=utf-8' }, headers || {});

    for (const k in body) {
        if (typeof body[k] === 'undefined') delete body[k];
    }

    if (typeof window !== 'undefined') {
        return windowFetch({ url, method, query, headers, body, form, fetchOptions });
    } else {
        return nodeRequest({ url, method, headers, query, body, traceid, stringifyBody: false });
    }
}


export function nodeRequest ({
    url, method, headers = {}, body, traceid, stringifyBody = true, query
}: IBaseOptions): Promise<IRPCResponse> {
    url = url + (query ? `${convertData(query)}` : '');
    // console.log('----host', host, path, method, headers, https, port, body);
    if (!_http) _http = require('http');
    if (!_https) _https = require('https');
    // if (!_http) _http = __CLIENT__ ? {}: require('http');
    // if (!_https) _https = __CLIENT__ ? {}: require('https');

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
                const fail = !result || (typeof result.code === 'number' && result.code !== 0);
                resolve({
                    success: !fail,
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
            req.write(stringifyBody ? JSON.stringify(body) : convertData(body, false));
        }
        req.end();
    });
}

export type IRequest = typeof request;