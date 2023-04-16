/*
 * @Author: chenzhongsheng
 * @Date: 2023-04-15 16:04:17
 * @Description: Coding something
 */

import { MiddleWare, ICommonReturn, IMiddleWareEnterData, IPromiseMayBe, IJson } from 'sener-types';

export interface IIpMonitorOptions {
    range?: number;
    times?: number;
    oncheck?: ()=>boolean;
}

export class IpMonitorClient {
    private _store: IJson<number> = {};
    private _check: (ip: string) => boolean;
    // 默认策略：10s 内访问 30 次被认为高频访问
    constructor ({ times = 30, range = 10, oncheck }: IIpMonitorOptions = {}) {
        if (oncheck) {
            this._check = oncheck;
        } else {
            setInterval(() => {
                this._store = {};
            }, range * 1000);
            this._check = (ip) => {
                if (!this._store[ip]) {
                    this._store[ip] = 1;
                } else {
                    this._store[ip]++;
                }
                // console.log('ipStore=', this._store);
                return this._store[ip] < times;
            };
        }
    }
    check (ip: string): boolean {
        return this._check(ip);
    }
}

export class IpMonitor extends MiddleWare {
    client: IpMonitorClient;
    constructor (options?: IIpMonitorOptions) {
        super();
        this.client = new IpMonitorClient(options);
    }
    enter ({ ip, send404 }: IMiddleWareEnterData): IPromiseMayBe<ICommonReturn> {
        if (!this.client.check(ip)) {
            send404();
            return false;
        }
    }
}
