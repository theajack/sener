/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 16:23:58
 * @Description: Coding something
 */
import {
    ISenerContext,
    IMiddleWare,
    IMiddleHookNames,
    MiddleWare,
} from 'sener-types';

export class MiddleWareManager {
    middlewares: (IMiddleWare|MiddleWare)[] = [];

    use (middleware: IMiddleWare|MiddleWare) {
        if (this.middlewares.includes(middleware)) {
            return console.log(`middleware ${middleware.name} is used`);
        }
        this.middlewares.push(middleware);
    }

    remove (middleware: IMiddleWare) {
        const index = this.middlewares.indexOf(middleware);
        if (index !== -1) {
            this.middlewares.slice(index, 1);
        }
    }

    async init (ctx: ISenerContext) {
        for (const middleware of this.middlewares) {
            await this.onSingeHook(middleware, 'init', ctx);
        }
    }

    async enter (ctx: ISenerContext) {
        for (const middleware of this.middlewares) {
            await this.onSingeHook(middleware, 'enter', ctx);
        }
    }

    // 洋葱模型 enter => leave 为倒序
    async leave (ctx: ISenerContext) {
        const ms = this.middlewares;
        for (let i = ms.length - 1; i >= 0; i--) {
            await this.onSingeHook(ms[i], 'leave', ctx);
        }
    }
    private async onSingeHook (middleware: IMiddleWare|MiddleWare, name: IMiddleHookNames, ctx: ISenerContext) {
        if (!middleware[name]) return;
        if (
            (ctx.isOptions && !middleware.acceptOptions) ||
            (ctx.responded && !middleware.acceptResponded) ||
            (ctx.returned && !middleware.acceptReturned)
        ) return;
        // @ts-ignore
        const result = await middleware[name](ctx);
        if (result && typeof result === 'object' && ctx !== result) {
            Object.assign(ctx, result);
        }
    }
}