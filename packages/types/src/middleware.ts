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
import { ISenerHelper } from 'sener-types-extend';
import { MiddleWareReturn } from './enum';

export type IResponse = ServerResponse & {
  req: IncomingMessage;
}

export interface IHelperFunc {
  sendResponse: (data: IMiddleWareResponseReturn) => void;
  sendJson: (data: IJson, statusCode?: number) => void;
  send404: (errorMessage?: string) => void;
  sendText: (text: string, statusCode?: number) => void;
  sendHtml: (html: string) => void;
}

export interface IMiddleWareDataBase extends ISenerHelper, IHelperFunc {
  request: IncomingMessage;
  response: IResponse;
}
export type ICommonReturn = MiddleWareReturn|void;

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
  helper?(): any;
}

export class MiddleWare implements IMiddleWare {
    name: string = '';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/no-empty-function
    enter (req: IMiddleWareEnterData): IPromiseMayBe<ICommonReturn> {}
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/no-empty-function
    request (req: IMiddleWareRequestData): IPromiseMayBe<ICommonReturn|IMiddleWareRequestData> {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/no-empty-function
    response (res: IMiddleWareResponseData): IPromiseMayBe<ICommonReturn|IMiddleWareResponseReturn> {};
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    helper () {}
}

export interface IServerSendData extends IMiddleWareResponseReturn {
  response: IResponse,
}