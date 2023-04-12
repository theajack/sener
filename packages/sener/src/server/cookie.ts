/*
 * @Author: chenzhongsheng
 * @Date: 2023-04-11 23:09:55
 * @Description: Coding something
 */
import { IncomingMessage } from 'http';
import { IJson, IResponse } from 'sener-types';

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

export class Cookie {

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
    get (key: string) {
        const cookie = this.request.headers.cookie;
        if (!cookie) return '';
        const result = cookie.match(new RegExp(`(?<=(^| ))${key}=(.*?)(?=(;|$))`));
        if (!result) return '';
        return result[2];
    }
    getResponseCookie (key: string) {
        return this._cookie[key] || '';
    }
    set (key: string, value?: null|any) {
        if (typeof value === 'undefined') {
            Object.assign(this._cookie, parseCookie(key));
        } else if (value === null) {
            delete this._cookie[key];
        } else {
            this._cookie[key] = value;
        }
        this.response.setHeader('Set-Cookie', concatCookie(this._cookie));
    }
}