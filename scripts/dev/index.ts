/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-13 17:02:26
 * @Description: Coding something
 */

import { Sener, Router, IMiddleWare, MiddleWare, IMiddleWareResponseData, IPromiseMayBe } from '../../packages/sener';
import { Json } from 'packages/json';

const testMiddleware: IMiddleWare = {
    async response (response) {
        // await delay(1000);
        // console.log('testMiddleware', response.data);
        response.data.middle = 'testMiddleware33211';

        // return { data: { a: 1 } };
    }
};

class Test2Middle extends MiddleWare {
    response (res: IMiddleWareResponseData): IPromiseMayBe<(boolean | void | null) | IMiddleWareResponseData> {
        res.data.middle2 = 'Test2Middle';
    }
}

const router = new Router({
    'get:/aa': ({ file }) => {
        const data = file('aa').read();
        // console.log('router data', data);
        return { data: data };
    },
    'get:/setaa': async ({ query, json }) => {
        // const success = await file('aa').oprate((data) => {
        //     data.push(query.text);
        //     return data;
        // });
        // if (success) {
        //     return { data: query.text };
        // }
        // return { data: 'error' };

        const { data, save, id } = json('aa');
        // console.log('body.data', query.text);
        data.push({
            ...query,
            id: id(),
        });
        save();
        return { data: data };

    },
    'post:/setaa': ({ body, json }) => {
        // const success = await file('aa').oprate((data, geneId) => {
        //     body.data.id = geneId();
        //     data.push(body.data);
        //     return data;
        // });
        // return {success, data: body.data};

        const { data, save, id } = json('aa');

        console.log('body.data', body);
        body.data.id = id();
        data.push(body.data);
        save();
        return { data: body.data };
    },
});

function delay (time = 1000) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

const sener = new Sener({
    middlewares: [
        router,
        testMiddleware,
        // new Test2Middle(),
        new Json(),
    ]
});

// const { json, file } = new JsonManager();


// sener.use(router);

// sener.use(testMiddleware, new Test2Middle());

