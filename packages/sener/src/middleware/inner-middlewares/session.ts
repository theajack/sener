/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 17:23:29
 * @Description: Coding something
 */
import path from 'path';
import type {  ISenerContext } from 'sener-types';
import {
    MiddleWare, buildSenerDir, makedir, uuid, md5, pickAttrs, isExpired, countExpire,
    strToTime, dateToString, removeDir, now, pureWriteFile, readFile, makeFileDir,
} from 'sener-types';
import type { CookieClient } from './cookie';

const DefaultStoreDays = 2;

declare module 'sener-extend' {
    interface ISenerHelper {
        session: SessionClient;
    }
}

interface ISessionValue {
    value: any;
    expire?: number;
}

const SessionExpired = Symbol('session_expired');

interface ISessionClientOptions {
    idGenerator?: ()=>string;
    storeDays?: number;
}


export class SessionClient {
    static baseDir = '';
    static idGenerator = generateSessionId;
    static _timer: any = null;
    static init ({ idGenerator, storeDays = DefaultStoreDays }: ISessionClientOptions) {
        if (idGenerator) SessionClient.idGenerator = idGenerator;
        SessionClient.baseDir = buildSenerDir('session');
        makedir(SessionClient.baseDir);
        if (!SessionClient._timer) {
            // ! 每天清除一次session
            // ! session最长存储时间默认为2天
            SessionClient._timer = setInterval(() => {
                const dirPath = path.resolve(
                    SessionClient.baseDir,
                    dateToString({
                        date: new Date(now() - strToTime(`${storeDays}d`)),
                        type: 'date'
                    })
                );
                removeDir(dirPath, true);
            }, strToTime('1d'));
        }
    }
    sessionId = '';
    Expired = SessionExpired;
    constructor (cookie: CookieClient, storeDays = DefaultStoreDays) {
        if (!cookie) {
            const err = 'Session: cookie middleware is required';
            console.error(err);
            throw new Error(err);
        }
        const KEY = '_SENER_SID';
        let sessionId = cookie.get(KEY);
        // console.log('_SENER_SID =', sessionId);
        if (!sessionId) {
            sessionId = SessionClient.idGenerator();
            // console.log('SET _SENER_SID =', sessionId);
            cookie.set(KEY, sessionId, { expire: cookie.expire(`${storeDays}d`), path: '/' });
        }
        this.sessionId = sessionId;
    }

    private _filePath = '';
    get filePath(){
        if(!this._filePath){
            this._filePath = path.resolve(SessionClient.baseDir, `./${dateToString({ type: 'date' })}/${this.sessionId}`);
            makeFileDir(this._filePath);
        }
        return this._filePath;
    }

    get(key: string): any;
    get<T extends string[]>(key: T): {[prop in keyof T]: any};
    get (key: string|string[]): any {
        const isArr = key instanceof Array;
        const content = readFile(this.filePath);
        if (content === null)
            return isArr ? {} : undefined;
        const data = JSON.parse(content);
        const single = (k: string) => {
            const v = data[k];
            if (typeof v === 'undefined') return undefined;
            if (isExpired(v.expire)) return this.Expired;
            return v.value;
        };
        return isArr ? pickAttrs(key, single) : single(key);
    }
    set (key: string|Record<string, null|any>, value?: null|any|number, expire?: number) {
        let data: any = {};
        const content = readFile(this.filePath);
        if (content) data = JSON.parse(content);
        const single = (k: string, v: any) => {
            if (v === null) return (delete data[k]);
            const value: ISessionValue = { value: v };
            if (typeof expire === 'number') value.expire = expire;
            data[k] = value;
        };
        if (typeof key === 'object') {
            expire = value;
            for (const k in key) single(k, key[k]);
        } else {
            single(key, value);
        }
        pureWriteFile(this.filePath, JSON.stringify(data));
    }
    remove (key: string|string[]) {
        if (typeof key === 'string') {
            this.set(key, null);
        } else {
            const map: any = {};
            for (const k of key)
                map[k] = null;
            this.set(map);
        }
    }
    isExpired (value: any) {
        return value === SessionExpired;
    }
    expire = countExpire;
}

function generateSessionId (): string {
    return md5(`${uuid()}_${Date.now()}`);
}

export class Session extends MiddleWare {
    session: SessionClient;

    options: ISessionClientOptions;
    constructor (options: ISessionClientOptions = {}) {
        super();
        this.options = options;
        SessionClient.init(options);
    }
    init (ctx: ISenerContext) {
        ctx.session = new SessionClient(ctx.cookie, this.options.storeDays);
    }
}
