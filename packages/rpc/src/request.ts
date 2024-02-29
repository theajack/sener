/*
 * @Autor: theajack
 * @Date: 2021-05-09 18:00:08
 * @LastEditors: Please set LastEditors
 */
import {
    IJson, IMethod,
    error, success, IRouterReturn
} from 'sener-types';
import { IHttpRequestOptions, IRPCResponse, request, IFetchOptions } from './http';
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
    fetchOptions?: IFetchOptions,
}

export interface IRequestConsOptions extends ICommonRequestOptions {
    base: string,
}

export type IRPCRequestInterceptor = (data: IRequestOptions) => void|IRPCResponse;

export type IRPCRequestOnResponse = (data: IRPCResponse) => void|IRPCResponse;


export class Request {
    base: string;
    headers: IJson<string> = {};
    traceid: string = '';
    tk = '';
    setToken (tk: string) { this.tk = tk; };

    static Interceptor: IRPCRequestInterceptor;
    static OnResponse: IRPCRequestOnResponse;

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
        result: IRouterReturn<T>
    ): IParsedData {
        const { data, code, msg, extra } = result.data;

        const spread = !!data && typeof data === 'object' && !(data instanceof Array);

        return {
            success: code === 0,
            msg,
            ...extra,
            ...spread ? data : { data },
        };
    }

    get<T=any> (url: string, query: IJson = {}, fetchOptions?: IFetchOptions) {
        return this.request<T>({
            url,
            method: 'get',
            query,
            fetchOptions,
        });
    }

    post<T=any> (url: string, body: IJson = {}, fetchOptions?: IFetchOptions, form = false) {
        return this.request<T>({
            url,
            method: 'post',
            body,
            form,
            fetchOptions,
        });
    }

    postForm<T=any> (url: string, body: IJson = {}, fetchOptions?: IFetchOptions) {
        return this.post<T>(url, body,fetchOptions, true);
    }

    async postReturn<T=any> (url: string, body: IJson = {}, fetchOptions?: IFetchOptions) {
        return this.parseResult(await this.post<T>(url, body, fetchOptions));
    }
    async getReturn<T=any> (url: string, query: IJson = {}, fetchOptions?: IFetchOptions) {
        return this.parseResult(await this.get<T>(url, query, fetchOptions));
    }
    async requestReturn<T=any> (url: string, data: IJson = {}, fetchOptions?: IFetchOptions) {
        const isPost = url.startsWith('post:');
        url = url.replace(/^(post|get):/, '');
        return this.parseResult(
            await this[isPost ? 'post' : 'get']<T>(url, data, fetchOptions)
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
        fetchOptions,
    }: IRequestOptions): IRequestReturn<T> {
        headers = Object.assign({}, this.headers, headers);

        const options: IHttpRequestOptions = {
            url: base + url,
            method, // get方式或post方式
            headers,
            body,
            query,
            form,
            traceid: this.traceid,
            fetchOptions,
        };

        let response: IRPCResponse|null = null;

        if (Request.Interceptor) {
            const result = Request.Interceptor(options);
            if (result) response = result;
        }

        if (!response) {
            response = await request(options);
            if (Request.OnResponse) {
                const result = Request.OnResponse(response);
                if (result) response = result;
            }
        }

        const { msg, data, success: suc, code = -1, err = null, extra } = response;
        // console.warn(`【${url} 请求返回】`, code, data, extra);

        if (!suc) {
            return error(msg, code, err);
        }
        return success(data, msg, extra);
    }
}