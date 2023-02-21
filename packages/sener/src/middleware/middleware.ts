/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 16:17:44
 * @Description: Coding something
 */

import {
    IMiddleWareEnterData, IMiddleWareRequestData, ICommonReturn,
    IMiddleWareResponseData, IMiddleWareResponseReturn, IPromiseMayBe
} from '../type';


export type IMiddleWareRequest = (req: IMiddleWareRequestData) => IPromiseMayBe<ICommonReturn|IMiddleWareRequestData>;
export type IMiddleWareResponse = (
    res: IMiddleWareResponseData,
) => IPromiseMayBe<ICommonReturn|IMiddleWareResponseReturn>;

export type IMiddleWareEnter = (req: IMiddleWareEnterData) => IPromiseMayBe<ICommonReturn>;

export interface IMiddleWare {
    name?: string;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    enter?: IMiddleWareEnter;
    request?: IMiddleWareRequest;
    response?: IMiddleWareResponse;
}

export abstract class MiddleWare implements IMiddleWare {
    name = '';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/no-empty-function
    enter (req: IMiddleWareEnterData): IPromiseMayBe<ICommonReturn> {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/no-empty-function
    request (req: IMiddleWareRequestData): IPromiseMayBe<ICommonReturn|IMiddleWareRequestData> {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/no-empty-function
    response (res: IMiddleWareResponseData): IPromiseMayBe<ICommonReturn|IMiddleWareResponseReturn> {};
}

