/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 09:28:20
 * @Description: Coding something
 */
import { IncomingHttpHeaders } from 'http';
import { IMiddleWare, IMiddleWareResponseReturn } from './middleware';
import { IServeMethod, IJson, IPromiseMayBe } from './common';

export interface IHttpInfo {
  requestHeaders: IncomingHttpHeaders;
  url: string;
  method: IServeMethod;
  query: IJson<string>;
  body: IJson<any>;
  buffer: Buffer|null;
  ip: string;
}

export interface ISenerOptions extends IServerOptions {
    middlewares?: (IMiddleWare|null)[];
}

export type IOnError = (err: {error: any, from: string}) => IPromiseMayBe<IMiddleWareResponseReturn>;

export interface IServerOptions {
  port?: number;
  onerror?: IOnError;
}

export interface IRouterReturn<TObject=any> {
    code: number;
    data: TObject;
    extra?: any;
    msg?: string;
}