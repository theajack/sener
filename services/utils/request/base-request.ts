/*
 * @Autor: theajack
 * @Date: 2021-05-09 18:00:08
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2023-03-05 01:17:54
 * @Description: Coding something
 */
import { IJson, IMethod, IMiddleWareResponseReturn } from 'packages/types/src';
import { IBoolResult, IRouterReturn } from 'services/types/sample';
import { error, success } from '../utils';
import { request } from './http';

// export function RequestMethod (...args: string[]) {
//     let method: 'get'|'post' = 'get';
//     let url = args.shift() || '';
//     if (url.startsWith('post:')) {
//         url = url.substring(5);
//         method = 'post';
//     } else if (url.startsWith('get:')) {
//         url = url.substring(5);
//     }
//     return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
//         descriptor.value = (...args: any[]) => {
//             const options: IJson = { url, method };
//             const data: IJson = {};
//             args.forEach((key, index) => {
//                 data[key] = args[index];
//             });
//             options[method === 'get' ? 'query' : 'body'] = data;
//             console.log('targettargettarget', target, target.host);
//             return target.request(options);
//         };
//     };
// }

export interface IRequestOptions extends IRequestConsOptions {
  timeOut?: number;
  body?: IJson,
  query?: IJson,
  url: string,
  method?: IMethod,
  data?: IJson,
  form?: boolean,
  traceid?: string,
}

export interface IRequestConsOptions {
    host?: string,
    port?: number,
    https?: boolean
    headers?: IJson<string>;
    base?: string;
    traceid?: string;
}

export class Request {
    host: string;
    port?: number;
    https: boolean;
    headers: IJson<string>;
    base: string;
    traceid: string;
    constructor ({
        host = 'localhost',
        port,
        https,
        headers = {},
        base = '',
        traceid = '',
    }: IRequestConsOptions) {
        this.host = host;
        this.port = port;
        this.https = https ?? (host !== 'localhost');
        this.headers = headers;
        this.base = base;
        this.traceid = traceid;
        // console.log('this', this.host, this.port);
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
        https = this.https,
        host = this.host,
        port = this.port,
        base = this.base,
        form,
    }: IRequestOptions): Promise<IMiddleWareResponseReturn<IRouterReturn<T>>> {
        headers = Object.assign({}, this.headers, headers);

        // console.log(body);
        const { msg, data, success: suc, code = -1, err = null } = await request({
            host,
            path: base + url, // get方式使用的地址
            method, // get方式或post方式
            headers,
            https,
            port,
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


// ! 类装饰器 无法支持类型提示
// function RequestClass<Map> (map: {
//     [key in keyof Map]: string[];
// }) {
//     return function AA<T extends {new (...args:any[]):{}}>(constructor:T) {
//         class Request extends constructor {
//             newProperty = 'new property';
//             hello = 'override';
//         };
//         for (const k in map) {
//             let method: 'get'|'post' = 'get';
//             let url = map[k].shift() || '';
//             if (url.startsWith('post:')) {
//                 url = url.substring(5);
//                 method = 'post';
//             } else if (url.startsWith('get:')) {
//                 url = url.substring(5);
//             }
//             console.log('method1', method);
//             Request.prototype[k] = function (...args: any[]) {
//                 console.log('method', method);
//                 const options: IJson = {
//                     url,
//                     method,
//                 };
//                 const data: IJson = {};
//                 map[k].forEach((key, index) => {
//                     data[key] = args[index];
//                 });
//                 options[method === 'get' ? 'query' : 'body'] = data;
//                 console.log(options);
//                 return this.request(options);
//             };
//         }
//         return Request;
//     };
// }


// @RequestClass<IUserFunc>({
//     ll: [ 'post:/user/login', 'nickname', 'pwd' ]
// })
// @ts-ignore