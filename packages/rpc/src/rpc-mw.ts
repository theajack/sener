/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:04
 * @Description: Coding something
 */

import { IJson, MiddleWare, ISenerContext } from 'sener-types';
import { Request } from './request';

type IOptions = IJson<string> | ((traceid:string) => IJson<Request|any>);

export class RPC extends MiddleWare {
    config: IOptions;
    rpc: IJson<Request>;
    constructor (config: IOptions) {
        super();
        this.config = config;
        this.rpc = this.create();
    }
    init (req: ISenerContext) {
        req.rpc = this.create(req.logger?.traceid || '');
    }

    private create (traceid = '') {
        if (typeof this.config === 'function') {
            return this.config(traceid);
        }
        const rpc: IJson<Request> = {};
        for (const key in this.config) {
            const base = this.config[key];
            rpc[key] = new Request({
                base,
                traceid
            });
        }
        return rpc;
    }
}
