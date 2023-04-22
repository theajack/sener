/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-22 14:38:57
 * @Description: Coding something
 */
import path from 'path';
import { ICommonReturn, IMiddleWareRequestData, MiddleWare, MiddleWareReturn } from 'sener-types';
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

    async request (res: IMiddleWareRequestData): Promise<IMiddleWareRequestData | ICommonReturn> {
        return new Promise(resolve => {
            this.static.serve(res.request, res.response).once('success', () => {
                resolve(MiddleWareReturn.Return);
            }).on('error', data => {
                if (data.status === 404) {
                    resolve(MiddleWareReturn.Continue);
                } else {
                    res.sendResponse({
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