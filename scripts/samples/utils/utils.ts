import { now } from 'packages/sener/src/utils';
import { IJson, IMiddleWareResponseReturn } from 'packages/types/src';

/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-25 13:16:03
 * @Description: Coding something
 */
export function createTimeInfo () {
    const now = Date.now();
    return {
        'createTime': now,
        'lastUpdateTime': now
    };
}
export function createSimpleTimeInfo () {
    const now = Date.now();
    return {
        'ct': now,
        'ut': now
    };
}

export function error (
    msg = '请求失败', code = -1, data: any = null
): IMiddleWareResponseReturn {
    return {
        data: { code, data, msg }
    };
}

export function success (
    data: any = null, msg = 'success'
): IMiddleWareResponseReturn {
    return {
        data: { code: 0, data, msg }
    };
}

export function convertData (data: IJson) {
    let res = '';
    for (const key in data) {
        if (typeof data[key] === 'object') {
            res += (`${key}=${encodeURIComponent(JSON.stringify(data[key]))}&`);
        } else {
            res += (`${key}=${encodeURIComponent(data[key])}&`);
        }
    }
    res = res.substring(0, res.length - 1);
    return res;
}

export function generateExpired (mins: number) {
    const time = mins * 60 * 1000;
    return {
        expire: now() + time,
        time,
    };
}

export function isExpired (target: number) {
    return now() > target;
}

export function random (a: number, b: number): number {
    return (a + Math.round(Math.random() * (b - a)));
}


export function generateCode (len = 6, alpha = false) {
    let dict = '0123456789';
    if (alpha)  dict += 'abcdefghijklmnopqrstuvwxyz';
    let code = '';
    for (let i = 0; i < len; i++)
        code += dict[random(0, dict.length - 1)];
    return code;
}