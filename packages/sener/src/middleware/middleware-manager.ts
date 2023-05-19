/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 16:23:58
 * @Description: Coding something
 */
import {
    ISenerContext,
    IMiddleWare,
} from 'sener-types';

export class MiddleWareManager {
    middlewares: IMiddleWare[] = [];

    use (middleware: IMiddleWare) {
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

    async request (ctx: ISenerContext) {
        if (ctx.returned) return;
        for (const middleware of this.middlewares) {
            await this.onSingeHook(middleware, 'request', ctx);
        }
    }

    // 洋葱模型 request => response为倒序
    async response (ctx: ISenerContext) {
        if (ctx.returned) return;
        const ms = this.middlewares;
        for (let i = ms.length - 1; i >= 0; i--) {
            await this.onSingeHook(ms[i], 'response', ctx);
        }
    }

    async enter (ctx: ISenerContext) {
        if (ctx.returned) return;
        for (const middleware of this.middlewares) {
            await this.onSingeHook(middleware, 'enter', ctx);
        }
    }

    private async onSingeHook (middleware: IMiddleWare, name: 'response'|'request'|'enter', ctx: ISenerContext) {
        const hook = middleware[name];
        if (!hook || ctx.returned) return;
        if (
            (ctx.isOptions && !middleware.acceptOptions) ||
            (ctx.responded && !middleware.acceptResponded)
        ) return;
        const result = await hook(ctx);
        if (result && typeof result === 'object' && ctx !== result) {
            Object.assign(ctx, result);
        }
    }
}