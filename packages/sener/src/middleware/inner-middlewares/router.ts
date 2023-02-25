/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 17:23:29
 * @Description: Coding something
 */
import {
    IMiddleWareResponseReturn, MiddleWare,
    IPromiseMayBe, ICommonReturn, IJson,
    IMiddleWareRequestData,
    MiddleWareReturn,
} from 'sener-types';

export type IRouter = IJson<IRouterHandler>;

export type IRouterHandler = (
    data: IMiddleWareRequestData,
) => IPromiseMayBe<IMiddleWareResponseReturn|ICommonReturn>;

export class Router extends MiddleWare {
    routers: IJson<IRouterHandler> = {};

    constructor (routers: IJson<IRouterHandler>) {
        super();
        const REG = /^(post|get|put|delete):/;
        for (let k in routers) {
            const origin = k;
            k = k.trim();
            if (!REG.test(k)) k = `get:${k}`;
            if (!k.endsWith('/')) k = `${k}/`;
            this.routers[k] = routers[origin];
        }
        // console.log(this.routers);
    }

    // enter ({ request, send404 }: Parameters<MiddleWare['enter']>[0]): ReturnType<MiddleWare['enter']> {
    //     if (!this.isUrlExist(request)) {
    //         send404(`Page not found: ${request.url}`);
    //         return MiddleWareReturn.Return;
    //     }
    // }

    private buildRouteKey (url: string, method: string) {
        if (!url.endsWith('/')) url = `${url}/`;
        return `${(method || 'get').toLocaleLowerCase()}:${url}`;
    }

    request ({ url, method, send404 }: IMiddleWareRequestData): IPromiseMayBe<IMiddleWareRequestData | ICommonReturn> {
        const key = this.buildRouteKey(url, method);
        // console.log('on request', key);
        if (!!this.routers[key]) {
            return MiddleWareReturn.Continue;
        }
        send404(`Page not found: ${url}`);
        return MiddleWareReturn.Return;
    }

    response (res: Parameters<MiddleWare['response']>[0]): ReturnType<MiddleWare['response']> {
        const key = this.buildRouteKey(res.url, res.method);
        // console.log('on response', key);
        const handler = this.routers[key];
        if (!handler) {
            res.send404(`Page not found: ${res.url}`);
            // res.sendHtml(`<h1>Page not found: ${res.url}<jh1>`);
            return MiddleWareReturn.Return;
        }

        return handler(res);
    }
}
