/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 17:23:29
 * @Description: Coding something
 */
import {
    MiddleWare, IPromiseMayBe, IHookReturn, IJson,
    ISenerContext,
    IServeMethod,
    concatQuery,
} from 'sener-types';

export type IRouter = IJson<IRouterHandler|IRouterHandlerData>;

export type IRouterHandler = (
    data: ISenerContext,
) => IPromiseMayBe<IHookReturn>;

export interface IRouterHandlerData {
    handler: IRouterHandler;
    meta?: IJson;
    alias?: [string];
    reg?: RegExp;
    paramMap?: IJson<string>;
}

interface IRouterHelper {
    meta: IJson; // 路由元信息 todo 类型
    index: ()=>number;
    route<T extends IHookReturn = IHookReturn>(
        url: string, data?: Partial<ISenerContext>,
    ): IPromiseMayBe<T>;
    params: IJson; // 路由参数 todo 类型
    redirect: (url: string, query?: IJson, header?: IJson) => void,
}

declare module 'sener-extend' {
    interface ISenerHelper extends IRouterHelper {}
}

const REG = /^(post:|get:|put:|delete:|#)/;

function parseFuzzyRouteUrl (url: string): Pick<IRouterHandlerData, 'reg'|'paramMap'> {

    const arr = url.split('/');
    const paramMap: IJson<string> = {};
    for (let i = 0; i < arr.length; i++) {
        const item = arr[i];
        if (item[0] !== ':') continue;
        const res = item.match(/^:(.*?)(\((.*?)\))?$/i);
        // console.log('res1=', res)
        if (!res) throw new Error(`错误的路由表达式: ${url}`);
        const name = res[1];
        const reg = res[3] || '(.*?)';
        paramMap[i] = name;
        arr[i] = reg;
    }
    return {
        reg: new RegExp(arr.join('/')),
        paramMap,
    };
}
export function createRoute(base: string, route: IRouter): IRouter;
export function createRoute(route: IRouter): IRouter;
export function createRoute (arg1: string|IRouter, arg2?: IRouter): IRouter {

    if (!arg2) return arg1 as IRouter;

    const route = arg2 as IRouter;
    const base = arg1 as string;

    const keys = Object.keys(route);

    const transformKey = (key: string) => {
        return key.replace(REG, (head) => {
            // console.log('router=',head);
            return `${head}${base}`;
        });
    };
    const REG = /^(\[.*?\])?(post:|get:|put:|delete:|#)?/;
    for (const key of keys) {
        const newKey = transformKey(key);
        const v = route[key];
        // console.log('new key = ', newKey)
        // ! 针对 router 别名做的处理
        route[newKey] = v;
        if (typeof v === 'object' && v.alias) {
            for (const name in v.alias) {
                route[transformKey(name)]  = v;
            }
            delete v.alias;
        }
        delete route[key];
    }
    return route;
}

export class Router extends MiddleWare {
    routers: IJson<IRouterHandlerData> = {};

    fuzzyRouters: IJson<IRouterHandlerData> = {};

    private _privateRouters: IJson<IRouterHandlerData> = {};

    constructor (...routers: IRouter[]) {
        super();
        for (const route of routers) {
            for (const k in route) {
                const value = route[k];

                let router: IRouterHandlerData, key: string;

                if (typeof value === 'function') {
                    const { meta, url } = this.extractMeta(k);
                    key = this.fillUrl(url);
                    router = {
                        handler: value,
                        meta: meta
                    };
                } else {
                    if (value.alias) {
                        for (const name of value.alias) {
                            this.addToRouter(this.fillUrl(name), value);
                        }
                        delete value.alias;
                    }
                    key = this.fillUrl(k);
                    router = value;
                }
                this.addToRouter(key, router);
            }
        }
        // console.log('routes=', this.routers)
        // console.log('fuzzyRouters =',this.fuzzyRouters);
        // console.log(this.routers, this._privateRouters);
        // console.log('fuzzyRouters =',this.fuzzyRouters);

    }

    private addToRouter (key: string, router: IRouterHandlerData) {

        // 模糊匹配的
        if (key.includes('/:')) {
            Object.assign(router, parseFuzzyRouteUrl(key));
            this.fuzzyRouters[key] = router;
        } else {
            this._getMap(key)[key] = router;
        }
    }

    private _getMap (key: string) {
        return (key[0] === '#' ? this._privateRouters : this.routers);
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
    init (ctx: ISenerContext) {
        // console.log('router enter', ctx.url);
        const route = this.getRoute(ctx);
        // console.log('router enter', url, method, route?.meta);
        ctx.meta = route?.meta || {};
        // console.log('router enter', ctx.meta);
        let index = 0; // 路由中加入一个自增index，可以用于生成错误码 id等
        ctx.index = () => index++;
        ctx.route = this._createRoute(ctx);

        ctx.params = route?.reg ? this._extractFuzzyParam(ctx.url, route as any) : {};
        // console.log('ctx.url=',ctx.url)

        ctx.redirect = (url: string, query: IJson = {}, headers: IJson = {}) => {
            ctx.response.writeHead(302, {
                ...headers,
                'Location': `${url}${concatQuery(query)}`,
                'Cache-Control': 'no-cache, no-store', // ! 禁止缓存
            });
            ctx.response.end();
        };
    }

    private _extractFuzzyParam (url: string, route: Required<IRouterHandlerData>): IJson {
        const arr = url.split('/');

        const map = route.paramMap;

        const param: IJson = {};
        for (const i in map) {
            const name = map[i];
            const v = arr[i as any];
            // : 字符串
            // :# 数字
            // :! 布尔
            if (name[0] === '#') {
                param[name.substring(1)] = parseFloat(v);
            } else if (name[0] === '!') {
                param[name.substring(1)] = v === 'true' || v === '1';
            } else {
                param[name] = v;
            }
        }
        return param;
    }

    enter (ctx: ISenerContext): IHookReturn {
        const route = this.getRoute(ctx);
        if (!route) {
            return this.routeTo404(ctx);
        } else {
            return route.handler!(ctx);
        }
    }

    private routeTo404 (ctx: ISenerContext) {
        if (this.getRouteByUrl('/404')) {
            return ctx.route('/404');
        }
        return ctx.response404(`Page not found: ${ctx.url}`);
    }

    private getRoute (ctx: ISenerContext) {
        const { url, method } = ctx;
        return this.getRouteByUrl(url, method);
    }
    private getRouteByUrl (url: string, method: IServeMethod = 'GET') {
        const key = this.buildRouteKey(url, method);
        return this.findRouteByKey(key);
    }
    private findRouteByKey (key: string): IRouterHandlerData|null {
        // console.log('-----', key)
        const res = this.routers[key]; // 如果在普通router内
        if (res) return res;
        // 模糊匹配
        for (const k in this.fuzzyRouters) {
            const router = this.fuzzyRouters[k];
            if (router.reg?.test(key)) {
                return router;
            }
        }
        return null;
    }
    private buildRouteKey (url: string, method: IServeMethod) {
        if (!url.endsWith('/')) url = `${url}/`;
        return `${(method || 'get').toLocaleLowerCase()}:${url}`;
    }

    private _route (url: string, data = {}, res: ISenerContext, map = this.routers) {
        const route = map[this.fillUrl(url)];
        if (!route) {
            return this.routeTo404(res);
        }
        return route.handler!(Object.assign({}, res, data));
    }

    private _createRoute (res: ISenerContext): IRouterHelper['route'] {
        return (url, data) => {
            const map = this._getMap(url);
            return this._route(url, data, res, map) as any;
        };
    }
}