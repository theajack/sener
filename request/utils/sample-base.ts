/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-25 12:55:30
 * @Description: Coding something
 */
import { Cors, Sener, Router, IMiddleWare } from 'packages/sener';

export function initSenerApp ({
    port,
    router,
    middlewares = []
}: {
    port: number,
    router: Router,
    middlewares?: IMiddleWare[]
}) {
    return new Sener({
        port,
        middlewares: [
            ...middlewares,
            router,
            process.env.NODE_ENV === 'development' ? new Cors() : null,
        ]
    });
}
