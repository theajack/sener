/*
 * @Autor: theajack
 * @Date: 2021-05-09 18:00:08
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-02-26 15:32:47
 * @Description: Coding something
 */
import http from 'http';
import _https from 'https';
import { IJson, IMethod, IMiddleWareResponseReturn } from 'packages/types/src';
import { convertData, error } from './utils';

export interface IRequestOptions {
  host?: string,
  port?: number,
  https?: boolean
  timeOut?: number;
  headers?: IJson<string|number>;
}

export class RequestHandler {
    host: string;
    port?: number;
    https: boolean;
    timeOut: number;
    headers: IJson<string>;
    constructor ({
        host = 'localhost',
        port,
        https = false,
        timeOut = 5000,
        headers = { 'Content-Type': 'application/json;charset=UTF-8' },
    }: {
      host?: string,
      port: number,
      https?: boolean
      timeOut?: number;
      headers?: IJson<string>;
    }) {
        this.host = host;
        this.port = port;
        this.https = https;
        this.timeOut = timeOut;
        this.headers = headers;
    }

    get (url: string, query: IJson = {}) {
        // console.log('GET', query);
        return this.request({
            url,
            method: 'get',
            data: query
        });
    }

    post (url: string, body: IJson = {}) {
        return this.request({
            url,
            method: 'post',
            data: body
        });
    }

    request ({
        url,
        method = 'get',
        data = {},
        headers = {},
        https = this.https,
        timeOut = this.timeOut,
        host = this.host,
        port = this.port,
    }: IRequestOptions & {url: string, method?: IMethod, data?: IJson}): Promise<IMiddleWareResponseReturn> {
        headers = Object.assign({}, this.headers, headers);
        return new Promise((resolve) => {
            try {
                const isGet = method === 'get';
                let dataString = convertData(data);
                if (!isGet) {
                    headers['Content-Length'] = dataString.length;
                    headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
                } else {
                    dataString = `?${dataString}`;
                    headers['Content-Type'] = 'application/json';
                }
                // http 头部
                const options: IJson = {
                    host,
                    path: `${url}${isGet ? dataString : ''}`, // get方式使用的地址
                    method, // get方式或post方式
                    headers
                };
                if (port) options.port = port;
                const target = (https ? _https : http);
                // console.log('options', options);
                const req = target.request(options, function (res) {
                    let timer: any = null;
                    const clearHttpTimeout = () => {
                        if (timer !== null) {
                            clearTimeout(timer);
                        }
                    };
                    if (timeOut !== 0) {
                        timer = setTimeout(() => {
                            req.abort();
                            resolve(error('发送请求超时'));
                        }, timeOut);
                    }
                    res.setEncoding('utf-8');
                    let responseString = '';
                    res.on('data', function (data) {
                        responseString += data;
                    });
                    res.on('end', function () {
                        clearHttpTimeout();
                        // 这里接收的参数是字符串形式,需要格式化成json格式使用
                        let result;
                        try {
                            result = JSON.parse(responseString);
                        } catch (e) {
                            result = error('json 解析失败' + responseString);
                        }
                        resolve(result);
                    });

                    req.on('error', function (e) {
                        clearHttpTimeout();
                        console.error('-----error-------', e);
                        resolve(error('发送请求错误'));
                    });
                    req.on('timeout', function (e: any) {
                        clearHttpTimeout();
                        console.error('-----timeout-------', e);
                        resolve(error('发送请求超时'));
                    });
                });
                req.on('error', (err) => {
                    resolve(error('请求错误', -1, err));
                });
                if (!isGet) {
                    req.write(dataString);
                }
                req.end();
            } catch (e) {
                resolve(error('请求异常', -2, e));
            }
        });
    }
}