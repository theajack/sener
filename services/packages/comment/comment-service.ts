/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:55:55
 * @Description: Coding something
 */
import { Json } from 'packages/json/src';
import { Log } from 'packages/log/src';
import { Router } from 'packages/sener';
import { initSenerApp } from '../../utils/sample-base';
import { createTimeInfo, error, success } from '../../utils/utils';

function getComment ({ query, read }: any) {
    const { index, size, all, app } = query;
    if (!app) return error(`app不能为空`);
    const data = read(app);
    if (all === 'true') {
        return success(data);
    }
    const i = parseInt(index);
    const s = parseInt(size);

    if (Number.isNaN(i) || Number.isNaN(s)) {
        return error(`参数类型错误index=${index}, size=${size}`);
    }
    const start = (i - 1) * s;
    return success(data.slice(start, start + s));
}

function addComment ({ body, write }: any) {
    const { app, contact, content, name } = body;
    // console.log(body, app);
    if (!app) return error(`app不能为空`);
    const { data, save, id } = write(app);
    data.unshift({
        contact,
        content,
        name,
        id: id(),
        reply: [],
        ...createTimeInfo(),
    });
    save();
    // console.log('return', data.length);
    return success();
}

function addReply ({ body, write }: any) {
    const { app, commentId, contact, content, name } = body;
    if (!app) return error(`app不能为空`);
    const { data, save } = write(app);
    const comment = data.find((item: any) => item.id === commentId);
    if (!comment) return error(`错误的commentId: ${commentId}`);

    comment.reply.unshift({
        contact,
        content,
        name,
        ...createTimeInfo(),
    });
    save();
    return success();
}

const router = new Router({
    '/message': ({ query, read, logger }) => {
        logger.log('$$$message', query);
        return getComment({ query, read });
    },
    'post:/message': async ({ body, write }) => addComment({ body, write }),
    'post:/message/reply': ({ body, write }) => addReply({ body, write }),

    '/comment/cnchar': ({ query, read }) => {
        query.app = 'cnchar';
        return getComment({ query, read });
    },
    'post:/comment/cnchar': ({ body, write }) => {
        // console.log(body, requestHeaders, url);
        body.app = 'cnchar';
        return addComment({ body, write });
    },
    'post:/reply/cnchar': ({ body, write }) => {
        body.app = 'cnchar';
        return addReply({ body, write });
    }
});

initSenerApp({
    port: 3001,
    router,
    middlewares: [
        new Log({ dir: 'comment' }),
        new Json({ dir: 'comment' })
    ]
});