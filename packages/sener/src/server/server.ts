/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-19 08:11:43
 * @Description: Coding something
 */
import http from 'http';
import { MiddleWareManager } from '../middleware/middleware-manager';
import { IMiddleWare, ISenerContext, IOnError, ISenerResponse, IMiddleHookNames, MiddleWare } from 'sener-types';
import {
    IJson, IServerOptions, IErrorFrom, IResponse
} from 'sener-types';
import { ISenerHelper } from 'sener';
import { createSenerHelper, parseHttpInfo } from './sener-helper';

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

    injectMiddleWare (middleware: IMiddleWare|MiddleWare) {
        if (middleware.helper)
            this.helper = Object.assign(this.helper, middleware.helper());
    }

    private async onError (error: any, from: IErrorFrom, context: ISenerContext): Promise<any> {
        // console.error('onError', error.message);
        const data = (this.onerror) ?
            await this.onerror({ error, from, context }) :
            { data: { code: -1, msg: `服务器内部错误(${error.toString()})[from=${from}]`, error } };
        const { headers } = context;
        return context.responseData({ ...data, headers });
    }

    private initServer () {
        console.log(`Sener Runing Succeed On: http://localhost:${this.port}`);
        this.server = http.createServer(async (request, response) => {

            const httpInfo = await parseHttpInfo(request);

            const headers: IJson<string> = {};
            const env: IJson<string> = {};

            const context: ISenerContext = {
                request,
                response,
                headers,
                env,
                data: {},
                statusCode: -1,
                success: true,
                responded: false,
                returned: false,
                isOptions: false,
                ...httpInfo,
                ...this.helper,
            } as any; // ! build 报错

            const assignContext = (ctx: Partial<ISenerContext>|any) => {
                if (ctx && typeof ctx === 'object')
                    Object.assign(context, ctx);
            };

            assignContext(createSenerHelper(headers, (key: 'responded'|'returned' = 'responded') => {
                context[key] = true;
            }));

            // ! options请求返回200 当使用nginx配置跨域时此处需要有返回
            // ! 使用 cors 中间件时不会执行到这里
            if (request.method === 'OPTIONS') {
                context.isOptions = true;
                assignContext(context.responseData({ statusCode: 200 }));
            }

            const applyHook = async (name: IMiddleHookNames) => {
                try {
                    await this.middleware[name](context);
                } catch (err) {
                    assignContext(await this.onError(err, name, context));
                }
            };
            await applyHook('init');

            await applyHook('enter');

            if (!context.returned) {
                const { data, statusCode, headers: HEADERS } = context;
                this.sendData(response, {
                    data,
                    statusCode,
                    headers: HEADERS
                });
            }

            await applyHook('leave');
        }).listen(this.port, '0.0.0.0');
    }


    private sendData (response: IResponse, {
        data = '',
        statusCode = 200,
        headers = {},
    }: ISenerResponse): void {
        // console.log('sendData', data, headers);
        if (statusCode === -1) statusCode = 200;
        if (!headers['Content-Type']) headers['Content-Type'] = 'application/json;charset=UTF-8';
        try {
            for (const k in headers) {
                response.setHeader(k, headers[k]);
            }
        } catch (e) {
            console.error('router中如果已经对请求做了返回处理，请返回 {responded: true};', e);
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
        // console.log('writedata', data);
        response.write(data);
        response.end();
    }
}