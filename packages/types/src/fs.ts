/*
 * @Author: chenzhongsheng
 * @Date: 2023-04-15 15:19:24
 * @Description: Coding something
 */

import { isBrowser } from './utils';

// import fs from 'fs';
const fs = isBrowser() ? {} : require('fs');

export function makedir (dirPath: string, chmod = '777') {
    const isWindows = dirPath.includes('\\');
    const split = isWindows ? '\\' : '/';
    dirPath = (isWindows ? '' : '/') + dirPath.split(split).filter(n => !!n).join(split);
    const next = () => {
        dirPath = dirPath.substring(0, dirPath.lastIndexOf(split));
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

export function writeFile (filePath: string, content: string, options: any = 'utf-8') {
    makeFileDir(filePath);
    pureWriteFile(filePath, content, options);
}
export function pureWriteFile (filePath: string, content: string, options: any = 'utf-8') {
    fs.writeFileSync(filePath, content, options);
}


export function makeFileDir (filePath: string) {
    const dir = filePath.substring(0, filePath.lastIndexOf('/'));
    if (!fs.existsSync(dir)) {
        makedir(dir);
    }
}

export function readFile (filePath: string) {
    if (!fs.existsSync(filePath)) {
        return null;
    }
    return fs.readFileSync(filePath, 'utf-8');
}

export function removeDir (dirPath: string, recursive = false) {
    if (fs.existsSync(dirPath)) {
        fs.rmdirSync(dirPath, recursive ? { recursive: true }: {});
    }
}