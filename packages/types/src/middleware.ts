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

export type IResponse = ServerResponse & {
  req: IncomingMessage;
}

export interface IHelperFunc {
  response404: (errorMessage?: string, header?: IJson<string>) => ISenerResponse;
  responseJson: (data: IJson, statusCode?: number, header?: IJson<string>) => ISenerResponse;
  responseText: (text: string, statusCode?: number, header?: IJson<string>) => ISenerResponse;
  responseHtml: (html: string, header?: IJson<string>) => ISenerResponse;
  responseData: (data: Partial<ISenerResponse>) => ISenerResponse;
  markReturned: () => void;
}

export interface IMiddleWareDataBase extends IHttpInfo, ISenerHelper, IHelperFunc {
  request: IncomingMessage;
  response: IResponse;
  env: ISenerEnv & IJson;
  responded: boolean;
  isOptions: boolean; // 是否是 options method
  returned: boolean;
}
export type IHookReturn = Partial<ISenerContext>|void;

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

export type IMiddleHookNames = 'init' | 'enter' | 'leave';

export type IMiddleWareEnterReturn = IPromiseMayBe<IHookReturn>;
export type IMiddleWareInitReturn = IPromiseMayBe<IHookReturn>;

export type IMiddleWareResponseReturn = IPromiseMayBe<Partial<ISenerResponse>|void>;


export interface IMiddleWare {
  dir?: string;
  name?: string;
  acceptOptions?: boolean;
  acceptResponded?: boolean;
  acceptReturned?: boolean;
  // enter?: IMiddleWareHook;
  init?: (ctx: ISenerContext) => IMiddleWareInitReturn;
  enter?: (ctx: ISenerContext) => IMiddleWareEnterReturn;
  leave?: (ctx: ISenerContext) => IPromiseMayBe<void>;
  helper?(): Record<string, any>;
}

export class MiddleWare implements IMiddleWare {
    dir?: string;
    name: string = '';
    acceptOptions: boolean = false;
    acceptResponded: boolean = false;
    acceptReturned: boolean = false;
    // // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/no-empty-function
    // enter (ctx: ISenerContext): IPromiseMayBe<IHookReturn> {};

    // eslint-disable-next-line
    init (ctx: ISenerContext): IMiddleWareInitReturn {};
    // eslint-disable-next-line
    enter (ctx: ISenerContext): IMiddleWareEnterReturn {};
    // eslint-disable-next-line
    leave (ctx: ISenerContext): IPromiseMayBe<void> {};
    // @ts-ignore
    helper (): Record<string, any>|void {}
}

export interface IServerSendData extends ISenerResponse {
  response: IResponse,
}