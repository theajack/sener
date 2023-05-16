/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 09:28:20
 * @Description: Coding something
 */
import { IncomingHttpHeaders } from 'http';
import { IMiddleWare, ISenerContext, ISenerResponse, MiddleWare } from './middleware';
import { IServeMethod, IJson, IPromiseMayBe } from './common';

export type ICookieSameSite = 'Lax' | 'Strict' | 'None';

export type ICookiePriority = 'Low' | 'Medium' | 'High';

export interface ICookieOptions {
    value?: any;
    expire?: number;
    path?: string;
    domain?: string; // default: location.host
    secure?: boolean; // default: false
    sameSite?: ICookieSameSite; // default: Lax
    priority?: ICookiePriority; // default: Medium
    sameParty?: boolean; // default: false
}

export interface IHttpInfo {
  requestHeaders: IncomingHttpHeaders;
  url: string;
  method: IServeMethod;
  query: IJson<any>;
  body: IJson<any>;
  buffer: Buffer|null;
  ip: string;
}

export interface ISenerOptions extends IServerOptions {
    middlewares?: (IMiddleWare|MiddleWare|null)[];
    cookieOptions?: ICookieOptions;
}

export type IErrorFrom = 'enter' | 'request' | 'response' | 'leave';

export type IOnError = (err: {
  error: any,
  from: IErrorFrom,
  context: ISenerContext
}) => IPromiseMayBe<ISenerResponse>;

export interface IServerOptions {
  port?: number;
  onerror?: IOnError;
}

export interface IRouterData<T=any> {
    code: number;
    data: T;
    extra?: any;
    msg?: string;
    success?: boolean;
}

export type IRouterReturn<T=any> = ISenerResponse<IRouterData<T>>;

export type IRouterReturnPromise<T=any> = Promise<IRouterReturn<T>>