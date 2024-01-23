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
}

declare module 'sener-extend' {
    interface ISenerHelper extends IRouterHelper {}
}

const REG = /^(post:|get:|put:|delete:|#)/;

function parseFuzzyRouteUrl(url: string): Pick<IRouterHandlerData, 'reg'|'paramMap'> {

    let arr = url.split('/');
    let paramMap: IJson<string> = {}
    for(let i=0;i < arr.length; i++){
        const item = arr[i];
        if(item[0] !== ':') continue;
        let res = item.match(/^:(.*?)(\((.*?)\))?$/i);
        // console.log('res1=', res)
        if(!res) throw new Error(`错误的路由表达式: ${url}`)
        const name = res[1];
        const reg = res[3] || '(.*?)'
        paramMap[i] = name;
        arr[i] = reg;
    }
    return {
        reg: new RegExp(arr.join('/')),
        paramMap,
    }
}
export function createRoute(base: string, route: IRouter): IRouter;
export function createRoute(route: IRouter): IRouter;
export function createRoute(arg1: string|IRouter, arg2?: IRouter): IRouter {

    if(!arg2) return arg1 as IRouter;

    const route = arg2 as IRouter;
    const base = arg1 as string;

    const keys = Object.keys(route);
    const REG = /^(post:|get:|put:|delete:|#)?/;
    for(let key of keys){
        const newKey = key.replace(REG, (head)=>{
            return `${head}${base}`
        })
        route[newKey] = route[key];
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
                    key = this.fillUrl(k);
                    router = value;
                }

                // 模糊匹配的
                if(key.includes('/:')) {
                    Object.assign(router, parseFuzzyRouteUrl(key));
                    this.fuzzyRouters[key] = router;
                }else{
                    this._getMap(key)[key] = router;
                }
            }
        }
        console.log(Object.keys(this.routers))
        // console.log(this.routers, this._privateRouters);
        // console.log('fuzzyRouters =',this.fuzzyRouters);
        
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

        ctx.params = route?.reg ? this._extractFuzzyParam(ctx.url, route as any): {};
    }

    private _extractFuzzyParam(url: string, route: Required<IRouterHandlerData>): IJson{
        const arr = url.split('/');

        const map = route.paramMap;

        let param: IJson = {}
        for(let i in map){
            const name = map[i];
            let v = arr[i as any];
            // : 字符串
            // :# 数字
            // :! 布尔
            if(name[0] === '#'){
                param[name.substring(1)] = parseFloat(v);
            }else if(name[0] === '!'){
                param[name.substring(1)] = v === 'true' || v === '1';
            }else{
                param[name] = v;
            }
        }
        return param;
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
        // console.log('-----', key)
        let res = this.routers[key]; // 如果在普通router内
        if(res) return res;

        // 模糊匹配
        for(let k in this.fuzzyRouters) {
            let router = this.fuzzyRouters[k];
            if(router.reg?.test(key)){
                return router;
            }
        }
        return null;
    }
    private buildRouteKey (url: string, method: string) {
        if (!url.endsWith('/')) url = `${url}/`;
        return `${(method || 'get').toLocaleLowerCase()}:${url}`;
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
            const map = this._getMap(url);
            return this._route(url, data, res, map) as any;
        };
    }
}