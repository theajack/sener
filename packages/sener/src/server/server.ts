/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-19 08:11:43
 * @Description: Coding something
 */
import http, { IncomingMessage } from 'http';
import { MiddleWareManager } from '../middleware/middleware-manager';
import { IHelperFunc, IMiddleWare, IMiddleWareRequestData, parseParam, praseUrl } from 'sener-types';
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

    constructor ({
        port,
    }: IServerOptions) {
        if (port) this.port = port;
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

        return {
            requestHeaders: headers,
            method: method as IServeMethod,
            url,
            query,
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
                    // todo ?????? header ??????
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

            const middlewareBase: IMiddleWareDataBase = {
                request,
                response,
                ...this.helper,
                ...sendHelper,
            };

            if (!await this.middleware.applyEnter(middlewareBase)) return;

            // ! options????????????200 ?????????nginx????????????????????????????????????
            // ! ?????? cors ?????????????????????????????????
            if (request.method === 'OPTIONS') return sendHelper.sendResponse({ statusCode: 200 });

            const httpInfo = await this.parseHttpInfo(request);
            // console.log('parseHttpInfo', httpInfo);
            const requestData = await this.middleware.applyRequest({
                ...httpInfo,
                ...middlewareBase,
            } as IMiddleWareRequestData); // todo fix
            // console.log('requestData', requestData);

            if (!requestData) return;

            const responseData = await this.middleware.applyResponse({
                data: {},
                statusCode: 200,
                ...requestData,
            });

            if (!responseData) return;

            this.sendData({
                response,
                ...responseData,
            });
        }).listen(this.port);
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
        for (const k in headers) {
            response.setHeader(k, headers[k]);
        }
        // todo ??????????????????
        if (typeof data !== 'string') {
            try {
                data = JSON.stringify(data);
            } catch (e) {
                response.statusCode = 200;
                response.write(JSON.stringify({
                    error: e.message,
                    success: false,
                })); // todo ????????????????????????
                response.end();
                return;
            }
        }
        response.statusCode = statusCode;
        response.write(data);
        response.end();
    }
}