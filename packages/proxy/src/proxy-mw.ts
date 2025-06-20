/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-06 21:23:36
 * @Description: Coding something
 */
import type { IHookReturn, IJson, ISenerContext } from 'sener-types';
import { MiddleWare } from 'sener-types';
import type { ServerOptions } from 'http-proxy';
import { createProxyServer } from 'http-proxy';

export type IProxyConfig = ServerOptions & {
    pathRewrite?: (v: string) => string,
    skipProxy?: boolean,
};

export type IProxyMiddleConfig = IJson<IProxyConfig>;

export class Proxy extends MiddleWare {

    proxy: ReturnType<typeof createProxyServer>;

    private _options?: IProxyMiddleConfig;


    constructor (option?: IProxyMiddleConfig|string) {
        super();
        if (typeof option === 'string') {
            option = { '.*': { target: option } };
        }
        this._options = option;
        this.proxy = createProxyServer({});
    }

    init (ctx: ISenerContext): IHookReturn {


        ctx.proxy = (config: IProxyConfig) => {

            if (config.skipProxy) {
                return false;
            }

            if (config.pathRewrite) {
                const rewrite = config.pathRewrite;
                console.log('proxy-debugger', ctx.request.url);
                ctx.request.url = rewrite(ctx.request.url!);
                console.log('proxy-debugger', ctx.request.url);
                // console.log('ctx.request.url', ctx.request.url)
                // delete config.pathRewrite;
            }

            this.proxy.web(ctx.request, ctx.response, config);

            ctx.responded = true;
            ctx.markSended();
            return true;
        };

        ctx._checkProxy = () => {
            return this.checkProxy(ctx);
        };
    }

    private checkProxy (ctx: ISenerContext) {
        const map = this._options;
        if (!map) return false;

        const url = ctx.url;
        // console.log(`checkProxy, url=${url}`, map);

        if (map[url]) {
            // console.log(`checkProxy 命中1, url=${url}`);
            return ctx.proxy(map[url]);
        }

        for (const key in map) {
            if (url.match(new RegExp(key))) {
                // console.log(`checkProxy 命中2, key=${key}`);
                return ctx.proxy(map[key]);
            }
        }
        return false;
    }

    enter (ctx: ISenerContext): IHookReturn {
        this.checkProxy(ctx);
    }

}