/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-19 01:28:49
 * @Description: Coding something
 */
import http from 'http';
import { ISenerHelper } from 'sener-types';
import { MiddleWare } from './middleware/middleware';
import { Router } from './server/router';

export interface IJson<T=any> {
    [prop: string]: T;
}

export type IMethod = 'get'|'post'|'delete'|'put';

export type IServeMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type IRouter = IJson<IRouterHandler>;

// @ts-ignore
type IResponse = http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
}

interface IMiddleWareDataBase extends ISenerHelper {
    request: http.IncomingMessage;
    response: IResponse;
}
export type ICommonReturn = null|boolean|void;

export type IRouterHandler = (
    data: IMiddleWareRequestData,
) => IPromiseMayBe<IMiddleWareResponseReturn|ICommonReturn>;

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
export interface IServerSendData extends IMiddleWareResponseReturn {
    response: IResponse,
}


export interface IServerOptions {
    port?: number;
    router?: Router;
}

export interface ISenerOptions extends IServerOptions {
    middlewares?: MiddleWare[];
}

export interface IHttpInfo {
    requestHeaders: http.IncomingHttpHeaders;
    url: string;
    method: IServeMethod;
    query: IJson<string>;
    body: IJson<any>;
}


export type IPromiseMayBe<T> = T|Promise<T>;
