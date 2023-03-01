/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-25 12:55:30
 * @Description: Coding something
 */
import { Cors, Sener, Router, IMiddleWare } from 'packages/sener';
import { Json } from 'packages/json';

export function initSenerApp ({
    port,
    router,
    json,
    middlewares = []
}: {
    port: number,
    router: Router,
    json: Json,
    middlewares?: IMiddleWare[]
}) {
    return new Sener({
        port,
        middlewares: [
            ...middlewares,
            router,
            json,
            process.env.NODE_ENV === 'development' ? new Cors() : null,
        ]
    });
}
