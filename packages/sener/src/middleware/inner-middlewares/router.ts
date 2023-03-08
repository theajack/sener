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
    IMiddleWareResponseData,
} from 'sener-types';

export type IRouter = IJson<IRouterHandler>;

export type IRouterHandler = (
    data: IMiddleWareResponseData,
) => IPromiseMayBe<IMiddleWareResponseReturn|ICommonReturn>;

interface IRouterHelper {
    index: ()=>number;
    route(
        url: string, data?: Partial<IMiddleWareRequestData>,
    ): IPromiseMayBe<IMiddleWareResponseReturn|ICommonReturn>;
}

declare module 'sener-types-extend' {
    interface ISenerHelper extends IRouterHelper {}
}

const REG = /^(post|get|put|delete):/;

export class Router extends MiddleWare {
    routers: IRouter = {};

    static _routers: IRouter = {};
    static Add (routers: IRouter) {
        Object.assign(this._routers, routers);
    }
    static Create (routers?: IRouter) {
        if (routers) this.Add(routers);
        const router = new Router(this._routers);
        this._routers = {};
        return router;
    }

    constructor (routers: IRouter) {
        super();
        for (const k in routers) {
            const key = this.fillUrl(k);
            this.routers[key] = routers[k];
        }
        // console.log(this.routers);
    }

    private fillUrl (k: string) {
        k = k.trim();
        if (!REG.test(k)) k = `get:${k}`;
        if (!k.endsWith('/')) k = `${k}/`;
        return k;
    }

    private buildRouteKey (url: string, method: string) {
        if (!url.endsWith('/')) url = `${url}/`;
        return `${(method || 'get').toLocaleLowerCase()}:${url}`;
    }

    request ({ url, method, send404 }: IMiddleWareRequestData): IPromiseMayBe<ICommonReturn | Partial<IMiddleWareRequestData>> {
        const key = this.buildRouteKey(url, method);
        // console.log('on request', key);
        if (!!this.routers[key]) {
            return MiddleWareReturn.Continue;
        }
        send404(`Page not found: ${url}`);
        return MiddleWareReturn.Return;
    }
    response (res: IMiddleWareResponseData): IPromiseMayBe<ICommonReturn | IMiddleWareResponseReturn<any>> {
        const key = this.buildRouteKey(res.url, res.method);
        // console.log('on response', key);
        const handler = this.routers[key];
        if (!handler) {
            res.send404(`Page not found: ${res.url}`);
            // res.sendHtml(`<h1>Page not found: ${res.url}<jh1>`);
            return MiddleWareReturn.Return;
        }

        let index = 0; // 路由中加入一个自增index，可以用于生成错误码 id等
        res.index = () => index++;
        res.route = (url, data) => {
            const handler = this.routers[this.fillUrl(url)];
            if (!handler) {
                res.send404(`Route Dismiss: ${url}`);
                return MiddleWareReturn.Return;
            }
            if (data) {
                return handler(Object.assign({}, res, data));
            }
            return handler(res);
        };

        return handler(res);
    }
}