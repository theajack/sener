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