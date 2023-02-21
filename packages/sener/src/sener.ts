/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-18 15:28:21
 * @Description: Coding something
 */
import { IMiddleWare, ISenerOptions } from 'sener-types';
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

    server: Server;

    constructor ({
        port,
        middlewares = [],
    }: ISenerOptions = {}) {
        this.server = new Server({
            port,
        });
        this.use(...middlewares);
    }

    use (...middlewares: IMiddleWare[]) {
        for (const middleware of middlewares) {
            this.server.middleware.use(middleware);
            this.server.injectMiddleWare(middleware);
        };
    }

    remove (middleware: IMiddleWare) {
        this.server.middleware.remove(middleware);
    }
}