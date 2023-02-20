/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 16:17:44
 * @Description: Coding something
 */

import {
    IMiddleWareEnterData, IMiddleWareRequestData,
    IMiddleWareResponseData, IPromiseMayBe
} from '../type';

type ICommonReturn = null|boolean|void;

export type IMiddleWareRequest = (req: IMiddleWareRequestData) => IPromiseMayBe<ICommonReturn|IMiddleWareRequestData>;
export type IMiddleWareResponse = (
    res: IMiddleWareResponseData,
    req: IMiddleWareRequestData
) => IPromiseMayBe<ICommonReturn|IMiddleWareResponseData>;

export type IMiddleWareEnter = (req: IMiddleWareEnterData) => IPromiseMayBe<ICommonReturn>;

export interface IMiddleWare {
    name?: string;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    enter? (req: IMiddleWareEnterData): IPromiseMayBe<ICommonReturn>;
    request? (req: IMiddleWareRequestData): IPromiseMayBe<ICommonReturn|IMiddleWareRequestData>;
    response? (
        res: IMiddleWareResponseData,
        req: IMiddleWareRequestData
    ): IPromiseMayBe<ICommonReturn|IMiddleWareResponseData>;
}

export abstract class MiddleWare implements IMiddleWare {
    name = '';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/no-empty-function
    enter (req: IMiddleWareEnterData): IPromiseMayBe<ICommonReturn> {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/no-empty-function
    request (req: IMiddleWareRequestData): IPromiseMayBe<ICommonReturn|IMiddleWareRequestData> {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/no-empty-function
    response (res: IMiddleWareResponseData, req: IMiddleWareRequestData): IPromiseMayBe<ICommonReturn|IMiddleWareResponseData> {};
}