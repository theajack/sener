/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 17:23:29
 * @Description: Coding something
 */
import {
    IMiddleWareResponseReturn, MiddleWare,
    IPromiseMayBe, ICommonReturn, IJson,
    IMiddleWareRequestData, IMiddleWareResponseData,
    MiddleWareReturn
} from 'sener-types';

export type IRouter = IJson<IRouterHandler>;

export type IRouterHandler = (
    data: IMiddleWareRequestData,
) => IPromiseMayBe<IMiddleWareResponseReturn|ICommonReturn>;

export class Router extends MiddleWare {
    routers: IJson<IRouterHandler>;

    constructor (routers: IJson<IRouterHandler>) {
        super();
        this.routers = routers;
    }

    // enter ({ request, send404 }: Parameters<MiddleWare['enter']>[0]): ReturnType<MiddleWare['enter']> {
    //     if (!this.isUrlExist(request)) {
    //         send404(`Page not found: ${request.url}`);
    //         return MiddleWareReturn.Return;
    //     }
    // }

    request ({ url, method, send404 }: IMiddleWareRequestData): IPromiseMayBe<IMiddleWareRequestData | ICommonReturn> {
        const lowMethod = (method || 'get').toLocaleLowerCase();
        const name = `${lowMethod}:${url}`;
        if (!!this.routers[name] || (method === 'GET' && !!this.routers[url])) {
            return MiddleWareReturn.Continue;
        }
        // sendHtml(`<h1>Page not found: ${url}<jh1>`);
        send404(`Page not found: ${url}`);
        return MiddleWareReturn.Return;
    }

    response (res: Parameters<MiddleWare['response']>[0]): ReturnType<MiddleWare['response']> {
        const handler = this.getRouterHandler(res);
        if (!handler) {
            res.send404(`Page not found: ${res.url}`);
            // res.sendHtml(`<h1>Page not found: ${res.url}<jh1>`);
            return MiddleWareReturn.Return;
        }

        return handler(res);
    }

    private getRouterHandler ({ method, url }: IMiddleWareResponseData) {
        const name = `${method.toLocaleLowerCase()}:${url}`;
        let handler = this.routers[name];
        if (!handler && method === 'GET') {
            handler = this.routers[url];
        }
        if (!handler) return;
        return handler || null;
    }

    // private isUrlExist (request: IncomingMessage) {
    //     const { url } = parseUrlSearch(request.url);
    //     const method = (request.method || 'get').toLocaleLowerCase();

    //     const name = `${method}:${url}`;

    //     return (
    //         !!this.routers[name] ||
    //         (method === 'get' && !!this.routers[url])
    //     );
    // }
}
