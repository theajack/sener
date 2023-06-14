/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 17:23:29
 * @Description: Coding something
 */
import {
    MiddleWare, IPromiseMayBe, IHookReturn, IJson,
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
    route<T extends IHookReturn = IHookReturn>(
        url: string, data?: Partial<ISenerContext>,
    ): IPromiseMayBe<T>;
}

declare module 'sener-extend' {
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
    init (ctx: ISenerContext) {
        // console.log('router enter', ctx.url);
        const route = this.getRoute(ctx);
        // console.log('router enter', url, method, route?.meta);
        ctx.meta = route?.meta || {};
        // console.log('router enter', ctx.meta);
        let index = 0; // 路由中加入一个自增index，可以用于生成错误码 id等
        ctx.index = () => index++;
        ctx.route = this._createRoute(ctx);
    }

    enter (ctx: ISenerContext): IHookReturn {
        const { url, response404 } = ctx;
        const route = this.getRoute(ctx);
        if (!route) {
            return response404(`Page not found: ${url}`);
        } else {
            return route.handler(ctx);
        }
    }

    private getRoute (ctx: ISenerContext) {
        const { url, method } = ctx;
        const key = this.buildRouteKey(url, method);
        return this.routers[key];
    }

    private _route (url: string, data = {}, res: ISenerContext, map = this.routers) {
        const route = map[this.fillUrl(url)];
        if (!route) {
            return res.response404(`Route Dismiss: ${url}`);
        }
        return route.handler(Object.assign({}, res, data));
    }

    private _createRoute (res: ISenerContext): IRouterHelper['route'] {
        return (url, data) => {
            const map = url.startsWith('#') ? this._privateRouters : this.routers;
            return this._route(url, data, res, map) as any;
        };
    }
}