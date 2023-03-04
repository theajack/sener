/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-13 17:02:26
 * @Description: Coding something
 */


import {
    IMiddleWare, MiddleWare, Sener,
    IMiddleWareResponseData,
} from 'packages/sener';
import { Json } from 'packages/json';
import { Static } from 'packages/static';
import { router } from './router';
import { Log } from 'packages/log/src';
// console.log('--------', Router);

const testMiddleware: IMiddleWare = {
    async response (response) {
        // await delay(1000);
        // console.log('testMiddleware', response.data);
        response.data.middle = 'testMiddleware33211';

        // return { data: { a: 1 } };
    }
};

class Test2Middle extends MiddleWare {
    response (res: IMiddleWareResponseData) {
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
        new Log(),
        new Static(),
        router,
        testMiddleware,
        // new Test2Middle(),
        new Json(),
    ]
});

// const { json, file } = new JsonManager();


// sener.use(router);

// sener.use(testMiddleware, new Test2Middle());

