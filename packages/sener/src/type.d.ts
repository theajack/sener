/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-19 01:28:49
 * @Description: Coding something
 */
import http from 'http';
import { MiddleWare } from './middleware/middleware';
import { Router } from './server/router';

export interface IJson<T=any> {
    [prop: string]: T;
}

export type IRouterHandler = (
    data: IMiddleWareRequestData,
) => Promise<IMiddleWareResponseData> | IMiddleWareResponseData;

export type IMiddleWareEnterData = http.IncomingMessage;

export interface IMiddleWareResponseData {
    data: any,
    statusCode?: number,
    headers?: IJson<string>
}

export interface IServerSendData extends IMiddleWareResponseData {
    response: IResponse,
}


export type IMethod = 'get'|'post'|'delete'|'put';

export type IServeMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export type IRouter = IJson<IRouterHandler>;

export interface IServerOptions {
    port?: number;
    router?: Router;
}

export interface ISenerOptions extends IServerOptions {
    middlewares?: MiddleWare[];
}

// @ts-ignore
export type IResponse = http.ServerResponse<http.IncomingMessage> & {
    req: http.IncomingMessage;
}

export interface IMiddleWareRequestData {
    headers: http.IncomingHttpHeaders;
    url: string;
    method: IServeMethod;
    query: IJson<string>;
    body: IJson<any>;
    request: http.IncomingMessage;
    response: IResponse;
    [prop: string]: any;
}

export type IHttpInfo = Pick<IMiddleWareRequestData, 'headers'|'method'|'query'|'body'|'url'>

export type IPromiseMayBe<T> = T|Promise<T>;