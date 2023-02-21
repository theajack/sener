/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 22:24:20
 * @Description: Coding something
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

export function now () {
    return Date.now();
}

export const IS_DEV = process.env.NODE_ENV === 'development';

export const BASE_DIR = path.resolve(
    `${IS_DEV ? process.cwd() : os.homedir()}`,
    `./SenerJsonData`
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