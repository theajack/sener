/*
 * @Author: chenzhongsheng
 * @Date: 2023-04-15 16:04:17
 * @Description: Coding something
 */

import { MiddleWare, IJson, ISenerContext } from 'sener-types';
// import { IRouter } from './router';

export type IEnvOptions = IJson<((ctx: ISenerContext)=>any)>;

export type IEnvMap<T extends IJson<((ctx: ISenerContext)=>any)>> = {
    [prop in keyof T]: ReturnType<T[prop]>;
}

export class Env extends MiddleWare {
    map: IEnvOptions;
    constructor (map: IEnvOptions) {
        super();
        this.map = map;
    }
    init (ctx: ISenerContext) {
        for (const k in this.map) {
            const v = this.map[k];
            ctx.env[k] = typeof v === 'function' ? v(ctx) : v;
        }
    }
}

// const env = {
//     uid () {
//         return '11';
//     },
// };

// const data: IEnvMap<typeof env> = {};

// data.uid

// declare module 'sener' {
//     interface ISenerHelper {
//         env: IEnvMap<typeof env>
//     }
//   }


// const envMap: IEnvMap<typeof env> = {};


// const d: IRouter = {
//     'xx': ({ env }) => {
//         env;
//     }
// };