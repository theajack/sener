/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-06 23:27:33
 * @Description: Coding something
 */
import { IJson } from 'sener-types';

export function convertData (data: IJson, isSearch = true) {
    let res = '';
    for (const key in data) {
        const v = data[key];
        if (typeof v === 'undefined') continue;
        if (typeof v === 'object') {
            res += (`${key}=${encodeURIComponent(JSON.stringify(v))}&`);
        } else {
            res += (`${key}=${encodeURIComponent(v)}&`);
        }
    }
    res = `${isSearch ? '?' : ''}${res.substring(0, res.length - 1)}`;
    return res;
}
