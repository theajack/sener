/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 09:45:37
 * @Description: Coding something
 */

import path from 'path';
import { homedir } from 'os';
import crypto from 'crypto';

// const path = __CLIENT__ ? {} : require('path');
// const homedir = __CLIENT__ ? {} :require('os').homedir;
// const crypto = __CLIENT__ ? {} : require('crypto')

export const IS_DEV = process.env.NODE_ENV === 'development';

let SENER_BASE_DIR = '';

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
    const hash = crypto.createHash('md5');
    hash.update(text);
    return hash.digest('hex');
}