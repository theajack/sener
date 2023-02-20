/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-13 17:02:26
 * @Description: Coding something
 */

import { Sener, Router, IMiddleWare, MiddleWare, IMiddleWareResponseData, IPromiseMayBe } from '../../packages/sener';

const testMiddleware: IMiddleWare = {
    async response (response) {
        // await delay(1000);
        response.data.middle = 'testMiddleware33211';

        return { a: 1 };
    }
};

class Test2Middle extends MiddleWare {
    response (res: IMiddleWareResponseData): IPromiseMayBe<(boolean | void | null) | IMiddleWareResponseData> {
        res.data.middle2 = 'Test2Middle';
    }
}

function delay (time = 1000) {
    return new Promise(resolve => {
        setTimeout(resolve, time);
    });
}

const frameWork = new Sener();


const router = new Router({
    'get:/aa': ({ file }) => {
        const data = file('aa').read();
        return { data: data };
    },
    'get:/setaa': async ({ query, file }) => {
        const success = await file('aa').oprate((data) => {
            data.push(query.text);
            return data;
        });
        if (success) {
            return { data: query.text };
        }
        return { data: 'error' };
    },
    'post:/setaa': ({ body, oprate }) => {
        // const success = await file('aa').oprate((data, geneId) => {
        //     body.data.id = geneId();
        //     data.push(body.data);
        //     return data;
        // });
        // return {success, data: body.data};

        const { data, save, id } = oprate('aa');

        console.log('body.data', body);
        id();
        body.data.id = id();
        data.push(body.data);
        save();
        return { data: body.data };
    },
});
frameWork.use(router);

frameWork.use(testMiddleware, new Test2Middle());

