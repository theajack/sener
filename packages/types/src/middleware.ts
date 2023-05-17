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
import { ISenerHelper, ISenerEnv } from 'sener';
import { MiddleWareReturn } from './enum';

export type IResponse = ServerResponse & {
  req: IncomingMessage;
}

export interface IHelperFunc {
  send404: (errorMessage?: string, header?: IJson<string>) => false;
  sendJson: (data: IJson, statusCode?: number, header?: IJson<string>) => false;
  sendText: (text: string, statusCode?: number, header?: IJson<string>) => false;
  sendHtml: (html: string, header?: IJson<string>) => false;
  sendResponse: (data: Partial<ISenerResponse>) => false;
}

export interface IMiddleWareDataBase extends IHttpInfo, ISenerHelper, IHelperFunc {
  request: IncomingMessage;
  response: IResponse;
  env: ISenerEnv & IJson;
}
export type IHookReturn = Partial<ISenerContext>|MiddleWareReturn|void|false;

export interface ISenerResponse<T = any> {
  data: T,
  statusCode?: number,
  headers?: IJson<string>;
  success?: boolean;
}

export interface ISenerContext extends
  Required<ISenerResponse>,
  IMiddleWareDataBase,
  IJson {
}

export type IMiddleWareHook = (
  ctx: ISenerContext
) => IPromiseMayBe<IHookReturn>;

export interface IMiddleWare {
  dir?: string;
  acceptOptions: boolean;
  name?: string;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
  enter?: IMiddleWareHook;
  request?: IMiddleWareHook;
  response?: IMiddleWareHook;
  leave?: IMiddleWareHook;
  helper?(): Record<string, any>;
}

export class MiddleWare implements IMiddleWare {
    dir?: string;
    name: string = '';
    acceptOptions: boolean = false;
    // accept404: boolean = false;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/no-empty-function
    enter (ctx: ISenerContext): IPromiseMayBe<IHookReturn> {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/no-empty-function
    request (ctx: ISenerContext): IPromiseMayBe<IHookReturn> {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/no-empty-function
    response (ctx: ISenerContext): IPromiseMayBe<IHookReturn> {};
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/no-empty-function
    leave (ctx: ISenerContext): IPromiseMayBe<IHookReturn> {};
    // @ts-ignore
    helper (): Record<string, any>|void {}
}

export interface IServerSendData extends ISenerResponse {
  response: IResponse,
}