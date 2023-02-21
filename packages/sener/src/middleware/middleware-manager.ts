/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 16:23:58
 * @Description: Coding something
 */
import { IMiddleWareEnterData, IMiddleWareRequestData, IMiddleWareResponseData, IMiddleWareResponseReturn } from '../type';
import { IMiddleWare } from './middleware';

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
                if (result === null) return null;
                else if (result === false) return true;
            }
        }
        return true;
    }

    async applyRequest (req: IMiddleWareRequestData) {
        for (const middleware of this.middlewares) {
            if (middleware.request) {
                const result = await middleware.request(req);
                if (typeof result === 'object') {
                    if (!result) return null;
                    req = result;
                } else if (result === false) {
                    return req;
                }
            }
        }
        return req;
    }

    async applyResponse (
        res: IMiddleWareResponseData
    ): Promise<IMiddleWareResponseReturn|null> {
        let returnValue: IMiddleWareResponseReturn = {
            data: res.data,
            statusCode: res.statusCode,
            headers: res.headers,
        };
        for (const middleware of this.middlewares) {
            if (middleware.response) {
                const result = await middleware.response(res);
                if (typeof result === 'object') {
                    if (!result) return null;
                    returnValue = result;
                } else if (result === false) {
                    return res;
                }
            }
        }
        return returnValue;
    }
}