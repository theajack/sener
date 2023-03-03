/*
 * @Author: chenzhongsheng
 * @Date: 2023-02-21 22:55:55
 * @Description: Coding something
 */
import { Form } from '../../../../packages/form';
import { Router } from 'packages/sener';
import { Static } from 'packages/static/src';
import { sendEmail } from 'request/utils/send-email';
import { initSenerApp } from 'request/utils/sample-base';
import { IEmail } from 'request/types/sample';
import { error, success } from 'request/utils/utils';

const router = new Router({
    'post:/util/img/upload': ({ formData, request, files }) => {
        for (const k in files) {
            const file = files[k] as any;
            file.filepath = `${request.headers.origin}/${file.filepath.split('/public/')[1]}`;
        }
        return success({ formData, files }, '文件上传成功');
    },
    'post:/util/email': async ({ body }) => {
        const { title, message, to } = body as IEmail;
        if (!title || !message || !to) {
            return error(`邮件发送失败: 参数错误`, -1);
        }
        const { result, msg } = await sendEmail({
            title,
            message: message,
            to
        });
        if (!result)
            return error(`邮件发送失败:${msg}`, -2);
        return success('邮件发送成功');
    },
});

initSenerApp({
    port: 3003,
    router,
    middlewares: [
        new Static(),
        new Form(),
    ]
});
