/*
 * @Author: chenzhongsheng
 * @Date: 2023-04-15 16:04:17
 * @Description: Coding something
 */

import { MiddleWare, IHookReturn, IPromiseMayBe, IJson, ISenerContext } from 'sener-types';
import { Sener } from 'src/sener';
import { IRouter } from './router';

export type IEnvOptions = IJson<((
    ctx: ISenerContext
)=>any) | any>;

export type IEnvMap<T extends IEnvOptions> = {
    [prop in keyof T]: T[prop] extends Function ? ReturnType<T[prop]>: T[prop];
}

export class Env extends MiddleWare {
    map: IEnvOptions;
    constructor (map: IEnvOptions) {
        super();
        this.map = map;
    }
    request (ctx: ISenerContext): IPromiseMayBe<IHookReturn> {
        for (const k in this.map) {
            const v = this.map[k];
            ctx.env[k] = typeof v === 'function' ? v(ctx) : v;
        }
    }
}


const env = {
    uid ({ cookie }: ISenerContext) {
        try {
            return cookie.get('xx');
        } catch (e) {
            return '';
        }
    },
    a: 'ss',
    b: 11,
};
declare module 'sener-types-extend' {
    interface ISenerEnv extends IEnvMap<typeof env> {
    }
}