/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 16:17:44
 * @Description: Coding something
 */

import type {
    IPromiseMayBe, IJson
} from './common';
import type { IHttpInfo } from './sener.d';
import type { ServerResponse, IncomingMessage } from 'http';
import type { ISenerHelper, ISenerEnv } from 'sener-extend';

export type IResponse = ServerResponse & {
  req: IncomingMessage;
}

export interface IHelperFunc {
  response404: (errorMessage?: string, header?: IJson<string>) => ISenerResponse; // 构造404响应
  responseJson: (data: IJson, statusCode?: number, header?: IJson<string>) => ISenerResponse; // 构造json响应
  responseText: (text: string, statusCode?: number, header?: IJson<string>) => ISenerResponse; // 构造文本响应
  responseHtml: (html: string, header?: IJson<string>) => ISenerResponse; // 构造html响应
  // alias
  html: (html: string, header?: IJson<string>) => ISenerResponse; // 构造html响应
  responseData: (data: Partial<ISenerResponse>) => ISenerResponse; // 构造通用响应
  markSended: () => void; // 标记为已提前返回响应
}

export interface IMiddleWareDataBase extends IHttpInfo, ISenerHelper, IHelperFunc {
  request: IncomingMessage;
  response: IResponse;
  env: ISenerEnv & IJson;
  responded: boolean;
  redirect: (url: string, query?: IJson, header?: IJson) => void,
  isOptions: boolean; // 是否是 options method
  sended: boolean;
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

export type IMiddleWareResponseReturn = IPromiseMayBe<Partial<ISenerResponse>|void>;


export interface IMiddleWare {
  dir?: string;
  name?: string;
  acceptOptions?: boolean;
  acceptResponded?: boolean;
  acceptSended?: boolean;
  // enter?: IMiddleWareHook;
  init?: IMiddleWareHook;
  enter?: IMiddleWareHook;
  leave?: (ctx: ISenerContext) => IPromiseMayBe<void>;
  helper?(): Record<string, any>;
}

export class MiddleWare implements IMiddleWare {
    dir?: string;
    name: string = '';
    acceptOptions: boolean = false;
    acceptResponded: boolean = false;
    acceptSended: boolean = false;
    // // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars, @typescript-eslint/no-empty-function
    // enter (ctx: ISenerContext): IPromiseMayBe<IHookReturn> {};

    // eslint-disable-next-line
    init (ctx: ISenerContext): IHookReturn {};
    // eslint-disable-next-line
    enter (ctx: ISenerContext): IHookReturn {};
    // eslint-disable-next-line
    leave (ctx: ISenerContext): IPromiseMayBe<void> {};
    // @ts-ignore
    helper (): Record<string, any>|void {}
}

export interface IServerSendData extends ISenerResponse {
  response: IResponse,
}