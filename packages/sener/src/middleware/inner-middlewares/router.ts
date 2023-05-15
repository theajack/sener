/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 17:23:29
 * @Description: Coding something
 */
import {
    ISenerResponse, MiddleWare,
    IPromiseMayBe, IHookReturn, IJson,
    MiddleWareReturn,
    ISenerContext,
} from 'sener-types';

export type IRouter = IJson<IRouterHandler|IRouterHandlerData>;

export type IRouterHandler = (
    data: ISenerContext,
) => IPromiseMayBe<IHookReturn>;

export interface IRouterHandlerData {
    handler: IRouterHandler;
    meta: IJson;
}

interface IRouterHelper {
    meta: IJson;
    index: ()=>number;
    route(
        url: string, data?: Partial<ISenerContext>,
    ): IPromiseMayBe<IHookReturn>;
}

declare module 'sener' {
    interface ISenerHelper extends IRouterHelper {}
}

const REG = /^(post:|get:|put:|delete:|#)/;

export class Router extends MiddleWare {
    routers: IJson<IRouterHandlerData> = {};

    private _privateRouters: IJson<IRouterHandlerData> = {};

    constructor (...routers: IRouter[]) {
        super();
        for (const route of routers) {
            for (const k in route) {
                const value = route[k];
                if (typeof value === 'function') {
                    const { meta, url } = this.extractMeta(k);
                    const key = this.fillUrl(url);
                    this._getMap(key)[key] = {
                        handler: value,
                        meta: meta
                    };
                } else {
                    const key = this.fillUrl(k);
                    this._getMap(key)[key] = value;
                }
            }
        }
        // console.log(this.routers, this._privateRouters);
    }

    private _getMap (key: string) {
        return (key.startsWith('#') ? this._privateRouters : this.routers);
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

    enter (res: ISenerContext): IPromiseMayBe<IHookReturn> {
        // console.log('router enter', res.url);
        const { url, method } = res;
        const key = this.buildRouteKey(url, method);
        const route = this.routers[key];
        // console.log('router enter', url, method, route?.meta);
        res.meta = route?.meta || {};
        // console.log('router enter', res.meta);
        let index = 0; // 路由中加入一个自增index，可以用于生成错误码 id等
        res.index = () => index++;
        res.route = this._createRoute(res);
    }

    private _route (url: string, data = {}, res: any, map = this.routers) {
        const route = map[this.fillUrl(url)];
        if (!route) {
            res.send404(`Route Dismiss: ${url}`);
            return MiddleWareReturn.Return;
        }
        return route.handler(Object.assign({}, res, data));
    }
    request (req: ISenerContext): IPromiseMayBe<IHookReturn | Partial<ISenerContext>> {
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
    response (res: ISenerContext): IPromiseMayBe<IHookReturn | ISenerResponse<any>> {
        // console.log('router response', res.url);
        const key = this.buildRouteKey(res.url, res.method);
        // console.log('on response', key);
        const route = this.routers[key];
        if (!route) {
            res.send404(`Page not found: ${res.url}`);
            // res.sendHtml(`<h1>Page not found: ${res.url}<jh1>`);
            return MiddleWareReturn.Return;
        }
        res.route = this._createRoute(res);
        return route.handler(res);
    }

    // leave (res: ISenerContext): IPromiseMayBe<IHookReturn | ISenerResponse<any>> {
    //     console.log('router leave', res.url);
    // }

    private _createRoute (res: any): IRouterHelper['route'] {
        return (url, data) => {
            const map = url.startsWith('#') ? this._privateRouters : this.routers;
            return this._route(url, data, res, map);
        };
    }
}