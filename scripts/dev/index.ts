/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-13 17:02:26
 * @Description: Coding something
 */


import {
    Router, IMiddleWare, MiddleWare, Sener,
    IMiddleWareResponseData
} from '../../packages/sener';
import { Json } from 'packages/json';
import { Static } from 'packages/static';

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
// @ts-ignore
const router = new Router({
    'get:/aa': ({ read }) => {

        const data = read('aa');
        // console.log('router data', data);
        return { data: data };
    },
    'get:/setaa': async ({ query, write }) => {
        // const success = await file('aa').oprate((data) => {
        //     data.push(query.text);
        //     return data;
        // });
        // if (success) {
        //     return { data: query.text };
        // }
        // return { data: 'error' };

        const { data, save, id } = write('aa');
        // console.log('body.data', query.text);
        data.push({
            ...query,
            id: id(),
        });
        save();
        return { data: data };

    },
    'post:/setaa': ({ body, write }) => {
        // const success = await file('aa').oprate((data, geneId) => {
        //     body.data.id = geneId();
        //     data.push(body.data);
        //     return data;
        // });
        // return {success, data: body.data};

        const { data, save, id } = write('aa');

        console.log('body.data', body);
        body.id = id();
        data.push(body);
        save();
        return { data: body };
    },
});

function delay (time = 1000) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

const sener = new Sener({
    middlewares: [
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

