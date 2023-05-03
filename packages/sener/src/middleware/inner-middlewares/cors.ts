/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 17:23:29
 * @Description: Coding something
 */
import {
    MiddleWare, IJson, ICommonReturn, IPromiseMayBe,
    IMiddleWareResponseData, IMiddleWareResponseReturn,
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
    acceptOptions = true;

    constructor (headers: IJson<string> & IHeaderKey = {}) {
        super();
        this.headers = Object.assign({}, DefaultHeaders, headers);
        // console.log('Cors', headers);
    }

    leave ({ headers }: IMiddleWareResponseData): IPromiseMayBe<ICommonReturn | IMiddleWareResponseReturn<any>> {
        Object.assign(headers, this.headers);
    }

}
