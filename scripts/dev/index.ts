/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-13 17:02:26
 * @Description: Coding something
 */


import type {
    IMiddleWare,
    ISenerContext } from 'packages/sener';
import { MiddleWare, Sener,
    Cors,
} from 'packages/sener';
import { Json } from 'packages/json';
import { Static } from 'packages/static';
import { router } from './router';
import { Log } from 'packages/log/src';
import { Config } from 'packages/config/src';
import { Proxy } from 'packages/proxy/src';
// console.log('--------', Router);

const testMiddleware: IMiddleWare = {
    async enter (response) {
        // await delay(1000);
        // console.log('testMiddleware', response.data);
        response.data.middle = 'testMiddleware33211';

        // return { data: { a: 1 } };
    }
};

class Test2Middle extends MiddleWare {
    enter (res: ISenerContext) {
        res.data.middle2 = 'Test2Middle';
        res.config.$onChange;
        res.config.age;


        res.logger.log('111');
    }
}

function delay (time = 1000) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

const config = new Config({
    initial: {
        json: {
            level: 1,
        },
        user: {
            age: 12
        },
    },
    onchange: (({ key, value, prev }) => {
        console.log('onConfigChange', key, value, prev);
    })
});

config.data.$onChange;
config.data.age;

const sener = new Sener({
    port: 9030,
    middlewares: [
        new Cors(),
        new Log(),
        new Static(),
        router,
        config,
        testMiddleware,
        // new Test2Middle(),
        new Json(),
        new Proxy({
            // '^/proxy/.*': {
            //     target: 'http://127.0.0.1:3000/',
            //     pathRewrite: url => {
            //         console.log('pathRewrite', url);
            //         return url.replace('/proxy/', '/');
            //     }
            // }

            // '.*': {
            //     target: 'http://127.0.0.1:3000/',
            // }
        }),
    ]
});

declare module 'sener-extend' {
    interface IConfigData {
        level: number,
        age: number,
    }
}

// const { json, file } = new JsonManager();


// sener.use(router);

// sener.use(testMiddleware, new Test2Middle());

