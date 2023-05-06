/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 17:23:29
 * @Description: Coding something
 */
import {
    MiddleWare, IJson, ICommonReturn, IPromiseMayBe,
    IMiddleWareRequestData, IMiddleWareResponseReturn,
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

    enter ({ headers }: IMiddleWareRequestData): IPromiseMayBe<ICommonReturn> {
        Object.assign(headers, this.headers);
    }

    // leave ({ headers }: IMiddleWareRequestData): IPromiseMayBe<ICommonReturn | IMiddleWareResponseReturn<any>> {
    //     // console.log('cors leave', headers, this.headers);
    // }

}
