/*
 * @Autor: theajack
 * @Date: 2021-05-09 18:00:08
 * @LastEditors: Please set LastEditors
 */
import type {
    IJson, IMethod, IRouterReturn, IErrorGen, ISuccessGen,
} from 'sener-types';
import type { IRequest, IHttpRequestOptions, IRPCResponse } from './http';
import type { IParsedData, IRequestReturn } from './type';

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
    showLoading?: boolean,
}

export interface IRequestUtils {
    error: IErrorGen,
    success: ISuccessGen,
    request: IRequest,
}

export interface IRequestConsOptions extends ICommonRequestOptions {
    base?: string,
    utils: IRequestUtils,
    loading?: ()=>(()=>void),
}

export type IRPCRequestInterceptor = (data: IRequestOptions) => void|IRPCResponse;

export type IRPCRequestOnResponse = (data: IRPCResponse) => void|IRPCResponse;


export class BaseRequest {
    base: string;
    headers: IJson<string> = {};
    traceid = '';
    tk = '';
    setToken (tk: string) { this.tk = tk; }

    loading?: ()=>(()=>void);

    static Interceptor: IRPCRequestInterceptor;
    static OnResponse: IRPCRequestOnResponse;


    utils: IRequestUtils;

    constructor ({
        utils,
        base,
        headers,
        traceid,
        loading,
    }: IRequestConsOptions) {
        this.base = base || '';
        if (headers) this.headers = headers;
        if (traceid) this.traceid = traceid;
        this.utils = utils;
        this.loading = loading;
    }

    parseResult<T = any> (
        result: IRouterReturn<T>
    ): IParsedData<T> {
        const { data, code, msg, extra } = result.data;

        const spread = !!data && typeof data === 'object' && !(data instanceof Array);

        return {
            success: code === 0,
            msg,
            ...extra,
            ...spread ? data : { data },
        };
    }

    get<T=any> (url: string, query: IJson = {}, showLoading = true) {
        return this.request<T>({
            url,
            method: 'get',
            query,
            showLoading,
        });
    }

    post<T=any> (url: string, body: IJson = {}, form = false, showLoading = true) {
        return this.request<T>({
            url,
            method: 'post',
            body,
            form,
            showLoading,
        });
    }

    postForm<T=any> (url: string, body: IJson = {}, showLoading = true) {
        return this.post<T>(url, body, true, showLoading);
    }

    async postReturn<T=any> (url: string, body: IJson = {}, showLoading = true) {
        return this.parseResult<T>(await this.post<T>(url, body, false, showLoading));
    }
    async getReturn<T=any> (url: string, query: IJson = {}, showLoading = true) {
        return this.parseResult<T>(await this.get<T>(url, query, showLoading));
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
        showLoading,
    }: IRequestOptions): IRequestReturn<T> {

        // console.log('request11', body, query, method);

        const close = showLoading ? this.loading?.() : () => {};

        headers = Object.assign({}, this.headers, headers);

        let requestUrl = (/^https?:\/\//.test(url)) ? url: `${base}${url}`;

        const options: IHttpRequestOptions = {
            url: requestUrl,
            method, // get方式或post方式
            headers,
            body,
            query,
            form,
            traceid: this.traceid,
        };

        let response: IRPCResponse|null = null;

        if (BaseRequest.Interceptor) {
            const result = BaseRequest.Interceptor(options);
            if (result) response = result;
        }

        if (!response) {
            console.log('request options=', options);
            response = await this.utils.request(options);
            if (BaseRequest.OnResponse) {
                const result = BaseRequest.OnResponse(response);
                if (result) response = result;
            }
        }

        const { msg, data, success: suc, code = -1, err = null, extra } = response;
        // console.warn(`【${url} 请求返回】`, code, data, extra);

        close?.();
        if (!suc) {
            return this.utils.error(msg, code, err);
        }
        return this.utils.success(data, msg, extra);
    }
}