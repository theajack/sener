/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-19 08:11:43
 * @Description: Coding something
 */
import http, { IncomingMessage, ServerResponse } from 'http';
import { MiddleWareManager } from '../middleware/middleware-manager';
import { IHelperFunc, IMiddleWare, IMiddleWareRequestData, IMiddleWareResponseReturn, IOnError, parseParam, praseUrl } from 'sener-types';
import {
    IJson, IServerOptions,
    IServerSendData, IResponse, IServeMethod, IHttpInfo,
} from 'sener-types';
import { ISenerHelper } from 'sener-types-extend';

export class Server {
    server: http.Server;

    middleware: MiddleWareManager;

    // @ts-ignore
    helper: ISenerHelper = {};

    port = 9000;

    onerror?: IOnError;

    constructor ({
        port,
        onerror,
    }: IServerOptions) {
        if (port) this.port = port;
        this.onerror = onerror;
        this.middleware = new MiddleWareManager();
        this.initServer();
    }

    injectMiddleWare (middleware: IMiddleWare) {
        if (middleware.helper)
            this.helper = Object.assign(this.helper, middleware.helper());
    }

    private async parseHttpInfo (request: http.IncomingMessage): Promise<IHttpInfo> {
        const { headers, method } = request;
        const { url, query } = praseUrl(request.url);
        const ip = request.headers['x-forwarded-for'] || // 判断是否有反向代理 IP
            request.connection.remoteAddress || // 判断 connection 的远程 IP
            request.socket.remoteAddress || // 判断后端的 socket 的 IP
            // @ts-ignore
            request.connection?.socket?.remoteAddress;
        return {
            requestHeaders: headers,
            method: method as IServeMethod,
            url,
            query,
            ip,
            ...(await this.parseBody(request))
        };
    }

    private parseBody (request: IncomingMessage) {
        return new Promise<{body: IJson, buffer: Buffer|null}>((resolve) => {
            const chunks: any[] = [];
            const contentType = request.headers['content-type'] || '';
            // console.log('contentType', contentType);
            if (contentType.includes('multipart/form-data')) {
                resolve({ body: {}, buffer: null });
                return;
            }
            request.on('error', (err) => {
                console.error(err);
            }).on('data', (chunk) => {
                chunks.push(chunk);
            }).on('end', () => {
                const buffer = Buffer.concat(chunks);
                let body: IJson<string> = {};

                if (request.headers['content-type']?.includes('application/json')) {
                    const bodyStr = buffer.toString();
                    // todo 根据 header 判断
                    try {
                        body = JSON.parse(bodyStr);
                    } catch (e) {
                        body = parseParam(bodyStr);
                    }
                }
                resolve({
                    body,
                    buffer,
                });
            });
        });
    }

    private async onError (error: any, from: string, response: IResponse, headers = {}): Promise<any> {
        // console.log(error);
        const data = (this.onerror) ?
            await this.onerror({ error, from }) :
            { data: { code: -1, msg: `服务器内部错误(${error.toString()})[from=${from}]`, error } };

        this.sendData({ response, ...data, headers });
    }

    private _createSendHelper (response: ServerResponse, headers: IJson<string>): IHelperFunc {

        const mergeHeaders = (header: IJson<string> = {}) => Object.assign({}, headers, header);

        const sendHelper: IHelperFunc = {
            send404: (msg, header = {}) => {this.send404(response, msg, mergeHeaders(header));},
            sendJson: (data, statusCode = 200, header = {}) => {this.sendData({ response, data, statusCode, headers: mergeHeaders(header) });},
            sendText: (msg, statusCode, header = {}) => {this.sendText(response, msg, mergeHeaders(header), statusCode);},
            sendHtml: (html, header = {}) => {this.sendHtml(response, html, mergeHeaders(header));},
            sendResponse: (data) => {this.sendData({ response, ...data, headers: mergeHeaders(data.headers) });},
        };

        return sendHelper;
    }

    private initServer () {
        console.log(`Sener Runing Succeed On: http://localhost:${this.port}`);
        this.server = http.createServer(async (request, response) => {

            const httpInfo = await this.parseHttpInfo(request);

            const headers: IJson<string> = {};
            const env: IJson<string> = {};

            const sendHelper = this._createSendHelper(response, headers);

            let requestData: IMiddleWareRequestData|null = {
                request,
                response,
                headers,
                env,
                ...this.helper,
                ...sendHelper,
                ...httpInfo,
            };
            let responseData: IMiddleWareResponseReturn|null = {
                data: {},
                statusCode: 200,
                ...requestData,
            };

            const onLeave = async () => {
                await this.middleware.applyLeave(responseData || {} as any); // todo
            };

            const onError = async (err: any, from: string) => {
                await onLeave();
                return await this.onError(err, from, response, headers);
            };

            try {
                await this.middleware.applyEnter(requestData);
            } catch (err) {
                return onError(err, 'enter');
            }

            // ! options请求返回200 当使用nginx配置跨域时此处需要有返回
            // ! 使用 cors 中间件时不会执行到这里
            if (request.method === 'OPTIONS') {
                await onLeave();
                return sendHelper.sendResponse({ statusCode: 200 });
            }

            // console.log('parseHttpInfo', httpInfo);
            try {
                requestData = await this.middleware.applyRequest(requestData); // todo fix
            // console.log('requestData', requestData);
            } catch (err) {
                return await onError(err, 'request');
            }

            if (!requestData) return await onLeave();

            try {
                responseData = await this.middleware.applyResponse({
                    data: {},
                    statusCode: 200,
                    ...requestData,
                });
            } catch (err) {
                return await onError(err, 'response');
            }
            // console.log('requestData', responseData?.headers);

            if (!responseData) return await onLeave();

            this.sendData({
                response,
                ...responseData,
            });
            await onLeave();
        }).listen(this.port, '0.0.0.0');
    }

    private sendHtml (response: IResponse, html: string, headers?: IJson<string>) {
        this.sendData({
            response,
            data: html,
            statusCode: 200,
            headers: Object.assign(
                { 'Content-Type': 'text/html; charset=utf-8' },
                headers,
            )
        });
    }

    private send404 (response: IResponse, message = 'Page not found', headers?: IJson<string>) {
        this.sendText(response, message, headers, 404);
    }

    private sendText (response: IResponse, str: string, headers: IJson<string> = {}, statusCode = 200) {
        this.sendData({
            response,
            data: str,
            statusCode,
            headers: Object.assign(
                { 'Content-Type': 'text/plain; charset=utf-8' },
                headers,
            )
            // text/html; charset=utf-8
            // application/x-www-form-urlencoded
            // multipart/form-data
        });
    }
    private sendData ({
        response,
        data = '',
        statusCode = 200,
        headers = { 'Content-Type': 'application/json;charset=UTF-8' },
    }: Partial<IServerSendData> & Pick<IServerSendData, 'response'>) {
        // console.log('sendData', data, headers);
        try {
            if (!headers['Content-Type']) {
                headers['Content-Type'] = 'application/json;charset=UTF-8';
            }
            for (const k in headers) {
                response.setHeader(k, headers[k]);
            }
        } catch (e) {
            console.error('router中如果已经对请求做了返回处理，请return false', e);
            return;
        }
        // todo 数据类型判断
        if (typeof data !== 'string') {
            try {
                data = JSON.stringify(data);
            } catch (e) {
                response.statusCode = 200;
                response.write(JSON.stringify({
                    error: e.message,
                    success: false,
                })); // todo 统一处理错误逻辑
                response.end();
                return;
            }
        }
        response.statusCode = statusCode;
        response.write(data);
        response.end();
    }
}