/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 09:45:37
 * @Description: Coding something
 */

// todo 为了兼容web-rpc引用
const path = isBrowser() ? {} : require('path');
const homedir = isBrowser() ? {} : require('os').homedir;
const crypto = isBrowser() ? {} : require('crypto');

export const IS_DEV = process.env.NODE_ENV === 'development';

let SENER_BASE_DIR = '';

export function isBrowser () {
    return typeof window !== 'undefined' && typeof window?.localStorage !== 'undefined';
}

export function senerBaseDir (): string;
export function senerBaseDir (v: string): void;
export function senerBaseDir (v?: string) {

    if (typeof v === 'string') {
        SENER_BASE_DIR = v;
        return;
    }
    if (!SENER_BASE_DIR) {
        SENER_BASE_DIR = path.resolve(
            `${IS_DEV ? process.cwd() : homedir()}`,
            `./sener-data`
        );
    }
    return SENER_BASE_DIR;
}

export function buildSenerDir (name: string, sub = '') {
    const base = path.resolve(senerBaseDir(), name);
    if (sub) return path.resolve(base, sub);
    return base;
}
export function md5 (text: string) {
    if (isBrowser()) {
        return 'NOT SUPPORTED IN BROWSER';
    }
    const hash = crypto.createHash('md5');
    hash.update(text);
    return hash.digest('hex');
}