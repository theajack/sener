/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-19 08:11:43
 * @Description: Coding something
 */
import http from 'http';
import { MiddleWareManager } from '../middleware/middleware-manager';
import { parseParam, praseUrl } from 'sener-types';
import {
    IJson,
    IServerSendData, IResponse, IServeMethod, IHttpInfo, IMiddleWareDataBase
} from 'sener-types';
import { ISenerHelper, IServerOptions } from 'sener-types-extend';

export class Server {
    server: http.Server;

    middleware: MiddleWareManager;

    helper: ISenerHelper = {};

    static DEFAULT_PORT = 9000;

    constructor ({
        port,
        router,
    }: IServerOptions) {
        this.middleware = new MiddleWareManager();
        this.initServer(port);

        if (router) {
            this.middleware.use(router);
        }
    }

    private parseHttpInfo (request: http.IncomingMessage) {
        return new Promise<IHttpInfo>((resolve) => {
            const { headers, method } = request;
            const { url, query } = praseUrl(request.url);
            const chunks: any[] = [];
            request.on('error', (err) => {
                console.error(err);
            }).on('data', (chunk) => {
                chunks.push(chunk);
            }).on('end', () => {
                const bodyStr = Buffer.concat(chunks).toString();
                let body: IJson<string>;
                // todo 根据 header 判断
                try {
                    body = JSON.parse(bodyStr);
                } catch (e) {
                    body = parseParam(bodyStr);
                }
                resolve({
                    requestHeaders: headers,
                    method: method as IServeMethod,
                    url,
                    query,
                    body,
                });
            });
        });
    }

    private initServer (port = Server.DEFAULT_PORT) {
        console.log('initServer', `http://localhost:${port}`);
        this.server = http.createServer(async (request, response) => {

            const middlewareBase: IMiddleWareDataBase = {
                request,
                response,
                ...this.helper,
            };

            if (!await this.middleware.applyEnter(middlewareBase)) {
                console.log('enter fail');
                return this.send404(response);
            }

            const httpInfo = await this.parseHttpInfo(request);

            const requestData = await this.middleware.applyRequest({
                ...httpInfo,
                ...middlewareBase,
            });

            if (!requestData) {
                // todo 待详细
                console.log('request fail');
                return this.send404(response);
            };

            const responseData = await this.middleware.applyResponse({
                data: {},
                statusCode: 200,
                // todo headers
                ...middlewareBase,
                ...httpInfo,
            });

            if (!responseData) {
                // todo 待详细
                console.log('response fail');
                return this.send404(response);
            }

            this.sendData({
                response,
                ...responseData,
            });
        }).listen(port);
    }
    // private initServer (port = 3000) {
    //     console.log('initServer', `http://localhost:${port}`);
    //     this.server = http.createServer((request, response) => {
    //         const handler = this.getRouterHandler(request); ;
    //         if (!handler) {
    //             this.send404(response);
    //             return;
    //         }

    //         // 不使用 async语法可以减少 7kb 的bundle体积

    //         this.parseHttpInfo(request).then(info => {
    //             const httpInfo: IMiddleWareRequestData = {
    //                 ...info,
    //                 ...this.helper,
    //                 request,
    //                 response,
    //             };
    //             const data = handler(httpInfo);
    //             if (data instanceof Promise) {
    //                 data.then(data => {
    //                     this.sendData({
    //                         response,
    //                         ...data,
    //                     });
    //                 });
    //             } else {
    //                 this.sendData({
    //                     response,
    //                     ...data,
    //                 });
    //             }
    //         });

    //     }).listen(port);
    // }

    private send404 (response: IResponse) {
        this.sendText(response, 'Page not found', 404);
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
        data,
        statusCode = 200,
        headers = { 'Content-Type': 'application/json;charset=UTF-8' },
    }: IServerSendData) {
        // console.log(headers);

        for (const k in headers) {
            response.setHeader(k, headers[k]);
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