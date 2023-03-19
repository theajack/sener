/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:55:55
 * @Description: Coding something
 */
import { Config } from 'packages/config/src';
import { Json } from 'packages/json/src';
import { Log } from 'packages/log/src';
import { Router } from 'packages/sener';
import { RPC } from 'packages/rpc/src';
import { initSenerApp } from '../../utils/sample-base';
import { createServices, IServices } from 'services/request';

const router = new Router({

    '/user/test': async ({ query, services, logger, rpc, config }) => {
        console.log('xx11xxx');
        // const data = await rpc.comment.get('/message', { app: 'cnchar', index: 1, size: 10 });
        const data = await (rpc as IServices).comment.getList();
        console.log(data);
        return { data: query, headers: {}, statusCode: 200 };
        // // const level = config.level;
        // logger.log('$$$test1', 'test');

        // logger.log({
        //     msg: '$$$test2',
        //     payload: { a: 1 },
        //     type: 'error',
        //     level: 9,
        //     // extend: { b: 1 }
        // });
        // const data = await services.comment.getList({
        //     app: 'cnchar'
        // });
        // // console.log('------', data);
        // return data;
    }
});

const config = new Config();


// const rpc = new RPC({
//     comment: 'http://localhost:3001'
// });

const rpc = new RPC(createServices);

config.onConfigChange(data => {
    console.log(data);
});

setTimeout(() => {
    config.writeConfig('level', 9);
}, 4000);
initSenerApp({
    port: 3002,
    router,
    middlewares: [
        rpc,
        config,
        new Log({ dir: 'user', level: config.data.level }),
        new Json({ dir: 'user' }),
    ]
});
