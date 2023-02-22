/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-22 14:38:57
 * @Description: Coding something
 */
import path from 'path';
import { ICommonReturn, IMiddleWareResponseData, IMiddleWareResponseReturn, IPromiseMayBe, MiddleWare } from 'sener-types';
import { StaticServer } from './static-server';

export class Static extends MiddleWare {
    name = 'static';

    dir: string;

    static: StaticServer;

    constructor ({
        dir = './public'
    }: {
        dir: string
    }) {
        super();
        this.dir = path.resolve(process.cwd(), dir);
        this.static = new StaticServer(this.dir);
    }

    // enter (req: IMiddleWareEnterData): IPromiseMayBe<ICommonReturn> {
    //     const url = req.request.url;
    // }

    async response (res: IMiddleWareResponseData): IPromiseMayBe<ICommonReturn | IMiddleWareResponseReturn> {
        return new Promise(resolve => {
            this.static.serve(res.request, res.response).once('success', (data) => {
                resolve(true);
            }).on('error', data => {
                if (data.status === 404) {
                    return null;
                } else {
                    resolve({
                        data: data,
                        statusCode: data.status,
                        'headers': data.headers,
                    });
                }
            });
        });
    }


}