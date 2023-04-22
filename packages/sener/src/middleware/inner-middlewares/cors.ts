/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 17:23:29
 * @Description: Coding something
 */
import {
    MiddleWare, IJson, MiddleWareReturn, ICommonReturn, IMiddleWareRequestData, IPromiseMayBe, IMiddleWareResponseData, IMiddleWareResponseReturn,
} from 'sener-types';

const DefaultHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Credentials': 'true',
};

type IHeaderKey = {
    [prop in keyof typeof DefaultHeaders]?: string;
}

export class Cors extends MiddleWare {
    headers: IHeaderKey;

    constructor (headers: IJson<string> & IHeaderKey = {}) {
        super();
        this.headers = Object.assign({}, DefaultHeaders, headers);
        // console.log('Cors', headers);
    }

    request ({ request, headers, sendResponse }: IMiddleWareRequestData): IPromiseMayBe<ICommonReturn | Partial<IMiddleWareRequestData>> {
        if (request.method === 'OPTIONS') {
            // console.log('OPTIONS', 'return cors');
            sendResponse({ statusCode: 200, headers: this.headers });
            return MiddleWareReturn.Return;
        }
        Object.assign(headers, this.headers);
    }

    leave ({ headers }: IMiddleWareResponseData): IPromiseMayBe<ICommonReturn | IMiddleWareResponseReturn<any>> {
        Object.assign(headers, this.headers);
    }
}
