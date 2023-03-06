/*
 * @Author: chenzhongsheng
 * @Date: 2023-03-06 23:27:18
 * @Description: 浏览器中使用的模块 需要单独打包
 */

import { Request } from './request';
interface IJson<T=any> {
    [prop: string]: T;
}
export class WebRPC extends Request {
    constructor (base: string) {
        super({ base, });
    }

    static create = create;
}

export function create (base: string): WebRPC;
export function create (base: IJson<string>): IJson<WebRPC>;
export function create (map: (IJson<string>)|string): IJson<WebRPC>|WebRPC {
    if (typeof map === 'string') return new WebRPC(map);
    const rpc: IJson<Request> = {};
    for (const key in map) {
        const base = map[key];
        rpc[key] = new WebRPC(base);
    }
    return rpc;
}

export default WebRPC;