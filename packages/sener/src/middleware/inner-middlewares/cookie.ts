/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 17:23:29
 * @Description: Coding something
 */
import { IncomingMessage } from 'http';
import { MiddleWare, IJson, IResponse, ICommonReturn, IMiddleWareEnterData, IPromiseMayBe, pickAttrs } from 'sener-types';

declare module 'sener-types-extend' {
    interface ISenerHelper {
        cookie: CookieClient;
    }
}

function concatCookie (json: IJson) {
    const cookie: string[] = [];
    for (const k in json) {
        cookie.push(`${k}=${json[k]}`);
    }
    return cookie;
}

function parseCookie (cookie: string) {
    const json: IJson = {};
    const result = cookie.matchAll(/(?<=(^| ))(.*?)=(.*?)(?=(;|$))/g);

    for (const item of result) {
        json[item[2]] = item[3];
    }
    return json;
}

export class CookieClient {

    private _cookie: IJson = {};
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
        const single = (k: string) => this._cookie[k] || '';
        return (key instanceof Array) ? pickAttrs(key, single) : single(key);
    }
    set (key: string|Record<string, any>, value?: null|any) {
        const single = (k: string, v: any) => {
            v === null ?
                delete this._cookie[k] :
                this._cookie[k] = v;
        };
        if (typeof key === 'object') {
            for (const k in key) single(k, key[k]);
        } else if (typeof value === 'undefined') {
            Object.assign(this._cookie, parseCookie(key));
        } else {
            single(key, value);
        }
        this.response.setHeader('Set-Cookie', concatCookie(this._cookie));
    }
}

export class Cookie extends MiddleWare {
    enter (data: IMiddleWareEnterData): IPromiseMayBe<ICommonReturn> {
        data.cookie = new CookieClient(data.request, data.response);
    }
}
