/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-13 17:02:26
 * @Description: Coding something
 */


import {
    IMiddleWare, MiddleWare, Sener,
    ISenerContext,
    Cors,
} from 'packages/sener';
import { Json } from 'packages/json';
import { Static } from 'packages/static';
import { router } from './router';
import { Log } from 'packages/log/src';
import { Config } from 'packages/config/src';
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
    }
}

function delay (time = 1000) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

const sener = new Sener({
    middlewares: [
        new Cors(),
        new Log(),
        new Static(),
        router,
        testMiddleware,
        // new Test2Middle(),
        new Config({
            initial: [ {
                filename: 'json',
                data: {
                    level: 1,
                }
            }, {
                filename: 'user',
                data: {
                    age: 12
                }
            } ],
            onchange: (({ key, value, prev }) => {
                console.log('onConfigChange', key, value, prev);
            })
        }),
        new Json(),
    ]
});

// const { json, file } = new JsonManager();


// sener.use(router);

// sener.use(testMiddleware, new Test2Middle());

