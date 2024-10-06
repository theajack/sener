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
    isSuccess?: (data: any) => boolean,
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
    stringifyBody = true,
    isSuccess = (data) => data?.code === 0,
}: IHttpRequestOptions) {

    if (!form) headers = Object.assign({ 'Content-Type': 'application/json;charset=utf-8' }, headers || {});

    for (const k in body) {
        if (typeof body[k] === 'undefined') delete body[k];
    }

    if (typeof window !== 'undefined') {
        return windowFetch({ url, method, headers, body, query, form, fetchOptions, isSuccess });
    } else {
        return nodeRequest({ url, method, headers, body, query, traceid, stringifyBody, isSuccess });
    }
}


export function nodeRequest ({
    url, method, headers = {}, body, traceid, stringifyBody = true, query,
    isSuccess = (data) => data?.code === 0,
}: IBaseOptions): Promise<IRPCResponse> {
    url = url + ((query) ? `${convertData(query)}` : '');
    // console.log('nodeRequest url', url);
    // console.log('----host', host, path, method, headers, https, port, body);
    if (!_http) _http = require('http');
    if (!_https) _https = require('https');
    // if (!_http) _http = __CLIENT__ ? {}: require('http');
    // if (!_https) _https = __CLIENT__ ? {}: require('https');

    if (traceid) headers['x-trace-id'] = traceid;
    // console.log({ host, path, method, headers, https, port, body });
    return new Promise((resolve) => {
        const target = (url.startsWith('https://') ? _https : _http);
        // console.log('request start', method, headers);
        const req = target.request(url, {
            method, headers,
        }, function (res: any) {
            res.setEncoding('utf-8');
            let responseString = '';
            res.on('data', function (data: any) {
                // console.log('request data', data);
                responseString += data;
            });
            res.on('end', function () {
                let result = parseJson(responseString);
                // console.log('request end', responseString);
                let success = true;
                let $json = false;
                if (result) {
                    success = isSuccess(result);
                    $json = true;
                } else {
                    result = { content: responseString };
                }
                resolve({
                    success,
                    $json,
                    ...result,
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