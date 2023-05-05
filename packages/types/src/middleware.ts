/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 16:17:44
 * @Description: Coding something
 */

import {
    IPromiseMayBe, IJson
} from './common';
import { IHttpInfo } from './sener.d';
import { ServerResponse, IncomingMessage } from 'http';
import { ISenerHelper, ISenerRequestData, ISenerEnv } from 'sener-types-extend';
import { MiddleWareReturn } from './enum';

export type IResponse = ServerResponse & {
  req: IncomingMessage;
}

export interface IHelperFunc {
  send404: (errorMessage?: string, header?: IJson<string>) => void;
  sendJson: (data: IJson, statusCode?: number, header?: IJson<string>) => void;
  sendText: (text: string, statusCode?: number, header?: IJson<string>) => void;
  sendHtml: (html: string, header?: IJson<string>) => void;
  sendResponse: (data: Partial<IMiddleWareResponseReturn>) => void;
}

export interface IMiddleWareDataBase extends IHttpInfo, ISenerHelper, IHelperFunc {
  request: IncomingMessage;
  response: IResponse;
  headers: IJson<string>;
  env: ISenerEnv & IJson;
}
export type ICommonReturn = MiddleWareReturn|void|false;

export interface IMiddleWareResponseReturn<T = any> {
  data: T,
  statusCode?: number,
  headers?: IJson<string>;
  success?: boolean;
}

export interface IMiddleWareRequestData extends
  Required<IMiddleWareResponseReturn>,
  IMiddleWareDataBase,
  ISenerRequestData, IJson {
}

export type IMiddleWareRequest = (
  req: IMiddleWareRequestData
) => IPromiseMayBe<ICommonReturn|Partial<IMiddleWareRequestData>>;
export type IMiddleWareResponse = (
  res: IMiddleWareRequestData,
) => IPromiseMayBe<ICommonReturn|IMiddleWareResponseReturn>;

export interface IMiddleWare {
  acceptOptions: boolean;
  name?: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  enter?: IMiddleWareRequest;
  request?: IMiddleWareRequest;
  response?: IMiddleWareResponse;
  leave?: IMiddleWareResponse;
  helper?(): any;
}

export class MiddleWare implements IMiddleWare {
    dir = '';
    name: string = '';
    acceptOptions: boolean = false;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/no-empty-function
    enter (req: IMiddleWareRequestData): IPromiseMayBe<ICommonReturn> {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/no-empty-function
    request (req: IMiddleWareRequestData): IPromiseMayBe<ICommonReturn|Partial<IMiddleWareRequestData>> {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/no-empty-function
    response (res: IMiddleWareRequestData): IPromiseMayBe<ICommonReturn|IMiddleWareResponseReturn> {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/no-empty-function
    leave (res: IMiddleWareRequestData): IPromiseMayBe<ICommonReturn|IMiddleWareResponseReturn> {};
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    helper () {}
}

export interface IServerSendData extends IMiddleWareResponseReturn {
  response: IResponse,
}