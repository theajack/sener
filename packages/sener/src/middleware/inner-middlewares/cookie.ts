/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 17:23:29
 * @Description: Coding something
 */
import { IncomingMessage } from 'http';
import { MiddleWare, IJson, IResponse, ICommonReturn, IMiddleWareEnterData, IPromiseMayBe, pickAttrs, isExpired, countExpire } from 'sener-types';

declare module 'sener-types-extend' {
    interface ISenerHelper {
        cookie: CookieClient;
    }
}

function concatCookie (json: IJson<ICookieOptions>) {
    const cookie: string[] = [];
    for (const k in json) {
        cookie.push(cookieToString(k, json[k]));
    }
    return cookie;
}

function cookieToString (key: string, cookie: ICookieOptions) {
    let str = `${key}=${cookie.value};`;
    for (let k in cookie) {
        if (k === 'value') continue;
        // @ts-ignore
        let value = cookie[k];
        if (k === 'expire') {
            k = 'expires';
            const date = value <= 0 ? new Date() : new Date(value);
            value = date.toUTCString();
        }
        str += `${k}="${value};`;
    }
    return str;
}

function parseCookie (cookie: string) {
    const json: IJson = {};
    const result = cookie.matchAll(/(?<=(^| ))(.*?)=(.*?)(?=(;|$))/g);
    for (const item of result) {
        json[item[2]] = item[3];
    }
    return json;
}

export type ICookieSameSite = 'Lax' | 'Strict' | 'None';

export type ICookiePriority = 'Low' | 'Medium' | 'High';

interface ICookieOptions {
    value?: any;
    expire?: number;
    path?: string;
    domain?: string; // default: location.host
    secure?: boolean; // default: false
    sameSite?: ICookieSameSite; // default: Lax
    priority?: ICookiePriority; // default: Medium
    sameParty?: boolean; // default: false
}

export class CookieClient {

    private _cookie: IJson<ICookieOptions> = {};
    request: IncomingMessage;
    response: IResponse;
    constructor (
        request: IncomingMessage,
        response: IResponse,
    ) {
        this.request = request;
        this.response = response;
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
            return result[2];
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
    set (key: string|Record<string, any|ICookieOptions>, value?: null|any|ICookieOptions, options?: ICookieOptions) {
        const removeKeys: string[] = [];
        const single = (k: string, v: any|ICookieOptions) => {
            if (v === null) {
                v = { value: '', expire: -1 };
                removeKeys.push(k);
            } else if (typeof v !== 'object') {
                v = { value: v };
            }
            this._cookie[k] = v;
        };
        if (typeof key === 'object') {
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
        this.response.setHeader('Set-Cookie', concatCookie(this._cookie));
        removeKeys.forEach(k => {delete this._cookie[k];});
    }

    expire = countExpire;
}

export class Cookie extends MiddleWare {
    enter (data: IMiddleWareEnterData): IPromiseMayBe<ICommonReturn> {
        data.cookie = new CookieClient(data.request, data.response);
    }
}
