/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-22 14:38:57
 * @Description: Coding something
 */
import path from 'path';
import type { IHookReturn, ISenerContext } from 'sener-types';
import { MiddleWare } from 'sener-types';
import type { Options } from './static-server';
import { StaticServer } from './static-server';

export interface IStaticOptions extends Options {
    dir?: string
}

export class Static extends MiddleWare {
    name = 'static';

    dir: string;

    static: StaticServer;

    constructor (options: IStaticOptions = {}) {
        super();
        const dir = options.dir || './public';
        this.dir = path.resolve(process.cwd(), dir);
        this.static = new StaticServer(this.dir, options);
        this.acceptResponded = true;
    }

    enter (ctx: ISenerContext): IHookReturn {
        return new Promise(resolve => {
            this.static.serve(ctx.request, ctx.response).once('success', () => {
                ctx.markSended();
                resolve(void 0);
            }).on('error', data => {
                if (data.status === 404) {
                    // console.log('static request data', data)
                    resolve(void 0);
                } else {
                    resolve(ctx.responseData({
                        data: data,
                        statusCode: data.status,
                        'headers': data.headers,
                    }));
                }
            });
        });
    }
}