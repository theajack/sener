/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 09:45:37
 * @Description: Coding something
 */

import { IJson } from './common';
import fs from 'fs';

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