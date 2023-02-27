/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-25 12:55:30
 * @Description: Coding something
 */
import { Cors, Sener, Router } from 'packages/sener';
import { Json } from 'packages/json';

export function initSenerApp ({
    port,
    router,
    json,
}: {
    port: number,
    router: Router,
    json: Json
}) {
    return new Sener({
        port,
        middlewares: [
            router,
            json,
            process.env.NODE_ENV === 'development' ? new Cors() : null,
        ]
    });
}
