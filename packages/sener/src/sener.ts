/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-18 15:28:21
 * @Description: Coding something
 */
import { IMiddleWare, ISenerOptions, senerBaseDir } from 'sener-types';
import { Router } from './middleware/entry';
import { Cookie } from './middleware/inner-middlewares/cookie';
import { Server } from './server/server';


// const framework = new Sener({
//     'get:/aa/bb': (data, tables) => {
//         const table = framework.table('');
//         table.add();
//         return;
//     },
//     'post:/aa/bb': async (data, tables) => {
//         const table = framework.table('');
//         table.add();
//         return {};
//     }
// });

export class Sener {

    static Version = process.env.VERSION;

    server: Server;

    static get Dir () {
        return senerBaseDir();
    }

    static set Dir (v: string) {
        senerBaseDir(v);
    }

    constructor ({
        port,
        router,
        middlewares = [],
        cookieOptions = {},
    }: ISenerOptions & {router?: Router} = {}) {
        this.server = new Server({
            port,
        });
        this.use(
            new Cookie(cookieOptions), // Cookie 中间件默认会带上 且位于第一个
            router, // router要位于最前面 最先进入 最后出
            ...middlewares,
        );
    }

    use (...middlewares: (IMiddleWare|null|undefined)[]) {
        for (const middleware of middlewares) {
            if (!middleware) continue;
            this.server.middleware.use(middleware);
            this.server.injectMiddleWare(middleware);
        };
    }

    remove (middleware: IMiddleWare) {
        this.server.middleware.remove(middleware);
    }
}