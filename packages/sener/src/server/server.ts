/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-19 08:11:43
 * @Description: Coding something
 */
import http, { IncomingMessage } from 'http';
import { MiddleWareManager } from '../middleware/middleware-manager';
import { IHelperFunc, IMiddleWare, IMiddleWareRequestData, IMiddleWareResponseReturn, IOnError, parseParam, praseUrl } from 'sener-types';
import {
    IJson, IServerOptions,
    IServerSendData, IResponse, IServeMethod, IHttpInfo, IMiddleWareDataBase
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

    private async onError (error: any, from: string, response: IResponse): Promise<any> {
        // console.log(error);
        const data = (this.onerror) ?
            await this.onerror({ error, from }) :
            { data: { code: -1, msg: `服务器内部错误:${error.toString()}`, error } };

        this.sendData({ response, ...data });
    }

    private initServer () {
        console.log(`Sener Runing Succeed On: http://localhost:${this.port}`);
        this.server = http.createServer(async (request, response) => {
            const sendHelper: IHelperFunc = {
                send404: (msg) => {this.send404(response, msg);},
                sendJson: (data, statusCode) => {this.sendData({ response, data, statusCode });},
                sendResponse: (data) => {this.sendData({ response, ...data });},
                sendText: (msg, code) => {this.sendText(response, msg, code);},
                sendHtml: (html) => {this.sendHtml(response, html);},
            };
            const httpInfo = await this.parseHttpInfo(request);

            const middlewareBase: IMiddleWareDataBase = {
                request,
                response,
                headers: {},
                env: {},
                ...this.helper,
                ...sendHelper,
                ...httpInfo,
            };

            try {
                if (!await this.middleware.applyEnter(middlewareBase)) return;
            } catch (err) {
                return this.onError(err, 'enter', response);
            }

            // ! options请求返回200 当使用nginx配置跨域时此处需要有返回
            // ! 使用 cors 中间件时不会执行到这里
            if (request.method === 'OPTIONS') return sendHelper.sendResponse({ statusCode: 200 });

            // console.log('parseHttpInfo', httpInfo);
            let requestData: IMiddleWareRequestData|null;
            try {
                requestData = await this.middleware.applyRequest({
                    ...httpInfo,
                    ...middlewareBase,
                } as IMiddleWareRequestData); // todo fix
            // console.log('requestData', requestData);
            } catch (err) {
                return this.onError(err, 'request', response);
            }

            if (!requestData) return;

            let responseData: IMiddleWareResponseReturn|null;
            try {
                responseData = await this.middleware.applyResponse({
                    data: {},
                    statusCode: 200,
                    ...requestData,
                });
            } catch (err) {
                return this.onError(err, 'request', response);
            }

            if (!responseData) return;

            this.sendData({
                response,
                ...responseData,
            });
        }).listen(this.port, '0.0.0.0');
    }

    private sendHtml (response: IResponse, html: string) {
        this.sendData({
            response,
            data: html,
            statusCode: 200,
            headers: { 'Content-Type': 'text/html; charset=utf-8' }
        });
    }

    private send404 (response: IResponse, message = 'Page not found') {
        this.sendText(response, message, 404);
    }

    private sendText (response: IResponse, str: string, statusCode = 200) {
        this.sendData({
            response,
            data: str,
            statusCode,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
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
        // console.log(headers);
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