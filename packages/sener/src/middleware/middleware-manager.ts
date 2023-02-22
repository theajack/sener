/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 16:23:58
 * @Description: Coding something
 */
import {
    IMiddleWareEnterData, IMiddleWareRequestData,
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

    async applyEnter (req: IMiddleWareEnterData) {
        for (const middleware of this.middlewares) {
            if (middleware.enter) {
                const result = await middleware.enter(req);
                if (result && result !== MiddleWareReturn.Continue) {
                    return result;
                }
            }
        }
    }

    async applyRequest (req: IMiddleWareRequestData) {
        for (const middleware of this.middlewares) {
            if (middleware.request) {
                const result = await middleware.request(req);
                if (typeof result === 'object') {
                    req = result;
                } else if (result && result !== MiddleWareReturn.Continue) {
                    return result;
                }
            }
        }
        return req;
    }

    async applyResponse (
        res: IMiddleWareResponseData
    ): Promise<IMiddleWareResponseReturn|null> {
        for (const middleware of this.middlewares) {
            if (middleware.response) {
                const result = await middleware.response(res);
                if (typeof result === 'object') {
                    if (!result) return null;
                    Object.assign(res, result);
                } else if (result === false) {
                    return res;
                }
            }
        }
        return res;
    }
}