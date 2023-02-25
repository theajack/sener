/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-22 09:16:23
 * @Description: Coding something
 */
import { Cors, Sener } from 'packages/sener';
import { Json } from 'packages/json';
import { router } from './comment-router';

new Sener({
    port: 3001,
    middlewares: [
        router,
        new Json('comment'),
        process.env.NODE_ENV === 'development' ? new Cors() : null,
    ]
});