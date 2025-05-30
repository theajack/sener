/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 17:23:29
 * @Description: Coding something
 */
import type { IncomingMessage } from 'http';
import type { IJson, IResponse, ISenerContext, ICookieOptions } from 'sener-types';
import { MiddleWare, pickAttrs, isExpired, countExpire } from 'sener-types';

declare module 'sener-extend' {
    interface ISenerHelper {
        cookie: CookieClient;
    }
}

function concatCookie (json: IJson<ICookieOptions>) {
    const cookie: string[] = [];
    for (const k in json) {
        const data = json[k];
        // let value = (typeof data === 'object' && !!data) ? data.value: data;
        // if(value !== null){
        cookie.push(cookieToString(k, data));
        // }
    }
    return cookie;
}

function cookieToString (key: string, cookie: ICookieOptions) {
    let str = `${key}=${encodeURIComponent(cookie.value)};`;
    for (let k in cookie) {
        if (k === 'value') continue;
        // @ts-ignore
        let value = cookie[k];
        if (k === 'expire') {
            k = 'expires';
            const date = value <= 0 ? new Date(Date.now() - 1000) : new Date(value);
            value = date.toUTCString();
        }
        str += `${k}=${value};`;
    }
    return (str);
}

function parseCookie (cookie: string) {
    const json: IJson = {};
    const result = cookie.matchAll(/(?<=(^| ))(.*?)=(.*?)(?=(;|$))/g);
    for (const item of result) {
        json[item[2]] = decodeURIComponent(item[3]);
    }
    return json;
}
export type ICookieValue = string | number | boolean | null | ICookieOptions;


export class CookieClient {

    private _cookie: IJson<ICookieOptions> = {};
    request: IncomingMessage;
    response: IResponse;
    clientDomain: string;
    private _options: ICookieOptions;
    constructor (
        request: IncomingMessage,
        response: IResponse,
        options: ICookieOptions = {}
    ) {
        this.request = request;
        this.response = response;
        this._options = options;
    }
    get(key: string): string;
    get<T extends string[]>(key: T): {[prop in keyof T]: string};
    get (key: string|string[]) {
        const isArr = key instanceof Array;
        const cookie = this.request.headers.cookie;
        if (!cookie) return isArr ? {} : '';
        const single = (k: string) => {
            const result = cookie.match(new RegExp(`(?<=(^| ))${k}=(.*?)(?=(;|$))`));
            if (!result) return '';
            return decodeURIComponent(result[2]);
        };
        return isArr ? pickAttrs(key, single) : single(key);
    }
    getResponseCookie(key: string): string;
    getResponseCookie<T extends string[]>(key: T): {[prop in keyof T]: string};
    getResponseCookie (key: string|string[]) {
        const single = (k: string) => {
            const opt = this._cookie[k];
            if (!opt) return '';
            if (isExpired(opt.expire)) {
                delete this._cookie[k];
                return '';
            }
            return this._cookie[k].value;
        };
        return (key instanceof Array) ? pickAttrs(key, single) : single(key);
    }
    set (key: string, value?: ICookieValue, options?: ICookieOptions): void;
    set (json: Record<string, ICookieValue>, options?: ICookieOptions): void;
    set (key: string|Record<string, ICookieValue>, value?: ICookieValue, options?: ICookieOptions) {
        const removeKeys: string[] = [];
        const single = (k: string, v: any|ICookieOptions) => {
            if (v === null) {
                v = { value: null, expire: -1 };
                removeKeys.push(k);
            } else if (typeof v !== 'object') {
                v = { value: v };
            }
            this._cookie[k] = Object.assign({}, this._options, v);
            // console.log('setcookie', k, this._cookie[k])
        };
        if (typeof key === 'object') {
            // console.log('set cookie', key);
            for (const k in key) single(k, key[k]);
        } else if (typeof value === 'undefined') { // string 形式设置多个
            Object.assign(this._cookie, parseCookie(key));
        } else {
            if (typeof options === 'object') {
                options.value = value;
                value = options;
            }
            single(key, value);
        }
        // console.log('concatCookie', this._cookie);
        this.response.setHeader('Set-Cookie', concatCookie(this._cookie));
        // console.log('Set-Cookie', concatCookie(this._cookie));
        removeKeys.forEach(k => {delete this._cookie[k];});
    }

    remove (key: string|string[], opt: ICookieOptions = {}) {
        opt = Object.assign(opt, { expire: -1 });
        if (typeof key === 'string') {
            this.set(key, '', opt);
        } else {
            const map: Record<string, ICookieValue> = {};
            for (const k of key)
                map[k] = Object.assign({ value: '' }, opt);
            this.set(map);
            // console.log('remove cookie', map)
        }
    }

    expire = countExpire;
}

export class Cookie extends MiddleWare {

    private _options: ICookieOptions;

    constructor (options: ICookieOptions = {}) {
        super();
        this._options = options;
    }

    init (ctx: ISenerContext) {
        if (!this._options.domain) {
            this._options.domain = ctx.clientDomain;
        }
        // console.log('this._options.domain=', this._options.domain);
        ctx.cookie = new CookieClient(ctx.request, ctx.response, this._options);
    }
}
