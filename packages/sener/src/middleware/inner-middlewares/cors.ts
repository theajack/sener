/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 17:23:29
 * @Description: Coding something
 */
import {
    MiddleWare, IJson, MiddleWareReturn,
} from 'sener-types';

export class Cors extends MiddleWare {
    headers: IJson<string>;

    constructor (headers: IJson<string> = {
        'Access-Control-Allow-Origin': '*',
        'access-control-allow-methods': 'POST, GET, PUT, DELETE, OPTIONS',
        'access-control-allow-headers': '*',
    }) {
        super();
        this.headers = headers;
        // console.log('Cors', headers);
    }

    enter ({ request, sendResponse }: Parameters<MiddleWare['enter']>[0]): ReturnType<MiddleWare['enter']> {
        // console.log('enter cors');
        if (request.method === 'OPTIONS') {
            // console.log('OPTIONS', 'return cors');
            sendResponse({ statusCode: 200, headers: this.headers });
            return MiddleWareReturn.Return;
        }
    }

    response (res: Parameters<MiddleWare['response']>[0]): ReturnType<MiddleWare['response']> {
        if (!res.headers) {
            res.headers = { 'Content-Type': 'application/json;charset=UTF-8' };
        }
        Object.assign(res.headers, this.headers);
    }
}
