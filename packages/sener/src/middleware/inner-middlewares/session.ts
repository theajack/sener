/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 17:23:29
 * @Description: Coding something
 */
import fs from 'fs';
import path from 'path';
import { MiddleWare, ICommonReturn, IMiddleWareEnterData, IPromiseMayBe, buildSenerDir, makedir, uuid, md5, pickAttrs } from 'sener-types';
import { CookieClient } from './cookie';

declare module 'sener-types-extend' {
    interface ISenerHelper {
        session: SessionClient;
    }
}

export class SessionClient {
    static baseDir = '';
    static idGenerator: () => string;
    sessionId = '';
    filePath = '';
    constructor (cookie: CookieClient) {
        const KEY = '_SENER_SID';
        let sessionId = cookie.get(KEY);
        if (!sessionId) {
            sessionId = SessionClient.idGenerator();
            cookie.set(KEY, sessionId);
        }
        this.sessionId = sessionId;
        this.filePath = path.resolve(SessionClient.baseDir, sessionId);
    }
    get(key: string): any;
    get<T extends string[]>(key: T): {[prop in keyof T]: any};
    get (key: string|string[]): any {
        const isArr = key instanceof Array;
        if (!fs.existsSync(this.filePath))
            return isArr ? {} : undefined;
        const content = fs.readFileSync(this.filePath, { encoding: 'utf-8' });
        const data = JSON.parse(content);
        return isArr ? pickAttrs(key, k => data[k]) : data[key];
    }
    set (key: string|Record<string, any>, value?: null|any) {
        let data: any = {};
        if (fs.existsSync(this.filePath)) {
            const content = fs.readFileSync(this.filePath, 'utf-8');
            data = JSON.parse(content);
        }
        const single = (k: string, v: any) => v === null ? (delete data[k]) : data[k] = v;
        if (typeof key === 'object') {
            for (const k in key) single(k, key[k]);
        } else {
            single(key, value);
        }
        fs.writeFileSync(this.filePath, JSON.stringify(data), 'utf-8');
    }
}

function generateSessionId (): string {
    return md5(`${uuid()}_${Date.now()}`);
}

export class Session extends MiddleWare {
    session: SessionClient;
    constructor ({
        idGenerator = generateSessionId
    }: {
        idGenerator?: ()=>string
    } = {}) {
        super();
        SessionClient.idGenerator = idGenerator;
        SessionClient.baseDir = buildSenerDir('session');
        makedir(SessionClient.baseDir);
    }
    enter (data: IMiddleWareEnterData): IPromiseMayBe<ICommonReturn> {
        data.session = new SessionClient(data.cookie);
    }
}
