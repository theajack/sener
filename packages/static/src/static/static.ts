/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-22 14:38:57
 * @Description: Coding something
 */
import path from 'path';
import { IHookReturn, ISenerContext, MiddleWare } from 'sener-types';
import { StaticServer } from './static-server';

export class Static extends MiddleWare {
    name = 'static';

    dir: string;

    static: StaticServer;

    constructor ({
        dir = './public'
    }: {
        dir?: string
    } = {}) {
        super();
        this.dir = path.resolve(process.cwd(), dir);
        this.static = new StaticServer(this.dir);
        this.acceptResponded = true;
    }

    enter (ctx: ISenerContext): IHookReturn {
        return new Promise(resolve => {
            this.static.serve(ctx.request, ctx.response).once('success', () => {
                ctx.markReturned();
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