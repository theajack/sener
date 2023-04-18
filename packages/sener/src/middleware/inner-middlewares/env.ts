/*
 * @Author: chenzhongsheng
 * @Date: 2023-04-15 16:04:17
 * @Description: Coding something
 */

import { MiddleWare, ICommonReturn, IPromiseMayBe, IJson, IMiddleWareRequestData } from 'sener-types';

export type IEnvOptions = IJson<(
    data: IMiddleWareRequestData
)=>any>;

export class Env extends MiddleWare {
    map: IEnvOptions;
    constructor (map: IEnvOptions) { // todo 有没有办法可以这个支持类型 env.xxx
        super();
        this.map = map;
    }
    request (req: IMiddleWareRequestData): IPromiseMayBe<ICommonReturn | Partial<IMiddleWareRequestData>> {
        for (const k in this.map) {
            req.env[k] = this.map[k](req);
        }
    }
}
