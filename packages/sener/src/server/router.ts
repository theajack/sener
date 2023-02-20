/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-20 17:23:29
 * @Description: Coding something
 */
import { IJson, IRouterHandler, IMiddleWareRequestData } from '../type';
import { MiddleWare } from '../middleware/middleware';
import { parseUrlSearch } from '../utils';
import { IncomingMessage } from 'http';

export class Router extends MiddleWare {
    routers: IJson<IRouterHandler>;

    constructor (routers: IJson<IRouterHandler>) {
        super();
        this.routers = routers;
    }

    enter (req: Parameters<MiddleWare['enter']>[0]): ReturnType<MiddleWare['enter']> {
        if (!this.isUrlExist(req)) return null;
    }

    response (res: any, req: IMiddleWareRequestData): ReturnType<MiddleWare['response']> {
        const handler = this.getRouterHandler(req);
        if (!handler) return null;
        return handler(req);
    }

    private getRouterHandler ({ method, url }: IMiddleWareRequestData) {
        const name = `${method.toLocaleLowerCase()}:${url}`;
        let handler = this.routers[name];
        if (!handler && method === 'GET') {
            handler = this.routers[url];
        }
        return handler || null;
    }

    private isUrlExist (request: IncomingMessage) {
        const { url } = parseUrlSearch(request.url);
        const method = (request.method || 'get').toLocaleLowerCase();

        const name = `${method}:${url}`;

        return (
            !!this.routers[name] ||
            (method === 'get' && !!this.routers[url])
        );
    }
}