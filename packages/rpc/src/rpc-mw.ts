/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:08:04
 * @Description: Coding something
 */

import {  IJson, MiddleWare, ICommonReturn, IMiddleWareEnterData, IPromiseMayBe } from 'sener-types';
import { Request } from './request';

export class RPC extends MiddleWare {
    config: IJson<string>;
    rpc: IJson<Request>;
    constructor (config: IJson<string>) {
        super();
        this.config = config;
        this.rpc = this.create();
    }
    enter (req: IMiddleWareEnterData): IPromiseMayBe<ICommonReturn> {
        req.rpc = this.create(req.logger?.traceid || '');
    }

    private create (traceid = '') {
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
