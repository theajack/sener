/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-06 21:23:36
 * @Description: Coding something
 */
import { IHookReturn, IJson, ISenerContext, MiddleWare } from 'sener-types';
import { createProxyServer, ServerOptions } from 'http-proxy';

export type IProxyConfig = ServerOptions;

export type IProxyMiddleConfig = IJson<IProxyConfig>;

export class Proxy extends MiddleWare {

    proxy: ReturnType<typeof createProxyServer>;

    private _options?: IProxyMiddleConfig;


    constructor (option?: IProxyMiddleConfig) {
        super();
        this._options = option;
        this.proxy = createProxyServer();
    }

    init (ctx: ISenerContext): IHookReturn {

        ctx.proxy = (config: IProxyConfig) => {
            this.proxy.web(ctx.request, ctx.response, config);
            ctx.responded = true;
        };
    }

    enter (ctx: ISenerContext): IHookReturn {
        const map = this._options;
        if (!map) return;

        const url = ctx.url;

        if (map[url]) {
            ctx.proxy(map[url]);
            return;
        }

        for (const key in map) {
            if (url.match(key)) {
                ctx.proxy(map[key]);
                return;
            }
        }

    }

}