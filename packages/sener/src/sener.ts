/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-18 15:28:21
 * @Description: Coding something
 */

import { FileManager } from './file/file-manage';
import { IMiddleWare } from './middleware/middleware';
import { Server } from './server/server';
import { ISenerOptions } from './type';

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

    files: FileManager;

    server: Server;

    constructor ({
        port,
        router,
        middlewares = [],
    }: ISenerOptions = {}) {
        this.files = new FileManager();
        this.server = new Server({
            port,
            router,
            helper: {
                file: (name: string) => this.files.file(name),
                oprate: (name: string) => {
                    return this.files.file(name).oprateCustom();
                }
            }
        });
        for (const middleware of middlewares) {
            this.use(middleware);
        }
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