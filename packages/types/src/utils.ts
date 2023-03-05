/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 09:45:37
 * @Description: Coding something
 */

import { IJson } from './common';
import fs from 'fs';
import path from 'path';
import { homedir } from 'os';

export function parseUrlSearch (url = '') {
    url = decodeURIComponent(url);
    const index = url.indexOf('?');
    if (index === -1) {
        return { url, search: '' };
    }
    return {
        url: url.substring(0, index),
        search: url.substring(index + 1),
    };
}

export function praseUrl (originUrl = '') {
    const { url, search } = parseUrlSearch(originUrl);
    return {
        url: url,
        query: parseParam(search),
    };
}

export function parseParam (str: string) {
    const query: IJson<string> = {};
    if (!str) return query;
    const result = str.matchAll(/(.*?)=(.*?)(&|$)/g);
    // @ts-ignore
    for (const item of result) {
        query[item[1]] = item[2];
    }
    return query;
}

export function now () {
    return Date.now();
}

export const IS_DEV = process.env.NODE_ENV === 'development';

export function makedir (dirPath: string, chmod = '777') {

    dirPath = '/' + dirPath.split('/').filter(n => !!n).join('/');

    const next = () => {
        dirPath = dirPath.substring(0, dirPath.lastIndexOf('/'));
    };

    const pathArr: string[] = [];
    while (dirPath && !fs.existsSync(dirPath)) {
        pathArr.unshift(dirPath);
        next();
    }
    for (const dir of pathArr) {
        fs.mkdirSync(dir, chmod);
    }
}


export function uuid () {
    const s: string[] = [];
    const hexDigits = '0123456789abcdef';
    for (let i = 0; i < 36; i++) s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);

    s[14] = '4';  // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr(((s[19] as any) & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = '-';
    s[13] = '-';
    s[18] = '-';
    s[23] = '-';
    const uuid = s.join('');
    return uuid;
}

export function isJson (data: object): boolean {
    return (
        typeof data === 'object' &&
      data.constructor.name === 'Object'
    );
}

export function dateToString ({
    date = new Date(),
    type = 'ms',
    comm = ':',
}: {
    date?: Date,
    type?: 'date' | 'minute' | 'second' | 'ms',
    comm?: string
} = {}): string {
    let dateStr = `${date.getFullYear()}-${fn(date.getMonth() + 1)}-${fn(date.getDate())}`;
    if (type === 'date') return dateStr;
    dateStr += ` ${fn(date.getHours())}${comm}${fn(date.getMinutes())}`;
    if (type === 'minute') return dateStr;
    dateStr += `${comm}${fn(date.getSeconds())}`;
    if (type === 'second') return dateStr;
    const mss = date.getMilliseconds();
    const msStr = mss < 100 ? `0${fn(mss)}` : mss;
    return `${dateStr}${comm}${msStr}`;
}

function fn (num: number) {
    return num < 10 ? (`0${num}`) : num;
}

export function random (a: number, b: number): number {
    return (a + Math.round(Math.random() * (b - a)));
}

export function parseJson (data: any) {
    if (typeof data === 'object') {return data;}
    try {
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
}

export function formatJson (data: object, format = false) {
    return format ? JSON.stringify(data, null, 4) : JSON.stringify(data);
}

export function delay (t: number) {
    return new Promise((resolve) => {
        setTimeout(resolve, t);
    });
}

const BASE_SENER_DIR = path.resolve(
    `${IS_DEV ? process.cwd() : homedir()}`,
    `./sener-data`
);

export function buildSenerDir (name: string) {
    return path.resolve(BASE_SENER_DIR, name);
}