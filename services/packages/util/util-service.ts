/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:55:55
 * @Description: Coding something
 */
import { Form } from 'packages/form';
import { IS_DEV, Router } from 'packages/sener';
import { Static } from 'packages/static/src';
import { sendEmail } from 'services/utils/send-email';
import { initSenerApp } from 'services/utils/sample-base';
import { createSimpleTimeInfo, error, success } from 'services/utils/utils';
import { Json } from 'packages/json/src';
import { Log } from 'packages/log/src';
import { now } from 'packages/types';

const router = new Router({
    'post:/util/img/upload': ({ formData, request, files }) => {
        for (const k in files) {
            const file = files[k] as any;
            const host = request.headers.host || '';
            const head = `http${host.includes('localhost') ? '' : 's'}://${host}/`;
            file.filepath = `${head}${file.filepath.split(
                IS_DEV ? '/public/' : '/data/'
            )[1]}`;
        }
        return success({ formData, files }, '文件上传成功');
    },
    'post:/util/email': async ({ body }) => {
        const { title, message, to, tk } = body;
        if (!title || !message || !to || !tk) {
            return error(`邮件发送失败: 参数错误`, -1);
        }
        const { result, msg } = await sendEmail({
            title,
            message: message,
            to,
            tk,
        });
        if (!result)
            return error(`邮件发送失败:${msg}`, -2);
        return success('邮件发送成功');
    },
    '/util/stat': ({ readMap, query }) => {
        const { name, type } = query;
        const map = readMap('stat');
        const item = map[name];
        if (!item) return error(`应用名不存在 ${name}`, 1);

        if (!type) return success(map);
        if (!item[type]) return error(`type 不存在 ${type}`, 2);
        return success(item[type]);
    },
    'post:/util/stat': ({ write, body }) => {
        const { name, type = 'view' } = body;
        const { save, map } = write('stat');
        if (!name) return error('应用名称不可为空', 1);
        if (type === 'ut' || type === 'ct') return error('ut, ct 为保留字段不可使用', 2);
        const item = map[name];
        if (!item) {
            map[name] = {
                ...createSimpleTimeInfo(),
                [type]: 1,
            };
        } else {
            item.ut = now();
            (typeof item[type] === 'number') ? (item[type] ++) : (item[type] = 0);
        }
        // if (name === 'cnchar') return error('111');
        save({ imme: false });
        return success(`统计[${name}.${type}]成功`);
    }
});

initSenerApp({
    port: 3003,
    router,
    middlewares: [
        new Log({ dir: 'user' }),
        new Static(),
        new Form({
            dir: IS_DEV ? undefined : '/data/images/upload'
        }),
        new Json({ dir: 'util' }),
    ]
});
