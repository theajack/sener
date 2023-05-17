/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-22 14:38:57
 * @Description: Coding something
 */
import path from 'path';
import { IHookReturn, ISenerContext, MiddleWare, MiddleWareReturn } from 'sener-types';
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
    }

    request (ctx: ISenerContext): Promise<IHookReturn> {
        return new Promise(resolve => {
            this.static.serve(ctx.request, ctx.response).once('success', () => {
                resolve(MiddleWareReturn.Return);
            }).on('error', data => {
                if (data.status === 404) {
                    // console.log('static request data', data)
                    resolve(MiddleWareReturn.Continue);
                } else {
                    ctx.sendResponse({
                        data: data,
                        statusCode: data.status,
                        'headers': data.headers,
                    });
                    resolve(MiddleWareReturn.Return);
                }
            });
        });
    }


}