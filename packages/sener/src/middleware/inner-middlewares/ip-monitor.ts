/*
 * @Author: chenzhongsheng
 * @Date: 2023-04-15 16:04:17
 * @Description: Coding something
 */

import { MiddleWare, IJson, ISenerContext, IHookReturn } from 'sener-types';

export interface IIpMonitorOptions {
    range?: number;
    times?: number;
    oncheck?: (ctx: ISenerContext) => boolean;
    handler?: (ctx: ISenerContext) => IHookReturn;
}

export class IpMonitorClient {
    private _store: IJson<number> = {};
    check: (ctx: ISenerContext) => boolean;
    handler?: (ctx: ISenerContext) => any;
    // 默认策略：10s 内访问 30 次被认为高频访问
    constructor ({ times = 30, range = 10, oncheck, handler }: IIpMonitorOptions = {}) {
        this.handler = handler;
        if (oncheck) {
            this.check = oncheck;
        } else {
            setInterval(() => {
                this._store = {};
            }, range * 1000);
            this.check = ({ ip }: ISenerContext) => {
                if (!this._store[ip]) {
                    this._store[ip] = 1;
                } else {
                    this._store[ip]++;
                }
                return this._store[ip] < times;
            };
        }
    }
}

export class IpMonitor extends MiddleWare {
    client: IpMonitorClient;
    constructor (options?: IIpMonitorOptions) {
        super();
        this.client = new IpMonitorClient(options);
    }

    enter (ctx: ISenerContext): IHookReturn {
        if (!this.client.check(ctx)) {
            const h = this.client.handler;
            return h ? h(ctx) : ctx.response404();
        }
    }
}
