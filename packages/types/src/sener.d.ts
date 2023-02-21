/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 09:28:20
 * @Description: Coding something
 */
import { IncomingHttpHeaders } from 'http';
import { IServerOptions } from 'sener-types-extend';
import { IMiddleWare } from './middleware';
import { IServeMethod, IJson } from './utils';

export interface IHttpInfo {
  requestHeaders: IncomingHttpHeaders;
  url: string;
  method: IServeMethod;
  query: IJson<string>;
  body: IJson<any>;
}

interface ISenerOptions extends IServerOptions {
    middlewares?: IMiddleWare[];
}