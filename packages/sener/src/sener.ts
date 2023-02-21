/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-18 15:28:21
 * @Description: Coding something
 */
import { ISenerPlugins } from 'sener-types-extend';
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

    plugins: ISenerPlugins;

    constructor ({
        port,
        router,
        middlewares = [],
    }: ISenerOptions = {}) {
        this.server = new Server({
            port,
            router,
        });
        for (const middleware of middlewares) {
            this.use(middleware);
        }
    }

    install () {

    }

    use (...middlewares: IMiddleWare[]) {
        middlewares.forEach(middleware => {
            this.server.middleware.use(middleware);
        });
    }

    remove (middleware: IMiddleWare) {
        this.server.middleware.remove(middleware);
    }
}