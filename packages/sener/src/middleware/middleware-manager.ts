/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 16:23:58
 * @Description: Coding something
 */
import {
    IMiddleWareRequestData,
    IMiddleWareResponseData, IMiddleWareResponseReturn,
    IMiddleWare,
    MiddleWareReturn
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

    async applyEnter (req: IMiddleWareRequestData) {
        for (const middleware of this.middlewares) {
            if (!middleware.enter) continue;
            const result = await middleware.enter(req);
            if (result && typeof result === 'object') {
                if (req !== result) Object.assign(req, result);
            }
        }
    }

    async applyRequest (req: IMiddleWareRequestData) {
        for (const middleware of this.middlewares) {
            if (!middleware.request) continue;
            // console.log(middleware.name);
            const result = await middleware.request(req);
            if (result === false) return null;
            if (!result || result === MiddleWareReturn.Continue) continue;
            if (typeof result === 'object') {
                if (req !== result) Object.assign(req, result);
            } else if (result === MiddleWareReturn.Return) {
                return null;
            } else {
                break;
            }
        }
        return req;
    }

    // 洋葱模型 entry=>request => response为倒序
    async applyResponse (
        res: IMiddleWareResponseData
    ): Promise<IMiddleWareResponseReturn|null> {
        const ms = this.middlewares;
        for (let i = ms.length - 1; i >= 0; i--) {
            const middleware = ms[i];
            if (!middleware.response) continue;
            const result = await middleware.response(res);
            if (result === false) return null;
            if (!result || result === MiddleWareReturn.Continue) continue;
            if (typeof result === 'object') {
                if (res !== result) Object.assign(res, result);
            } else if (result === MiddleWareReturn.Return) {
                return null;
            } else {
                break;
            }
        }
        return res;
    }

    async applyLeave (
        res: IMiddleWareResponseData
    ) {
        const ms = this.middlewares;
        for (let i = ms.length - 1; i >= 0; i--) {
            const middleware = ms[i];
            if (!middleware.leave) continue;
            const result = await middleware.leave(res);
            if (result && typeof result === 'object') {
                if (res !== result) Object.assign(res, result);
            }
        }
    }
}