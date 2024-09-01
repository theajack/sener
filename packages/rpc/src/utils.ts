/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-06 23:27:33
 * @Description: Coding something
 */
import type { IJson } from 'sener-types';
import type { IBaseOptions, IRPCResponse } from './http';

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


export async function windowFetch ({
    url, method, headers = {}, body, form, query
}: IBaseOptions): Promise<IRPCResponse> {
    url = url + (query ? `${convertData(query)}` : '');
    const options: RequestInit = {
        method,
        headers,
        mode: 'cors',
        // credentials: 'include',
        credentials: 'same-origin',
    };
    if (method !== 'get' && body) {
        options.body = form ? body : JSON.stringify(body);
    }
    // @ts-ignore
    if (!form && !options.headers['content-type']) {
        // @ts-ignore
        options.headers['content-type'] = 'application/json';
    }
    try {
        // console.log('windowFetch=', options)
        const result = await fetch(url, options);

        const json = await result.json();
        return { success: json.code === 0, ...json };
    } catch (e) {
        return { success: false, msg: `fetch失败: ${e.message}` };
    }
}