/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 09:28:20
 * @Description: Coding something
 */
import { IncomingHttpHeaders } from 'http';
import { IMiddleWare } from './middleware';
import { IServeMethod, IJson } from './common';

export interface IHttpInfo {
  requestHeaders: IncomingHttpHeaders;
  url: string;
  method: IServeMethod;
  query: IJson<string>;
  body: IJson<any>;
  buffer: Buffer|null;
}

export interface ISenerOptions extends IServerOptions {
    middlewares?: (IMiddleWare|null)[];
}

export interface IServerOptions {
  port?: number;
}

export interface IRouterReturn<TObject=any> {
    code: number;
    data: TObject;
    extra?: any;
    msg?: string;
}