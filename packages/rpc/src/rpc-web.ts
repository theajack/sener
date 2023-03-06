/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-06 23:27:18
 * @Description: 浏览器中使用的模块 需要单独打包
 */

import { IJson } from 'sener-types';
import { Request } from './request';

export class WebRPC extends Request {
    constructor (base: string) {
        super({ base, });
    }

    static create (map: IJson<string>): IJson<WebRPC> {
        const rpc: IJson<Request> = {};
        for (const key in map) {
            const base = map[key];
            rpc[key] = new WebRPC(base);
        }
        return rpc;
    }
}

export default WebRPC;