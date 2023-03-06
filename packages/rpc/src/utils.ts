/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-06 23:27:33
 * @Description: Coding something
 */
import { IJson, IMiddleWareResponseReturn } from 'sener-types';
import { IRouterReturn } from './type';

export function error<T = null> (
    msg = '请求失败', code = -1, data: T = null as any
): IMiddleWareResponseReturn<IRouterReturn<T>> {
    return {
        data: { code, data, msg }
    };
}

export function success<T = any> (
    data: T = null as any, msg = 'success'
): IMiddleWareResponseReturn<IRouterReturn<T>> {
    return {
        data: { code: 0, data, msg }
    };
}

export function convertData (data: IJson, isSearch = true) {
    let res = '';
    for (const key in data) {
        if (typeof data[key] === 'object') {
            res += (`${key}=${encodeURIComponent(JSON.stringify(data[key]))}&`);
        } else {
            res += (`${key}=${encodeURIComponent(data[key])}&`);
        }
    }
    res =  `${isSearch ? '?' : ''}${res.substring(0, res.length - 1)}`;
    return res;
}
