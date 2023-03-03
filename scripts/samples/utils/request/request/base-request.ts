/*
 * @Autor: theajack
 * @Date: 2021-05-09 18:00:08
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-03-03 02:29:26
 * @Description: Coding something
 */
import { IJson, IMethod, IMiddleWareResponseReturn } from 'packages/types/src';
import { IBoolResult, IRouterReturn } from 'scripts/samples/types/sample';
import { error, success } from '../../utils';
import { request } from '../http';

export interface IRequestOptions {
  host?: string,
  port?: number,
  https?: boolean
  timeOut?: number;
  headers?: IJson<string|number>;
  body?: IJson,
  query?: IJson,
}

export class Request {
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

    parseResult<T = any> (result: IMiddleWareResponseReturn<IRouterReturn<T>>): IBoolResult & IJson {
        const { data, code, msg } = result.data;
        return {
            success: code === 0,
            msg,
            ...data,
        };
    }

    get<T=any> (url: string, query: IJson = {}) {
        return this.request<T>({
            url,
            method: 'get',
            query
        });
    }

    post<T=any> (url: string, body: IJson = {}) {
        return this.request<T>({
            url,
            method: 'post',
            body
        });
    }

    async request<T> ({
        url,
        method = 'get',
        body,
        query,
        headers = {},
        https = this.https,
        host = this.host,
        port = this.port,
    }: IRequestOptions & {
        url: string, method?: IMethod, data?: IJson
    }): Promise<IMiddleWareResponseReturn<IRouterReturn<T>>> {
        headers = Object.assign({}, this.headers, headers);

        const { result, success: suc, code = -1, err = null } = await request({
            host,
            path: url, // get方式使用的地址
            method, // get方式或post方式
            headers,
            https,
            port,
            body,
            query,
        });

        if (!suc) {
            return error(result, code, err);
        }
        return success(result.data);
    }
}