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

            if (config.pathRewrite) {
                const rewrite = config.pathRewrite;
                ctx.request.url = rewrite(ctx.request.url!);
                delete config.pathRewrite;
            }

            this.proxy.web(ctx.request, ctx.response, config);

            ctx.responded = true;
            ctx.markSended();
        };

        ctx._checkProxy = () => {
            return this.checkProxy(ctx);
        };
    }

    private checkProxy (ctx: ISenerContext) {
        const map = this._options;
        if (!map) return false;

        const url = ctx.url;

        if (map[url]) {
            // console.log(`proxy 命中 ${url}`);
            ctx.proxy(map[url]);
            return true;
        }

        for (const key in map) {
            if (url.match(new RegExp(key))) {
                ctx.proxy(map[key]);
                return true;
            }
        }
        return false;
    }

    enter (ctx: ISenerContext): IHookReturn {
        this.checkProxy(ctx);
    }

}