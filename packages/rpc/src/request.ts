/*
 * @Autor: theajack
 * @Date: 2021-05-09 18:00:08
 * @LastEditors: Please set LastEditors
 */
import {
    IJson, IMethod, IMiddleWareResponseReturn,
    error, success, IRouterReturn
} from 'sener-types';
import { request } from './http';
import { IParsedData, IRequestReturn } from './type';

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
    tk = '';
    setToken (tk: string) { this.tk = tk; }
    constructor ({
        base,
        headers,
        traceid,
    }: IRequestConsOptions) {
        this.base = base;
        if (headers) this.headers = headers;
        if (traceid) this.traceid = traceid;
    }

    parseResult<T = any> (
        result: IMiddleWareResponseReturn<IRouterReturn<T>>
    ): IParsedData {
        const { data, code, msg, extra } = result.data;
        return data instanceof Array ? {
            success: code === 0,
            msg,
            data,
            ...extra,
        } : {
            success: code === 0,
            msg,
            ...extra,
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
    }: IRequestOptions): IRequestReturn<T> {
        headers = Object.assign({}, this.headers, headers);

        // console.log(body);
        const { msg, data, success: suc, code = -1, err = null, extra } = await request({
            url: base + url,
            method, // get方式或post方式
            headers,
            body,
            query,
            form,
            traceid: this.traceid,
        });
        console.warn(`【${url} 请求返回】`, data, extra);

        // console.log('request result', msg, suc, code);

        if (!suc) {
            return error(msg, code, err);
        }
        return success(data, msg, extra);
    }
}