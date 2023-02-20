/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-18 16:26:52
 * @Description: Coding something
 */
import fs from 'fs';
import os from 'os';
import path from 'path';
import { IJson } from './type';

export function now () {
    return Date.now();
}

export function random (a: number, b: number) {
    return (a + Math.round(Math.random() * (b - a)));
};

export function parseJSON (data: any): Record<string, any>|any[]|null {
    if (typeof data === 'object') {return data;}
    try {
        return JSON.parse(data);
    } catch (e) {
        return null;
    }
}

export const IS_DEV = process.env.NODE_ENV === 'development';

export const BASE_DIR = path.resolve(
    `${IS_DEV ? process.cwd() : os.homedir()}`,
    `./SenerData`
);

export function makedir (dirPath: string) {

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
        fs.mkdirSync(dir, '700');
    }
}

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
