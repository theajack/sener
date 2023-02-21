/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 16:17:44
 * @Description: Coding something
 */

import {
    IPromiseMayBe, IJson
} from './utils.d';
import { IHttpInfo } from './sener.d';
import http from 'http';
import { ISenerHelper } from 'sener-types-extend';

// @ts-ignore
export type IResponse = http.ServerResponse<http.IncomingMessage> & {
  req: http.IncomingMessage;
}

export interface IMiddleWareDataBase extends ISenerHelper {
  request: http.IncomingMessage;
  response: IResponse;
}
export type ICommonReturn = null|boolean|void;

export interface IMiddleWareEnterData extends IMiddleWareDataBase {}

export interface IMiddleWareResponseReturn {
  data: any,
  statusCode?: number,
  headers?: IJson<string>
}

export interface IMiddleWareResponseData extends
  IMiddleWareDataBase,
  IMiddleWareResponseReturn,
  IHttpInfo {
}

export interface IMiddleWareRequestData extends IMiddleWareDataBase, IHttpInfo {
}

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

export interface IServerSendData extends IMiddleWareResponseReturn {
  response: IResponse,
}