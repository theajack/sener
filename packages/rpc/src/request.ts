/*
 * @Autor: theajack
 * @Date: 2021-05-09 18:00:08
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-03-07 00:30:10
 * @Description: Coding something
 */
import { IJson, IMethod, IMiddleWareResponseReturn } from 'sener-types';
import { IBoolResult, IRouterReturn } from './type.d';
import { error, success } from './utils';
import { request } from './http';

interface ICommonRequestOptions {
    headers?: IJson<string>;
    traceid?: string;
}

export interface IRequestOptions extends ICommonRequestOptions {
    body?: IJson,
    query?: IJson,
    url: string,
    method?: IMethod,
    data?: IJson,
    form?: boolean,
    traceid?: string,
    base?: string,
}

export interface IRequestConsOptions extends ICommonRequestOptions {
    base: string,
}

export class Request {
    base: string;
    headers: IJson<string> = {};
    traceid: string = '';
    constructor ({
        base,
        headers,
        traceid,
    }: IRequestConsOptions) {
        this.base = base;
        if (headers) this.headers = headers;
        if (traceid) this.traceid = traceid;
    }

    parseResult<T = any> (result: IMiddleWareResponseReturn<IRouterReturn<T>>): IBoolResult & IJson {
        const { data, code, msg } = result.data;
        // console.log('result=', result, data, code, msg);
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

    post<T=any> (url: string, body: IJson = {}, form = false) {
        return this.request<T>({
            url,
            method: 'post',
            body,
            form,
        });
    }

    postForm<T=any> (url: string, body: IJson = {}) {
        return this.post<T>(url, body, true);
    }

    async postReturn<T=any> (url: string, body: IJson = {}) {
        return this.parseResult(await this.post<T>(url, body));
    }
    async getReturn<T=any> (url: string, query: IJson = {}) {
        return this.parseResult(await this.get<T>(url, query));
    }
    async requestReturn<T=any> (url: string, data: IJson = {}) {
        const isPost = url.startsWith('post:');
        url = url.replace(/^(post|get):/, '');
        return this.parseResult(
            await this[isPost ? 'post' : 'get']<T>(url, data)
        );
    }

    async request<T> ({
        url,
        method = 'get',
        body,
        query,
        headers = {},
        base = this.base,
        form,
    }: IRequestOptions): Promise<IMiddleWareResponseReturn<IRouterReturn<T>>> {
        headers = Object.assign({}, this.headers, headers);

        // console.log(body);
        const { msg, data, success: suc, code = -1, err = null } = await request({
            url: base + url,
            method, // get方式或post方式
            headers,
            body,
            query,
            form,
            traceid: this.traceid,
        });

        // console.log('request result', msg, suc, code);

        if (!suc) {
            return error(msg, code, err);
        }
        return success(data, msg);
    }
}