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
    IMiddleWareEnterData,
} from 'sener-types';
import { Cookie } from '../../server/cookie';

export type IRouter = IJson<IRouterHandler|IRouterHandlerData>;

export type IRouterHandler = (
    data: IMiddleWareResponseData,
) => IPromiseMayBe<IMiddleWareResponseReturn|ICommonReturn>;

export interface IRouterHandlerData {
    exe: IRouterHandler;
    meta: IJson;
}

interface IRouterHelper {
    meta: IJson;
    index: ()=>number;
    route(
        url: string, data?: Partial<IMiddleWareRequestData>,
    ): IPromiseMayBe<IMiddleWareResponseReturn|ICommonReturn>;
    cookie: Cookie;
}

declare module 'sener-types-extend' {
    interface ISenerHelper extends IRouterHelper {}
}

const REG = /^(post|get|put|delete):/;

export class Router extends MiddleWare {
    routers: IJson<IRouterHandlerData> = {};

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
            const value = routers[k];
            if (typeof value === 'function') {
                const { meta, url } = this.extractMeta(k);
                const key = this.fillUrl(url);
                this.routers[key] = {
                    exe: value,
                    meta: meta
                };
            } else {
                const key = this.fillUrl(k);
                this.routers[key] = value;
            }
        }
        // console.log(this.routers);
    }

    private extractMeta (url: string) {
        if (!url.startsWith('[')) return { meta: {}, url };
        const arr = url.matchAll(/(?<=[\[\&])(.*?)(=(.*?))?(?=[\&\]])/g);

        const meta: IJson = {};

        for (const item of arr) {
            const key = item[1];
            let value: any = item[2];
            if (typeof value === 'undefined') {
                value = true;
            }
            meta[key] = value;
        }
        return {
            meta,
            url: url.replace(/^\[.*?\]/, '')
        };
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

    enter (res: IMiddleWareEnterData): IPromiseMayBe<ICommonReturn> {
        const { url, method } = res;
        // console.log('enterenterenter', res,url, method)
        const key = this.buildRouteKey(url, method);
        const route = this.routers[key];
        res.meta = route?.meta || {};
        let index = 0; // 路由中加入一个自增index，可以用于生成错误码 id等
        res.index = () => index++;
        res.route = (url, data) => this._route(url, data, res);
    }

    private _route (url: string, data = {}, res: any) {
        const route = this.routers[this.fillUrl(url)];
        if (!route) {
            res.send404(`Route Dismiss: ${url}`);
            return MiddleWareReturn.Return;
        }
        return route.exe(Object.assign({}, res, data));
    }

    request (req: IMiddleWareRequestData): IPromiseMayBe<ICommonReturn | Partial<IMiddleWareRequestData>> {
        const { url, method, send404 } = req;
        const key = this.buildRouteKey(url, method);
        // console.log('on request', key);
        const route = this.routers[key];
        if (!!route) {
            return MiddleWareReturn.Continue;
        }
        send404(`Page not found: ${url}`);
        return MiddleWareReturn.Return;
    }
    response (res: IMiddleWareResponseData): IPromiseMayBe<ICommonReturn | IMiddleWareResponseReturn<any>> {
        const key = this.buildRouteKey(res.url, res.method);
        // console.log('on response', key);
        const route = this.routers[key];
        if (!route) {
            res.send404(`Page not found: ${res.url}`);
            // res.sendHtml(`<h1>Page not found: ${res.url}<jh1>`);
            return MiddleWareReturn.Return;
        }
        res.route = (url, data) => this._route(url, data, res);
        return route.exe(res);
    }
}